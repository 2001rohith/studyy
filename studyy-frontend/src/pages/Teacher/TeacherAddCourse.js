import { useState } from 'react';
import TeacherSidebar from '../components/TeacherSidebar';
import { useLocation, useNavigate } from 'react-router-dom';

const TeacherAddCourse = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const userId = location.state?.user.id;

    // Course-related states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('Fill Fields!');
    const [courseId, setCourseId] = useState(null);  // Store course ID after creation

    // Module-related states
    const [moduleTitle, setModuleTitle] = useState('');
    const [moduleDescription, setModuleDescription] = useState('');
    const [moduleFile, setModuleFile] = useState(null);
    const [moduleVideoFile, setModuleVideoFile] = useState(null)

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
            const response = await fetch('http://localhost:8000/course/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ title: trimmedTitle, description: trimmedDescription, userId })
            });

            const data = await response.json();
            if (response.ok) {
                setMessage("Course created successfully.");
                setCourseId(data.course._id)
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            console.error('Error creating course:', error);
            setMessage("Error occurred while creating the course.");
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
        formData.append("video", moduleVideoFile)


        try {
            const response = await fetch('http://localhost:8000/course/teacher-add-module', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const data = await response.json()
            if (response.ok) {
                // alert("Module created!")
                setMessage("Module added successfully.");
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            console.error('Error adding module:', error);
            setMessage("Error occurred while adding the module.");
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
                            {message && <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                <div class="modal-dialog">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title" id="exampleModalLabel">Alert!</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div class="modal-body">
                                            {message}
                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                        </div>
                                    </div>
                                </div>
                            </div>}
                            <form onSubmit={handleCourseSubmit}>
                                <input
                                    className="form-control mb-3"
                                    type="text"
                                    placeholder="Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                                <textarea
                                    className="form-control mb-3"
                                    placeholder="Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                                <button className="btn btn-secondary" type="submit" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                    Create Course
                                </button>
                            </form>
                        </div>

                        <div className="col-md-6 text-dark">
                            <h5 className="mb-5">Add Module</h5>
                            {message && <div className="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                <div className="modal-dialog">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="exampleModalLabel">Alert!</h5>
                                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div class="modal-body">
                                            {message}
                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                        </div>
                                    </div>
                                </div>
                            </div>}
                            {courseId ? (

                                <p>Adding module to course {title}</p>
                            ) : (
                                <p>Please create a course first to add modules.</p>
                            )}
                            <form onSubmit={handleModuleSubmit}>
                                <input
                                    className="form-control mb-3"
                                    type="text"
                                    value={moduleTitle}
                                    onChange={(e) => setModuleTitle(e.target.value)}
                                    required
                                    disabled={!courseId} 
                                />
                                <textarea
                                    className="form-control mb-3"
                                    value={moduleDescription}
                                    onChange={(e) => setModuleDescription(e.target.value)}
                                    required
                                    disabled={!courseId}
                                />
                                <label>Upload PDF:</label>
                                <input
                                    className="form-control mb-3"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => setModuleFile(e.target.files[0])}
                                    required
                                    disabled={!courseId}
                                />
                                <label>Upload Video:</label>
                                <input
                                    className="form-control mb-3"
                                    type="file"
                                    accept="video/mp4"
                                    onChange={(e) => setModuleVideoFile(e.target.files[0])}
                                    required
                                    disabled={!courseId}
                                />
                                <button
                                    className="btn btn-secondary"
                                    type="submit"
                                    disabled={!courseId}
                                    data-bs-toggle="modal" data-bs-target="#exampleModal"
                                >
                                    Add Module
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TeacherAddCourse;