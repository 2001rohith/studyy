import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import { useLocation, useNavigate } from 'react-router-dom';
import TeacherSidebar from '../components/TeacherSidebar';
import '../css/TeacherLiveClass.css';
import io from 'socket.io-client';

const socket = io('http://localhost:8000');

function TeacherLiveClass() {
    const [peerId, setPeerId] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const remoteVideoRef = useRef(null);
    const currentUserVideoRef = useRef(null);
    const peerInstance = useRef(null);
    const [stream, setStream] = useState(null);
    // const [socket, setSocket] = useState(null);
    const [studentStreams, setStudentStreams] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showModal, setShowModal] = useState(false)
    const [hasUnread, setHasUnread] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const classId = location.state?.classId;
    const courseId = location.state?.classId;
    const userName = "Teacher"

    useEffect(() => {
        socket.emit('join-class', classId)

        socket.on('receive-message', (messageData) => {
            setMessages((prevMessages) => [...prevMessages, messageData]);
            setHasUnread(true)
        });

        return () => {
            socket.off('receive-message');
        };
    }, [classId]);

    const sendMessage = () => {
        if (newMessage.trim() === '') return;

        socket.emit('send-message', { classId, userName, message: newMessage });
        // setMessages((prevMessages) => [...prevMessages, { userName, message: newMessage }]);
        setNewMessage('');
    };

    const sendPeerIdToBackend = async (Id) => {
        try {
            const response = await fetch(`http://localhost:8000/course/add-peerid/${classId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ peerId: Id }),
            });

            if (response.ok) {
                console.log('Peer ID saved successfully');
            } else {
                console.error('Failed to save Peer ID');
            }
        } catch (error) {
            console.error('Error saving Peer ID:', error);
        }
    };

    const startSelfVideo = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            currentUserVideoRef.current.srcObject = mediaStream;

            await new Promise((resolve, reject) => {
                const videoElement = currentUserVideoRef.current;

                const onLoadedMetadata = () => {
                    videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
                    resolve();
                };

                videoElement.addEventListener('loadedmetadata', onLoadedMetadata);

                setTimeout(() => reject('Video metadata loading timed out'), 5000);
            });

            try {
                await currentUserVideoRef.current.play();
            } catch (err) {
                console.error('Error playing video:', err);
            }

            setStream(mediaStream);
            return mediaStream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
        }
    };

    useEffect(() => {
        const peer = new Peer();

        peer.on('open', (id) => {
            setPeerId(id);
            console.log("current peerId:", id)
            sendPeerIdToBackend(id);
        });

        peer.on('call', (call) => {
            startSelfVideo().then((mediaStream) => {
                call.answer(mediaStream);
                call.on('stream', (remoteStream) => {
                    const studentPeerId = call.peer;

                    setStudentStreams((prevStreams) => {
                        if (!prevStreams.some((streamObj) => streamObj.peerId === studentPeerId)) {
                            return [...prevStreams, { peerId: studentPeerId, stream: remoteStream }];
                        }
                        return prevStreams;
                    });
                });
                peer.on('call', (call) => {
                    startSelfVideo().then((mediaStream) => {
                        call.answer(mediaStream);
                        call.on('stream', (remoteStream) => {
                            const studentPeerId = call.peer;

                            setStudentStreams((prevStreams) => {
                                if (!prevStreams.some((streamObj) => streamObj.peerId === studentPeerId)) {
                                    return [...prevStreams, { peerId: studentPeerId, stream: remoteStream }];
                                }
                                return prevStreams;
                            });
                        });
                        call.on('close', () => {
                            setStudentStreams((prevStreams) =>
                                prevStreams.filter((streamObj) => streamObj.peerId !== call.peer)
                            );
                            console.log(`Student with peerId ${call.peer} disconnected`);
                        });

                    });
                });

            });
        });

        peerInstance.current = peer;

        startSelfVideo();

        // Listen for the `remove-student` event from the server
        peer.on('remove-student', (peerId) => {
            setStudentStreams((prevStreams) =>
                prevStreams.filter((streamObj) => streamObj.peerId !== peerId)
            );
            console.log(`Student with peerId ${peerId} removed from UI`);
        });

        // Cleanup the socket listener when the component unmounts
        return () => {
            peer.off('remove-student');
        };
    }, []);

    const callStudents = (studentPeerIds) => {
        startSelfVideo().then((mediaStream) => {
            studentPeerIds.forEach((studentPeerId) => {
                const call = peerInstance.current.call(studentPeerId, mediaStream);
                call.on('stream', (remoteStream) => {
                    setStudentStreams((prevStreams) => [
                        ...prevStreams,
                        { peerId: studentPeerId, stream: remoteStream },
                    ]);
                });
            });
        }).catch(err => console.error("Error starting self video: ", err));
    };

    const handleEndClass = async () => {
        try {
            if (stream) {
                stream.getTracks().forEach((track) => {
                    track.stop();
                    console.log(`Track stopped: ${track.kind}`);
                });
                setStream(null);
            }

            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoInputDevices = devices.filter((device) => device.kind === "videoinput");

                if (videoInputDevices.length) {
                    const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    tempStream.getTracks().forEach((track) => track.stop());
                }
            }

            // Stop all remote video tracks
            if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
                const remoteStream = remoteVideoRef.current.srcObject;
                remoteStream.getTracks().forEach((track) => {
                    track.stop(); // Stop the remote stream tracks
                });
            }

            // Close the PeerJS connection
            if (peerInstance.current) {
                peerInstance.current.disconnect();
                peerInstance.current = null; // Clear the PeerJS reference
            }

            // Reset the video elements to ensure they do not show frozen frames
            if (currentUserVideoRef.current) {
                currentUserVideoRef.current.srcObject = null; // Clear the teacher's video source
            }
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null; // Clear the student's video source
            }

            socket.emit('end-live-class', { classId });

            // Navigate to the teacher's classes view
            navigate("/teacher-view-class-course", { replace: true });
        } catch (error) {
            console.error("Error during class cleanup:", error);
        }
    };



    // Toggle mute
    const toggleMute = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0]; // Get the first audio track (mic)

            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled; // Toggle the 'enabled' property of the audio track
                setIsMuted(!audioTrack.enabled); // Update the mute state accordingly
            }
        }
    };

    // Toggle camera
    const toggleCamera = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsCameraOff(!isCameraOff);
        }
    };

    const toggleMessage = () => {
        setHasUnread(false)
        setShowModal(!showModal);
    };

    return (
        <div className="live-class-page">
            <TeacherSidebar />
            <div className="live-class-content">
                <header className="live-class-header">
                    <h3 className='mb-5 mt-2'>Live Class</h3>
                </header>

                <div className="video-section row">
                    <div className='col teacher-video-section'>
                        <video ref={currentUserVideoRef} className="teacher-video me-2" />
                    </div>
                    <div className='col student-video-section'>
                        {studentStreams.map(({ peerId, stream }) => (
                            <div key={peerId} className="student-video-container">
                                <video
                                    ref={(el) => {
                                        if (el) {
                                            el.srcObject = stream;
                                            el.play().catch(err => console.error("Error playing remote video:", err));
                                        }
                                    }}
                                    className="student-video"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="controls-bar">
                    <button onClick={handleEndClass} className="control-btn end-call">
                        <i className="fa-solid fa-phone"></i>
                    </button>
                    <button onClick={toggleCamera} className="control-btn">
                        <i className={`fa-solid ${isCameraOff ? 'fa-video-slash' : 'fa-video'}`}></i>
                    </button>
                    <button onClick={toggleMute} className="control-btn">
                        <i className={`fa-solid ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
                    </button>
                    <button onClick={toggleMessage} className="control-btn">
                        <i class="fa-solid fa-comment"></i>
                        {hasUnread && <p className="class-red-dot"></p>}
                    </button>
                    {/* <div>
                    <a href="#!" onClick={toggleMessage} className="sidebar-item">
                    <i class="fa-solid fa-comment"></i>
                        {hasUnread && <span className="class-red-dot"></span>}
                    </a>
                    </div> */}
                </div>
                {showModal && (
                    <div className="modal fade show d-block live-chat-modal" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <div className="modal-dialog modal-dialog-scrollable">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Class Chat</h5>
                                    <button type="button" className="btn-close" onClick={toggleMessage}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="chat-container">
                                        <div className="chat-box">
                                            {messages.map((msg, index) => (
                                                <div
                                                    key={index}
                                                    className="border-bottom py-2"
                                                >
                                                    <strong>{msg.userName}: </strong>
                                                    {msg.message}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <div className="chat-input w-100 d-flex">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            className="form-control"
                                        />
                                        <button onClick={sendMessage} className="btn live-chat-button table-button ms-2">
                                            Send
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TeacherLiveClass;