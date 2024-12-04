import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SelectRole = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [email, setEmail] = useState(localStorage.getItem('email') || '')
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [certificate, setCertificate] = useState(null)
  const [message, setMessage] = useState('')
  const navigate = useNavigate();
  const location = useLocation();

  const urlToken = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    const currentToken = urlToken || location.state?.token;
    const currentEmail = location.state?.email;

    if (currentToken) {
      setToken(currentToken);
      localStorage.setItem('token', currentToken)
    }

    if (currentEmail) {
      setEmail(currentEmail);
      localStorage.setItem('email', currentEmail)
    }
  }, [urlToken, location.state?.token, location.state?.email]);

  console.log("email from select role:", email);
  console.log("token from select role:", token);

  const handleRoleSelection = async () => {
    try {

      if (selectedRole === "teacher") {
        if (!certificate) {
          setMessage("Upload a cerificate as pdf!")
          return
        }
      }

      if (selectedRole && token) {
        const formData = new FormData()
        formData.append("role", selectedRole)
        formData.append("certificate", certificate)
        const response = await fetch('http://localhost:8000/user/select-role', {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("status:", data.status);
        console.log("role of user from response:", data.role);

        if (data.status === "ok") {
          const userData = { email, role: data.role };
          localStorage.setItem('user', JSON.stringify(data.user));
          if (data.role === "teacher") {
            navigate("/teacher-home", { state: { user: userData } });
          } else if (data.role === "student") {
            navigate("/student-home", { state: { user: userData } });
          }
        }
      } else {
        console.error('Role or token is missing');
      }
    } catch (error) {
      console.error("Error during role selection:", error);
    }
  };

  return (
    <div className="wrapper">
      <div className="container login-boxx">
        <div className="login-items">
          <div className='select-role'>
            <h4 className='select-role-heading'>Who are you?</h4>
            {message && <div class="alert alert-danger" role="alert">
              {message}
            </div>}
            <div className="dropdown">
              <button
                className="btn btn-secondary dropdown-toggle"
                type="button"
                id="dropdownMenuButton"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {selectedRole ? selectedRole : "Select Role"}
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
