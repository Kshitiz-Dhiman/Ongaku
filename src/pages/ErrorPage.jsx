import React from 'react'
import { useNavigate } from 'react-router-dom'

const ErrorPage = () => {
    const navigate = useNavigate();

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-[#121212] z-100 fixed left-0">
            <div className="text-center space-y-6">
                <h1 className="text-9xl font-bold text-white">404</h1>
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-white">Page not found</h2>
                    <p className="text-[#6e7273]">The page you're looking for doesn't exist.</p>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-full hover:scale-105 transition-transform"
                >
                    Go Home
                </button>
            </div>
        </div>
    )
}

export default ErrorPage
