import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Login() {

    const [email, setEmail] = useState('')
    const [password, SetPassword] = useState('')
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            if (user.role === "admin") navigate("/admin-home", { replace: true });
            else if (user.role === "teacher") navigate("/teacher-home", { replace: true });
            else navigate("/student-home", { replace: true });
        }
    }, [navigate]);

    const handlesubmit = async (e) => {
        e.preventDefault()
        try {
            if (!email && !password) {
                setMessage("Enter the details")
                return
            }
            if (email.length < 2) {
                setMessage("Too short for email")
                return
            }
            if (password.length < 6) {
                setMessage("Too short for password")
                return
            }

            const response = await fetch("http://localhost:8000/user/login", {
                method: 'POST',
                crossDomain: true,
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });
            const data = await response.json();
            setMessage(data.message)
            if (data.status === "ok") {
                window.localStorage.setItem("token", data.token)
                localStorage.setItem('user', JSON.stringify(data.user));
                console.log("role from login:", data.user.role)
                if (data.user.role === "admin") {
                    navigate("/admin-home", { state: { user: data.user }, replace: true })
                } else if (data.user.role === "teacher") {
                    navigate("/teacher-home", { state: { user: data.user }, replace: true })
                }
                // else if (data.user.role === "teacher" && data.user.isTeacherVerified === true) {
                //     navigate("/teacher-pending", { state: { user: data.user }, replace: true })
                // }
                else {
                    navigate("/student-home", { state: { user: data.user }, replace: true })
                }
            }

            console.log("login-response", data);
        } catch (error) {
            console.error("Error during login:", error);
        }
    }

    const googleLogin = () => {
        window.location.href = 'http://localhost:8000/user/auth/google'
    };


    return (
        <>
            <div className='wrapper'>
                <div className='container login-boxx'>
                    <div className='login-items'>
                        <h2 className="login-title">studyy</h2>
                        <h5 className='heading'>Welcome Back!</h5>
                        <div className='input'>
                            {/* <h6 className='warning-text text-center'>{message}</h6> */}
                            {message && <div class="alert alert-danger" role="alert">
                                {message}
                            </div>}
                            <form>
                                <input className='form-control text-start text-dark input' type="email" onChange={(e) => setEmail(e.target.value)} name='email' placeholder='Enter Email' />
                                {/* <label for="email">Email</label> */}
                                <input className='form-control text-dark input' type="password" onChange={(e) => SetPassword(e.target.value)} name='password' placeholder='Enter Password' />
                                {/* <label for="password">Password</label> */}
                                <button className='btn btn-primary sign-in-button my-1' onClick={handlesubmit} >Sign In</button>
                            </form>
                            <div className='mt-3 text-center other-options'>
                                <span className='sign-in-up-link'><Link to={"/forgot-password"} >Forgot password?</Link></span>
                                <button className='btn text-light mb-2' onClick={googleLogin}><i className="fa-brands fa-google"></i> Google</button>
                                <div className='d-flex'>
                                <span className='signup-link'>New User?</span>
                                <span className='sign-in-up-link ms-1'><Link to={"/signup"}>Sign Up</Link></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login