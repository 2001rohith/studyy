import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar2 from '../components/Sidebar2'

function AdminUnverifiedTeachers() {
    const navigate = useNavigate()
    // const location = useLocation()
    // const email = location.state?.user.email
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [searchEmail, setSearchEmail] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [usersPerPage] = useState(5)
    const [selectedUser, setSelectedUser] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [showConfirmationModal, setconfirmationModal] = useState(false)
    const [isVerified , setIsVerified] = useState("")
    const [filter, setFilter] = useState("")


    useEffect(() => {
        const getTeachers = async () => {
            try {
                const response = await fetch("http://localhost:8000/user/get-teachers", {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                let data = await response.json()
                const teachers = data.users
                setUsers(teachers)
                setFilteredUsers(teachers)
            } catch (error) {
                console.log("error in fetching teachers from admin", error)
            }
        }
        getTeachers()
    }, [])

    const handleViewPDF = (user) => {
        const backendOrigin = "http://localhost:8000";
        const formattedPath = `${backendOrigin}/${user.teacherCertificatePath.replace(/\\/g, '/')}`.replace(/^\/+/, "");

        setSelectedUser({ ...user, teacherCertificatePath: formattedPath });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    useEffect(() => {
        if (searchEmail === '') {
            setFilteredUsers(users)
        } else {
            const results = users.filter(user =>
                user.email.toLowerCase().includes(searchEmail.toLowerCase())
            );
            setFilteredUsers(results);
        }
    }, [searchEmail, users]);

    useEffect(() => {
        let results
        if (filter === "Unverified" ) {
            results = users.filter(user => user.isTeacherVerified === false)
            setFilteredUsers(results)
        } else if (filter === "") {
            setFilteredUsers(users);
        } 
    }, [filter, users]);

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);


    const handleVerification = async (userId) => {
        // if (!window.confirm(`Are you sure you want to ${isTeacherVerified ? "unverify" : "verify"} this teacher?`)) return;

        try {
            const response = await fetch(`http://localhost:8000/user/admin-verify-teacher/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                // alert(data.message)
                navigate(0)
            } else {
                alert("Failed to block/unblock teacher");
            }
        } catch (error) {
            console.error("Error during blocking/unblocking:", error);
        }
    };
    const ShowVerificationModal = (user) => {
        setconfirmationModal(true)
        setSelectedUser(user)
    }

    return (
        <>
            <div className='row'>
                <div className='col text-light side-bar'>
                    <Sidebar2 />
                </div>
                <div className='col text-light '>
                    <div className='row headers'>
                        <h4>Teachers</h4>
                    </div>
                    <div className='row content'>
                        <div className='search-bar'>
                            <input
                                type="text"
                                placeholder="Search by email"
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                            />
                            <button className='btn btn-secondary' onClick={() => setSearchEmail('')}>Clear</button>
                            <div className="dropdown ms-2">
                                <button
                                    className="btn filter-button dropdown-toggle"
                                    type="button"
                                    id="dropdownMenuButton"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    {filter ? filter : "All teachers"}
                                </button>
                                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    <li>
                                        <a
                                            className="dropdown-item"
                                            href="#"
                                            onClick={() => setFilter("")}
                                        >
                                            All Teachers
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            className="dropdown-item"
                                            href="#"
                                            onClick={() => setFilter("Unverified")}
                                        >
                                            Unverified
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <table class="table table-borderless table-default table-hover table-striped-columns">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Verified</th>
                                    <th>Certificate</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    filteredUsers.map((user, index) => (
                                        <tr key={user._id}>
                                            <td>{index + 1}</td>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.isTeacherVerified ? "Yes" : "No"}</td>
                                            <td>
                                                <button className='btn table-button mx-1' onClick={() => handleViewPDF(user)} >View</button>
                                            </td>
                                            <td>
                                                {
                                                    user.isTeacherVerified ? <button className='btn table-button mx-1' onClick={() => {ShowVerificationModal(user); setIsVerified(user.isTeacherVerified)}} >Unverify</button> : <button className='btn table-button mx-1' onClick={() => {ShowVerificationModal(user); setIsVerified(user.isTeacherVerified)}}>Verify</button>
                                                }
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                        {showModal && (
                            <div className="modal show" tabIndex="-1" style={{ display: 'block' }}>
                                <div className="modal-dialog modal-lg">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title">Teacher Certificate</h5>
                                            <button type="button" className="btn-close" onClick={closeModal} aria-label="Close"></button>
                                        </div>
                                        <div className="modal-body">
                                            {selectedUser && (
                                                <iframe
                                                    src={selectedUser.teacherCertificatePath}
                                                    title="Certificate PDF"
                                                    width="100%"
                                                    height="500px"
                                                ></iframe>
                                            )}
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showConfirmationModal && (
                            <div className="modal show d-block" tabIndex="-1">
                                <div className="modal-dialog">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title">Confirm {isVerified ? 'unverify' : 'verify'}</h5>
                                            <button type="button" className="btn-close" onClick={() => {setconfirmationModal(false); setSelectedUser('')}}></button>
                                        </div>
                                        <div className="modal-body text-dark">
                                            <p>Are you sure you want to {isVerified ? 'unverify' : 'verify'} this teacher?</p>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" onClick={() => {setconfirmationModal(false); setSelectedUser('')}}>Cancel</button>
                                            <button type="button" className="btn btn-warning" onClick={()=>handleVerification(selectedUser._id)}>
                                                {isVerified ? 'unverify' : 'verify'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <nav>
                            <ul className="pagination">
                                {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, i) => (
                                    <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                        <a onClick={() => paginate(i + 1)} className="page-link">
                                            {i + 1}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>

        </>
    )
}

export default AdminUnverifiedTeachers