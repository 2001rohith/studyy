import { useState } from 'react';
import TeacherSidebar from '../components/TeacherSidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApiClient } from "../../utils/apiClient"
import API_URL from '../../axiourl';
import { useUser } from "../../UserContext"
import { Upload } from 'lucide-react';

const TeacherAddCourse = () => {
    const apiClient = useApiClient()
    const location = useLocation();
    const navigate = useNavigate();
    const { user, token } = useUser();
    const userId = user.id;

    // Course-related states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [courseId, setCourseId] = useState(null);
    const [courseLoading, setCourseLoading] = useState(false);

    // Module-related states
    const [moduleTitle, setModuleTitle] = useState('');
    const [moduleDescription, setModuleDescription] = useState('');
    const [moduleFile, setModuleFile] = useState(null);
    const [moduleVideoFile, setModuleVideoFile] = useState(null);
    const [moduleLoading, setModuleLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({
        pdf: 0,
        video: 0
    });
    const [fileNames, setFileNames] = useState({
        pdf: '',
        video: ''
    });

    // Handle file changes
    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (type === 'pdf') {
            setModuleFile(file);
            setFileNames(prev => ({ ...prev, pdf: file.name }));
        } else {
            setModuleVideoFile(file);
            setFileNames(prev => ({ ...prev, video: file.name }));
        }
        setUploadProgress(prev => ({ ...prev, [type]: 0 }));
    };

    // Handle course creation
    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        const trimmedTitle = title.trim();
        const trimmedDescription = description.trim();

        if (!trimmedTitle || !trimmedDescription) {
            setMessage("Please provide valid course details.");
            return;
        }

        try {
            setCourseLoading(true);
            const response = await apiClient.post(`/course/create`, { 
                title: trimmedTitle, 
                description: trimmedDescription, 
                userId 
            });

            const data = response.data;
            if (response.status === 200) {
                setMessage("Course created successfully.");
                setCourseId(data.course._id)
            } 
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.message || "An error occurred");
            }
            console.error('Error creating course:', error);
        } finally {
            setCourseLoading(false);
        }
    };

    const handleModuleSubmit = async (e) => {
        e.preventDefault();

        if (!moduleFile || !courseId) {
            setMessage("Please create a course first and upload a PDF file.");
            return;
        }

        const formData = new FormData();
        formData.append('title', moduleTitle);
        formData.append('description', moduleDescription);
        formData.append('courseId', courseId);
        formData.append('pdf', moduleFile);
        formData.append("video", moduleVideoFile);

        try {
            setModuleLoading(true);
            const response = await apiClient.post(
                `/course/teacher-add-module`, 
                formData,
                {
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(prev => ({
                            pdf: moduleFile ? percentCompleted : 0,
                            video: moduleVideoFile ? percentCompleted : 0
                        }));
                    }
                }
            );

            const data = response.data;
            if (response.status === 200) {
                setMessage("Module added successfully.");
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            console.error('Error adding module:', error);
            setMessage("Error occurred while adding the module.");
        } finally {
            setModuleLoading(false);
        }
    };

    return (
        <>
            <div className="row">
                <div className="col text-light side-bar">
                    <TeacherSidebar />
                </div>
                <div className="col text-light ms-2">
                    <div className="row mb-4 headers">
                        <h4>Courses</h4>
                    </div>

                    <div className="row add-course-forms">
                        <div className="col-md-6 text-dark first-form">
                            <h5 className="mb-5">Create a New Course</h5>
                            <form onSubmit={handleCourseSubmit}>
                                <input
                                    className="form-control mb-3"
                                    type="text"
                                    placeholder="Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    disabled={courseLoading}
                                />
                                <textarea
                                    className="form-control mb-3"
                                    placeholder="Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    disabled={courseLoading}
                                />
                                <button 
                                    className="btn btn-secondary" 
                                    type="submit" 
                                    disabled={courseLoading}
                                >
                                    {courseLoading ? (
                                        <>
                                            <Upload className="inline-block mr-2" size={16} />
                                            Creating...
                                        </>
                                    ) : 'Create Course'}
                                </button>
                            </form>
                        </div>

                        <div className="col-md-6 text-dark">
                            <h5 className="mb-5">Add Module</h5>
                            {courseId ? (
                                <p>Adding module to course {title}</p>
                            ) : (
                                <p>Please create a course first to add modules.</p>
                            )}
                            <form onSubmit={handleModuleSubmit}>
                                <input
                                    className="form-control mb-3"
                                    type="text"
                                    placeholder="Module Title"
                                    value={moduleTitle}
                                    onChange={(e) => setModuleTitle(e.target.value)}
                                    required
                                    disabled={!courseId || moduleLoading}
                                />
                                <textarea
                                    className="form-control mb-3"
                                    placeholder="Module Description"
                                    value={moduleDescription}
                                    onChange={(e) => setModuleDescription(e.target.value)}
                                    required
                                    disabled={!courseId || moduleLoading}
                                />
                                
                                {/* PDF Upload Section */}
                                <div className="mb-3">
                                    <label>Upload PDF:</label>
                                    <div className="position-relative">
                                        <input
                                            className="form-control"
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) => handleFileChange(e, 'pdf')}
                                            required
                                            disabled={!courseId || moduleLoading}
                                        />
                                        {moduleLoading && fileNames.pdf && (
                                            <div className="progress mt-2">
                                                <div 
                                                    className="progress-bar progress-bar-striped progress-bar-animated" 
                                                    role="progressbar" 
                                                    style={{ width: `${uploadProgress.pdf}%` }}
                                                    aria-valuenow={uploadProgress.pdf} 
                                                    aria-valuemin="0" 
                                                    aria-valuemax="100"
                                                >
                                                    {uploadProgress.pdf}%
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Video Upload Section */}
                                <div className="mb-3">
                                    <label>Upload Video:</label>
                                    <div className="position-relative">
                                        <input
                                            className="form-control"
                                            type="file"
                                            accept="video/mp4"
                                            onChange={(e) => handleFileChange(e, 'video')}
                                            required
                                            disabled={!courseId || moduleLoading}
                                        />
                                        {moduleLoading && fileNames.video && (
                                            <div className="progress mt-2">
                                                <div 
                                                    className="progress-bar progress-bar-striped progress-bar-animated" 
                                                    role="progressbar" 
                                                    style={{ width: `${uploadProgress.video}%` }}
                                                    aria-valuenow={uploadProgress.video} 
                                                    aria-valuemin="0" 
                                                    aria-valuemax="100"
                                                >
                                                    {uploadProgress.video}%
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    className="btn btn-secondary"
                                    type="submit"
                                    disabled={!courseId || moduleLoading}
                                >
                                    {moduleLoading ? (
                                        <>
                                            <Upload className="inline-block mr-2" size={16} />
                                            Uploading...
                                        </>
                                    ) : 'Add Module'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Message */}
            {message && (
                <div 
                    className="toast show position-fixed bottom-0 end-0 m-3" 
                    style={{ borderRadius: "15px", backgroundColor: "#0056b3", color: "white" }}
                >
                    <div className="toast-body">
                        {message}
                        <button 
                            type="button" 
                            className="btn-close ms-2 mb-1" 
                            onClick={() => setMessage("")}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default TeacherAddCourse;