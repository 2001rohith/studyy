import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar2 from '../components/Sidebar2'

function AdminStudents() {
    const navigate = useNavigate()
    // const location = useLocation()
    // const email = location.state?.user.email
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [searchEmail, setSearchEmail] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [usersPerPage] = useState(5)
    useEffect(() => {
        const getTeachers = async () => {
            try {
                const response = await fetch("http://localhost:8000/user/get-students", {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                let data = await response.json()
                setUsers(data.users)
                setFilteredUsers(data.users)
            } catch (error) {
                console.log("error in fetching students from admin", error)
            }
        }
        getTeachers()
    }, [])

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

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleBlock = async (userId, isBlocked) => {
        if (!window.confirm(`Are you sure you want to ${isBlocked ? "unblock" : "block"} this user?`)) return;

        try {
            const response = await fetch(`http://localhost:8000/user/admin-block-user/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message)
                navigate(0)
            } else {
                alert("Failed to block/unblock user");
            }
        } catch (error) {
            console.error("Error during blocking/unblocking:", error);
        }
    };

    return (
        <>
            <div className='row'>
                <div className='col text-light side-bar'>
                    <Sidebar2 />
                </div>
                <div className='col text-light '>
                    <div className='row headers'>
                        <h4>Students</h4>
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
                        </div>
                        <table class="table table-default table-borderless table-hover table-striped-columns">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Blocked</th>
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
                                            <td>{user.isBlocked ? 'Yes' : 'No'}</td>
                                            <td>
                                            {user.isBlocked 
                                                ? <button className='btn table-button mx-1' onClick={() => handleBlock(user._id, user.isBlocked)}>Unblock</button>
                                                : <button className='btn table-button mx-1' onClick={() => handleBlock(user._id, user.isBlocked)}>Block</button>
                                            }
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
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

export default AdminStudents