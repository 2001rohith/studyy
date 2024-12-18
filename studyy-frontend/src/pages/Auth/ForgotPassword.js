import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../axiourl';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const Navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await apiClient.post("/user/forgot-password", { email })
            Navigate("/")
        } catch (error) {
            console.error("Error sending forgot password request:", error);
        }
    };

    return (
        <div className='wrapper'>
            <div className='container login-boxx'>
                <div className='login-items'>
                    <h2 className='heading'>Forgot password</h2>
                    <h6>Enter your email</h6>
                    <div className='input'>
                        <form>
                            <input className='form-control text-start text-dark' type="email" onChange={(e) => setEmail(e.target.value)} name='email' placeholder='Enter email' />
                            <button className='btn btn-primary sign-in-button my-1' onClick={handleSubmit} >Get link</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
