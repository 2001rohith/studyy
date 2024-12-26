import { useState, useEffect } from 'react';
import TeacherSidebar from '../components/TeacherSidebar'
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../axiourl';
import { useUser } from "../../UserContext"

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Accept': 'application/json',
    },
});


const TeacherEditModule = () => {
    const { user,token } = useUser();
    const navigate = useNavigate()
    const location = useLocation()
    const mod = location.state?.module
    const course = location.state?.course
    const moduleId = location.state?.module._id
    const [title, setTitle] = useState(mod.title);
    const [description, setDescription] = useState(mod.description);

    const [pdfFile, setPdfFile] = useState(null);
    const [videoFile, setVideFile] = useState(null)
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setPdfFile(e.target.files[0]);
    };
    const handleVideoFileChange = (e) => {
        setVideFile(e.target.files[0])
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
      

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('pdf', pdfFile);
        formData.append("video", videoFile)

        try {
            setLoading(true);

            const response = await apiClient.put(`/course/teacher-edit-module/${moduleId}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

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
                            <form onSubmit={handleSubmit}>
                                <label>Title:</label>
                                <input className='form-control' type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                                <label>Description:</label>
                                <textarea className='form-control' placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                                <label>Upload PDF:</label>
                                <input
                                    className='form-control'
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
                                <button className='btn btn-secondary button mb-3' type="submit">Save</button>
                            </form>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TeacherEditModule;

