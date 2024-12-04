import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

function ResetPassword() {
    const { token } = useParams();
    const [message, setMessage] = useState("")
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8000/user/reset-password/${token}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password, confirmPassword }),
            });

            const data = await response.json();
            if (data.status === "ok") {
                setMessage(data.message)
                alert(data.message);
            } else {
                setMessage(data.message)
                alert(data.message);
            }
        } catch (error) {
            console.error("Error resetting password:", error);
        }
    };

    return (
        <div className='wrapper'>
            <div className='container login-boxx'>
                <div className='login-items'>
                    <h2 className='heading'>Reset password</h2>
                    <h6>Enter new password</h6>
                    <div className='input'>
                        <h6 className='warning-text text-center'>{message}</h6>

                        <form>
                            <input className='form-control text-start text-dark' type="password" onChange={(e) => setPassword(e.target.value)} name='password' placeholder='Enter new password' />
                            <input className='form-control text-start text-dark' type="password" onChange={(e) => setConfirmPassword(e.target.value)} name='confirmPassword' placeholder='Confirm password' />
                            <button className='btn btn-primary sign-in-button my-1' onClick={handleSubmit} >Reset</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
