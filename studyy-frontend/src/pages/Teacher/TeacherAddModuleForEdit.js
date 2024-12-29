import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TeacherSidebar from '../components/TeacherSidebar';
import { useApiClient } from "../../utils/apiClient"
import API_URL from '../../axiourl';
import { useUser } from "../../UserContext"



function TeacherAddModuleForEdit() {
    const apiClient = useApiClient()
    const location = useLocation();
    const navigate = useNavigate();
    const courseId = location.state?.courseId;
    const course = location.state?.course;
    const { user,token } = useUser();
    const [showToast, setShowToast] = useState(false)
    const [message, setMessage] = useState("")
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [moduleVideoFile, setModuleVideoFile] = useState(null)
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setPdfFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!pdfFile) {
            alert("Please select a PDF file to upload");
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('courseId', courseId);
        formData.append('pdf', pdfFile);
        formData.append("video", moduleVideoFile)

        try {
            setLoading(true);
            
            const response = await apiClient.post(`/course/teacher-add-module`, formData);

            const data = response.data;
            if (response.status === 200) {
                setMessage(data.message)
                setShowToast(!showToast)
                setTimeout(() => {
                    navigate(`/teacher-edit-course`, { state: { id: courseId, course } });
                }, 2000);
            } else {
                alert(data.message || "Failed to add module");
            }
        } catch (error) {
            console.log("Error uploading module", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        < >
            <div className='row'>
                <div className='col text-light side-bar'>
                    <TeacherSidebar />
                </div>
                <div className='col text-light '>
                    <div className='row headers'>
                        <h4>Courses</h4>
                    </div>
                    <div className='row content'>
                        <div className='other-forms'>
                            <h5 className='mb-5'>Add Module</h5>
                            <form onSubmit={handleSubmit}>
                                <label>Title:</label>
                                <input
                                    className='form-control'
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                                <label>Description:</label>
                                <textarea className='form-control'
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                                <label>Upload PDF:</label>
                                <input
                                    className='form-control'
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    required
                                />
                                <label>Upload Video:</label>
                                <input
                                    className="form-control mb-3"
                                    type="file"
                                    accept="video/mp4"
                                    onChange={(e) => setModuleVideoFile(e.target.files[0])}
                                    required
                                />
                                <button className='btn btn-secondary' type="submit" disabled={loading}>
                                    {loading ? 'Uploading...' : 'Add Module'}</button>
                            </form>
                            {showToast && (
                                <div className="toast show position-fixed  bottom-0 end-0 m-3" style={{ borderRadius: "15px", backgroundColor: "#0056b3", color: "white" }}>
                                    <div className="toast-body">
                                        {message}
                                        <button type="button" className="btn-close ms-2 mb-1" onClick={() => setShowToast(false)}></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default TeacherAddModuleForEdit;
