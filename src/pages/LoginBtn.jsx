import React from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import GoogleIcon from "../assets/google.svg"
import { useAuthUserInfo } from '../context/AuthUserInfoContext'

const SampleLogin = () => {
    const { setUserInfo } = useAuthUserInfo();

    const responseLogin = async (response) => {
        try {
            if (response?.code) {
                const res = await axios.get(`${import.meta.env.VITE_MUSIC_API}/auth/google?code=${response.code}`);
                setUserInfo(res.data.user);
                localStorage.setItem("token", res.data.token);
            }
        } catch (error) {
            console.log(error);
            setUserInfo(null);
            localStorage.removeItem("token");
        }
    }

    const login = useGoogleLogin({
        onSuccess: responseLogin,
        onError: responseLogin,
        flow: 'auth-code'
    })

    return (
        <div className="w-full flex justify-center items-center">
            <button
                className='flex items-center gap-2 bg-white/5 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-4xl md:rounded-lg font-medium transition-colors duration-200 hover:bg-[#202020] focus:outline-none focus:ring-2 focus:ring-[#404040] focus:ring-opacity-50 cursor-pointer text-sm sm:text-base w-full sm:w-auto max-w-[300px]'
                onClick={() => login()}
            >
                <span className='hidden sm:block'>Login with</span>
                <img src={GoogleIcon} alt="Google Icon" className='w-7 h-7 sm:w-6 sm:h-6' />
            </button>
        </div>
    )
}

export default SampleLogin
