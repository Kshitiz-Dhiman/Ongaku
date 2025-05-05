import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthUserInfoContext = createContext();

export const AuthUserInfoProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const loadUserInfo = async () => {
                try {
                    const res = await axios.get(`${import.meta.env.VITE_MUSIC_API}/auth/user`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setUserInfo(res.data.user);
                } catch (error) {
                    console.error('Error loading user info:', error);
                    localStorage.removeItem('token');
                    setUserInfo(null);
                }
            };
            loadUserInfo();
        }
    }, []);

    return (
        <AuthUserInfoContext.Provider value={{ userInfo, setUserInfo }}>
            {children}
        </AuthUserInfoContext.Provider>
    );
};

export const useAuthUserInfo = () => {
    const context = useContext(AuthUserInfoContext);
    if (!context) {
        throw new Error('useAuthUserInfo must be used within an AuthUserInfoProvider');
    }
    return context;
};
