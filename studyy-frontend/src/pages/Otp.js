import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'


function Otp() {
    const [otp, setOtp] = useState('')
    const [message, setMessage] = useState('OTP has been send to your email!')
    const [timer, setTimer] = useState(120)
    // const [token, setToken] = useState('')
    const [isresenddisabled, setresendDisabled] = useState(true)
    const location = useLocation()
    const navigate = useNavigate()
    const email = location.state?.email

    const handlesubmit = async (e) => {
        e.preventDefault();
        // console.log("OTP:", otp)
        try {
            if (!otp) {
                setMessage("Enter the OTP")
                return
            }
            if (otp.length < 6) {
                setMessage("Too short for OTP")
                return
            }

            const response = await fetch("http://localhost:8000/user/verify-otp", {
                method: 'POST',
                crossDomain: true,
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({
                    email,
                    otp,
                }),
            });
            const data = await response.json();
            setMessage(data.message)
            if (data.status === "ok") {
                const token = data.token
                console.log("token from otp", token)
                localStorage.setItem('token', token);
                localStorage.setItem('email', email);
                navigate("/select-role", { state: { email, token } })
            }
            // console.log("otpverify-response", data);
        } catch (error) {
            console.error("Error during signup:", error);
        }
    }

    useEffect(() => {
        let countdown = null;
        if (timer > 0) {
            countdown = setInterval(() => {
                setTimer((prevTime) => prevTime - 1);
            }, 1000);
        } else {
            setresendDisabled(false)
        }

        return () => clearInterval(countdown);
    }, [timer])

    const handleResendOtp = async () => {
        try {
            setresendDisabled(true);
            setTimer(120);

            const response = await fetch("http://localhost:8000/user/resend-otp", {
                method: 'POST',
                crossDomain: true,
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            setMessage(data.message);
        } catch (error) {
            console.error("Error during resending OTP:", error);
        }
    }

    return (
        <>
            <div className='wrapper'>
                <div className='container login-boxx'>
                    <div className='login-items'>
                        <h2 className='heading'>Verify OTP</h2>
                        <div className='input'>
                            <h6 className='warning-text text-center'>{message}</h6>
                            <form className='form'>
                                <input className='form-control text-start text-dark' onChange={(e) => setOtp(e.target.value)} type="text" name='otp' placeholder='Enter otp' />
                                <button className='btn btn-primary sign-in-button my-1' onClick={handlesubmit}>Verify</button>
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
                            disabled={isresenddisabled}
                        >Resend</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Otp