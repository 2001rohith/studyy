import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../axiourl'; 

const apiClient = axios.create({
    baseURL: API_URL,  
    headers: {
        'Accept': 'application/json',
    },
});

const SelectRole = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [certificate, setCertificate] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const urlToken = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    const currentToken = urlToken || location.state?.token;
    const currentEmail = location.state?.email;

    if (currentToken) {
      setToken(currentToken);
      localStorage.setItem('token', currentToken);
    }

    if (currentEmail) {
      setEmail(currentEmail);
      localStorage.setItem('email', currentEmail);
    }
  }, [urlToken, location.state?.token, location.state?.email]);

  const handleRoleSelection = async () => {
    try {
      if (selectedRole === 'teacher' && !certificate) {
        setMessage('Upload a certificate as pdf!');
        return;
      }

      if (selectedRole && token) {
        const formData = new FormData();
        formData.append('role', selectedRole);
        if (certificate) formData.append('certificate', certificate);

        const response = await apiClient.post('/user/select-role', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.data.status === 'ok') {
          const data = response.data;
          localStorage.setItem('user', JSON.stringify(data.user));

          const userData = { email, role: data.role };
          if (data.role === 'teacher') {
            navigate('/teacher-home', { state: { user: userData } });
          } else if (data.role === 'student') {
            navigate('/student-home', { state: { user: userData } });
          }
        } else {
          setMessage(response.data.message || 'Something went wrong.');
        }
      } else {
        console.error('Role or token is missing');
      }
    } catch (error) {
      console.error('Error during role selection:', error);
      setMessage('Error during role selection, please try again.');
    }
  };

  return (
    <div className="wrapper">
      <div className="container login-boxx">
        <div className="login-items">
          <div className="select-role">
            <h4 className="select-role-heading">Who are you?</h4>
            {message && (
              <div className="alert alert-danger" role="alert">
                {message}
              </div>
            )}
            <div className="dropdown">
              <button
                className="btn btn-secondary dropdown-toggle"
                type="button"
                id="dropdownMenuButton"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {selectedRole ? selectedRole : 'Select Role'}
              </button>
              <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <li>
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={() => setSelectedRole('student')}
                  >
                    Student
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={() => setSelectedRole('teacher')}
                  >
                    Teacher
                  </a>
                </li>
              </ul>
            </div>
            {selectedRole === 'teacher' && (
              <div className="mt-3 form">
                <label htmlFor="certificate">Upload Teacher Certificate:</label>
                <input
                  type="file"
                  id="certificate"
                  onChange={(e) => setCertificate(e.target.files[0])}
                  className="form-control"
                />
              </div>
            )}
            <button className="btn btn-primary mt-3 rolesectbutton" onClick={handleRoleSelection}>
              Select
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;
