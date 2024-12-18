import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../axiourl'; 

const apiClient = axios.create({
    baseURL: API_URL, 
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

function Otp() {
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('OTP has been sent to your email!');
    const [timer, setTimer] = useState(120);
    const [isResendDisabled, setResendDisabled] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!otp) {
                setMessage("Enter the OTP");
                return;
            }
            if (otp.length < 6) {
                setMessage("Too short for OTP");
                return;
            }

            const response = await apiClient.post('/user/verify-otp', { email, otp });
            const data = response.data;
            setMessage(data.message);
            if (data.status === 'ok') {
                const token = data.token;
                localStorage.setItem('token', token);
                localStorage.setItem('email', email);
                navigate("/select-role", { state: { email, token } });
            }
        } catch (error) {
            console.error("Error during OTP verification:", error);
        }
    };

    useEffect(() => {
        let countdown = null;
        if (timer > 0) {
            countdown = setInterval(() => {
                setTimer((prevTime) => prevTime - 1);
            }, 1000);
        } else {
            setResendDisabled(false);
        }

        return () => clearInterval(countdown);
    }, [timer]);

    const handleResendOtp = async () => {
        try {
            setResendDisabled(true);
            setTimer(120);

            const response = await apiClient.post('/user/resend-otp', { email });
            const data = response.data;
            setMessage(data.message);
        } catch (error) {
            console.error("Error during resending OTP:", error);
        }
    };

    return (
        <div className='wrapper'>
            <div className='container login-boxx'>
                <div className='login-items'>
                    <h2 className='heading'>Verify OTP</h2>
                    <div className='input'>
                        <h6 className='warning-text text-center'>{message}</h6>
                        <form className='form'>
                            <input
                                className='form-control text-start text-dark'
                                onChange={(e) => setOtp(e.target.value)}
                                type="text"
                                name='otp'
                                placeholder='Enter OTP'
                            />
                            <button className='btn btn-primary sign-in-button my-1' onClick={handleSubmit}>
                                Verify
                            </button>
                        </form>
                    </div>
                    {timer > 0 ? (
                        <p>Resend OTP in {Math.floor(timer / 60)}:{("0" + (timer % 60)).slice(-2)} minutes</p>
                    ) : (
                        <p>OTP expired, you can resend it now.</p>
                    )}
                    <button
                        className='btn btn-secondary my-1'
                        onClick={handleResendOtp}
                        disabled={isResendDisabled}
                    >
                        Resend
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Otp;
