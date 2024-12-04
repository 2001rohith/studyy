import { useState } from 'react';
import TeacherSidebar from '../components/TeacherSidebar';
import { useLocation, useNavigate } from 'react-router-dom';

const TeacherEditClass = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const Class = location.state?.Class
    const courseId = location.state?.courseId
    const user = JSON.parse(localStorage.getItem('user'));
    const [message, setMessage] = useState("");
    const [title, setTitle] = useState(Class.title || '');
    const [date, setDate] = useState(Class.date || '');
    const [time, setTime] = useState(Class.time || '');
    const [duration, setDuration] = useState(Class.duration || '');
    // const [isLive, setIsLive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setMessage("Enter a valid title");
            return;
        }
        if (!date) {
            setMessage("Set a date");
            return;
        }
        if (!time) {
            setMessage("Set time");
            return;
        }
        if (!duration) {
            setMessage("Set duration");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/course/teacher-edit-class/${Class._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title: trimmedTitle,
                    date,
                    time,
                    duration,
                })
            });

            const data = await response.json();
            if (data.status === 'ok') {
                navigate("/teacher-view-classes", { state: { id: courseId } });
            } else {
                setMessage(data.message);
                setError('Failed to add the class');
            }
        } catch (err) {
            setError('Server error, please try again later');
        } finally {
            setLoading(false);
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
                        <h4>Live classes</h4>
                    </div>

                    <div className="row add-course-forms">
                        <div className="col-md-6 text-dark first-form">
                            <h5 className="mb-5">Edit class</h5>
                            {message && (
                                <p>{message}</p>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div>
                                    <input
                                        className="form-control mb-3"
                                        type="text"
                                        placeholder="Title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                    <small className="form-check-label ms-2">Date:</small>
                                    <input
                                        className="form-control mb-3"
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                    />
                                    <small className="form-check-label ms-2">Time:</small>
                                    <input
                                        type="time"
                                        className="form-control"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        required
                                    />
                                    <small className="form-check-label ms-2">Duration (minutes):</small>
                                    <input
                                        type="number"
                                        placeholder="Duration in minutes"
                                        className="form-control"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        required
                                    />
                                </div>
                                <button className="btn btn-secondary mt-3" type="submit">
                                    {loading ? 'Submitting...' : 'submit'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TeacherEditClass;
