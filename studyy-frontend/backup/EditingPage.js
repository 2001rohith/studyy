import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import { useLocation, useNavigate } from 'react-router-dom';
import TeacherSidebar from '../components/TeacherSidebar';
import '../TeacherLiveClass.css';

function TeacherLiveClass() {
    const [peerId, setPeerId] = useState('');
    const [remotePeerIdValue, setRemotePeerIdValue] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const remoteVideoRef = useRef(null);
    const currentUserVideoRef = useRef(null);
    const peerInstance = useRef(null);
    const [stream, setStream] = useState(null);
    const [socket, setSocket] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const classId = location.state?.classId;
    const courseId = location.state?.classId;

    // Function to show self-video before calling anyone
    const startSelfVideo = async () => {
        try {
            // Get the user's media (video and audio)
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Set the local media stream to the current user's video element
            currentUserVideoRef.current.srcObject = mediaStream;

            // Wait for the video element to be ready
            await new Promise((resolve, reject) => {
                const videoElement = currentUserVideoRef.current;

                // Resolve when video metadata is loaded
                const onLoadedMetadata = () => {
                    videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
                    resolve();
                };

                videoElement.addEventListener('loadedmetadata', onLoadedMetadata);

                // Reject after a timeout in case of an error
                setTimeout(() => reject('Video metadata loading timed out'), 5000);
            });

            // Play the video only once the metadata is loaded
            try {
                await currentUserVideoRef.current.play();
            } catch (err) {
                console.error('Error playing video:', err);
            }

            setStream(mediaStream); // Store the stream in state
            return mediaStream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
        }
    };

    // Handle the peer connection and incoming call
    useEffect(() => {
        const peer = new Peer();

        peer.on('open', (id) => {
            setPeerId(id);
        });

        peer.on('call', (call) => {
            startSelfVideo().then((mediaStream) => {
                call.answer(mediaStream); // Answer the incoming call with the media stream
                call.on('stream', (remoteStream) => {
                    remoteVideoRef.current.srcObject = remoteStream;

                    // Handle the play() properly by ensuring the video is ready
                    const videoElement = remoteVideoRef.current;

                    // Event listener to wait for metadata to be loaded
                    videoElement.onloadedmetadata = () => {
                        try {
                            // Play the video only after metadata is loaded
                            videoElement.play().catch((err) => {
                                console.error("Error trying to play remote video: ", err);
                            });
                        } catch (err) {
                            console.error("Error playing video: ", err);
                        }
                    };
                });
            });
        });

        peerInstance.current = peer;

        // Start the local video as soon as the component is mounted
        startSelfVideo();

    }, []);

    const call = (remotePeerId) => {
        startSelfVideo().then((mediaStream) => {
            const call = peerInstance.current.call(remotePeerId, mediaStream);
            call.on('stream', (remoteStream) => {
                const videoElement = remoteVideoRef.current;
                videoElement.srcObject = remoteStream;

                // Event listener to wait for metadata to be loaded
                videoElement.onloadedmetadata = () => {
                    try {
                        // Play the video only after metadata is loaded
                        videoElement.play().catch((err) => {
                            console.error("Error trying to play remote video: ", err);
                        });
                    } catch (err) {
                        console.error("Error playing video: ", err);
                    }
                };
            });
        }).catch(err => console.error("Error starting self video: ", err));
    };

    // End the class
    const handleEndClass = () => {
        if (socket) {
            socket.emit("end-class", { classId });
            socket.disconnect();
        }

        if (stream) stream.getTracks().forEach(track => track.stop()); // Stop all media tracks
        if (peerConnection) peerConnection.close(); // Close the peer connection

        // Navigate to the teacher's class view page
        navigate("/teacher-view-classes", { state: { id: courseId }, replace: true });
    };

    // Toggle mute
    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
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

    return (
        <div className="live-class-page">
            <TeacherSidebar />
            <div className="live-class-content">
                <header className="live-class-header">
                    <h4>Live Class</h4>
                    <h2>Live - Physics</h2>
                    <h1>Current user id is {peerId}</h1>
                    <input
                        type="text"
                        value={remotePeerIdValue}
                        onChange={(e) => setRemotePeerIdValue(e.target.value)}
                    />
                    <button onClick={() => call(remotePeerIdValue)}>Call</button>
                </header>

                <div className="video-section">
                    <video ref={currentUserVideoRef} className="video" />
                    <video ref={remoteVideoRef} className="video" />
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
                </div>

                {/* <div className="chat-section">
                    <div className="chat-box" ref={chatRef}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`chat-message ${msg.sender === "Teacher" ? "teacher-message" : "student-message"}`}
                            >
                                <strong>{msg.sender}:</strong> {msg.text}
                            </div>
                        ))}
                    </div>
                    <div className="chat-input">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                </div> */}
            </div>
        </div>
    );
}

export default TeacherLiveClass;
