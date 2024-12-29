import { useState, useEffect } from 'react';
import TeacherSidebar from '../components/TeacherSidebar'
import { useLocation, useNavigate } from 'react-router-dom';
import { useApiClient } from "../../utils/apiClient"
import API_URL from '../../axiourl';
import { useUser } from "../../UserContext"




const TeacherEditModule = () => {
    const apiClient = useApiClient()

    const { user, token } = useUser();
    const navigate = useNavigate()
    const location = useLocation()
    const mod = location.state?.module
    const course = location.state?.course
    const [moduleId,setModuleId] = useState(location.state?.module._id)
    // const moduleId = location.state?.module._id
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [pdfFile, setPdfFile] = useState(null);
    const [videoFile, setVideFile] = useState(null)
    const [modulee, setModule] = useState()
    const [showModal, setShowModal] = useState(false)
    const [contentType, setContentType] = useState("")
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setPdfFile(e.target.files[0]);
    };
    const handleVideoFileChange = (e) => {
        setVideFile(e.target.files[0])
    }

    useEffect(() => {
        const getModule = async () => {
            try {
                const response = await apiClient.get(`/course/get-module-data/${moduleId}`)
                const data = response.data
                console.log("data:",data)
                if (response.status === 200) {
                    console.log("module data:", data.module)
                    setModule(data.module)
                    setTitle(data.module.title)
                    setDescription(data.module.description)
                    
                }
            } catch (error) {
                console.log("Error fetching module:", error);
            }
        }
        getModule()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('pdf', pdfFile);
        formData.append("video", videoFile)

        try {
            setLoading(true);

            const response = await apiClient.put(`/course/teacher-edit-module/${moduleId}`, formData);

            const data = response.data;
            if (response.status === 200) {
                alert("Module updated successfully");
                navigate("/teacher-edit-course", { state: { course } })
            } else {
                alert(data.message || "Failed to add module");
            }
        } catch (error) {
            console.log("Error uploading module", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewPDF = () => {
        if (!modulee) return
        const backendOrigin = `${API_URL}`;
        const formattedPath = `${backendOrigin}/${modulee.pdfPath.replace(/\\/g, '/')}`.replace(/^\/+/, "");
        setContentType("pdf")
        setShowModal(true);
    };
    const handleViewVideo = () => {
        if (!modulee) return
        const backendOrigin = `${API_URL}`;
        const videoPath = `${backendOrigin}/${modulee.videoPath.replace(/\\/g, '/')}`.replace(/^\/+/, "");
        setContentType("video")
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setContentType("")
    };

    return (
        <>
            <div className='row'>
                <div className='col text-light side-bar'>
                    <TeacherSidebar />
                </div>
                <div className='col text-light '>
                    <div className='row headers'>
                        <h4>Courses</h4>
                    </div>
                    <div className='row content forms'>
                        <div className='other-forms'>
                            <h5 className='mb-5'>Edit Module</h5>
                            < >
                                <label>Title:</label>
                                <input className='form-control' type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                                <label>Description:</label>
                                <textarea className='form-control' placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                                <button className='btn table-button me-2' onClick={handleViewPDF}>Pdf</button>
                                <button className='btn table-button' onClick={handleViewVideo}>Video</button>
                                <br />
                                <label className='mt-2'>Upload PDF:</label>
                                <input
                                    className='form-control mt-2'
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}

                                />
                                <label>Upload Video:</label>
                                <input
                                    className='form-control'
                                    type="file"
                                    accept="video/mp4"
                                    onChange={handleVideoFileChange}
                                />
                                <button className='btn btn-secondary button mb-3' onClick={handleSubmit}>Save</button>
                            </>
                        </div>
                    </div>
                </div>
            </div>
            {modulee && showModal && (
                <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body">
                                {contentType === "pdf" ? (
                                    <iframe
                                        src={`${API_URL}/${modulee.pdfPath.replace(/\\/g, '/')}`.replace(/^\/+/, "")} title={modulee.title}
                                        style={{ width: '100%', height: '500px' }}
                                        frameBorder="0"
                                    ></iframe>
                                ) : (
                                    <video
                                        controls
                                        src={`${API_URL}/${modulee.videoPath.replace(/\\/g, '/')}`.replace(/^\/+/, "")}
                                        style={{ width: '100%' }}
                                    />
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TeacherEditModule;

