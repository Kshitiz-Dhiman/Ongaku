import React, { useEffect, useState } from 'react'

const IsOnline = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const updateNetworkStatus = () => {
        setIsOnline(navigator.onLine);
    }

    useEffect(() => {
        updateNetworkStatus();
    }, [])

    useEffect(() => {
        window.addEventListener("online", updateNetworkStatus);
        window.addEventListener("offline", updateNetworkStatus);
        return () => {
            window.removeEventListener("online", updateNetworkStatus);
            window.removeEventListener("offline", updateNetworkStatus);
        }
    }, [])

    return isOnline;
}

export default IsOnline
