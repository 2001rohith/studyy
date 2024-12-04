import { useState, useEffect } from 'react';
import TeacherSidebar from '../components/TeacherSidebar';
import { useLocation, useNavigate } from 'react-router-dom';

const TeacherEditAssignment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const assignment = location.state?.assignment || {};
    const courseId = location.state?.courseId;

    const [title, setTitle] = useState(assignment.title || '');
    const [description, setDescription] = useState(assignment.description || '');
    const [dueDate, setDueDate] = useState(assignment.dueDate || '');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!courseId || !assignment) {
            navigate('/teacher-view-assignments', { replace: true });
        }
    }, [courseId, assignment, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedTitle = title.trim();
        const trimmedDescription = description.trim();

        if (!trimmedTitle) {
            setMessage("Enter a valid title");
            return;
        }

        if (!trimmedDescription) {
            setMessage("Enter a valid description");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/course/teacher-edit-assignment/${assignment._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ title: trimmedTitle, description: trimmedDescription, dueDate })
            });

            const data = await response.json();
            setMessage(data.message);

            if (response.ok) {
                navigate("/teacher-view-assignments", { state: { id: courseId } });
            }
        } catch (error) {
            console.error('Error updating assignment:', error);
            setMessage('Error updating assignment, please try again later.');
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
                        <h4>Edit Assignment</h4>
                    </div>
                    <div className='row content forms'>
                        <div className='other-forms'>
                            <h5 className='mb-5'>Edit Assignment</h5>
                            {message && <p>{message}</p>}
                            <form onSubmit={handleSubmit}>
                                <small>Title:</small>
                                <input
                                    className='form-control'
                                    type="text"
                                    placeholder="Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                                <small>Deadline:</small>
                                <input
                                    className='form-control'
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    required
                                />
                                <small>Description:</small>
                                <textarea
                                    className='form-control'
                                    placeholder="Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                                <button className='btn btn-secondary button mb-3 mt-3' type="submit">
                                    Save
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TeacherEditAssignment;
