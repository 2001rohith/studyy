import React, { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
import TeacherSidebar from '../components/TeacherSidebar'
function TeacherStudents() {
    // const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [searchEmail, setSearchEmail] = useState('')
    useEffect(() => {
        const getStudents = async () => {
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
                console.log("error in fetching teachers from admin", error)
            }
        }
        getStudents()
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

    return (
        <>
            <div className='row'>
                <div className='col text-light side-bar'>
                    <TeacherSidebar />
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
                        <table class="table table-dark table-striped-columns">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
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
                                            
                                            <td>
                                                
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}

export default TeacherStudents