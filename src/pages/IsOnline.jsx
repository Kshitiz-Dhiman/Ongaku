import React, { useEffect, useState } from 'react'

const IsOnline = () => {
    const [isOnline, setisOnline] = useState(true);

    const updateNetworkStatus = () => {
        setisOnline(navigator.online);
    }

    useEffect(() => {
        updateNetworkStatus();
    }, [])

    useEffect(() => {
        window.addEventListener("load", updateNetworkStatus);
        window.addEventListener("online", updateNetworkStatus);
        window.addEventListener("offline", updateNetworkStatus);
        return () => {
            window.removeEventListener("load", updateNetworkStatus);
            window.removeEventListener("online", updateNetworkStatus);
            window.removeEventListener("offline", updateNetworkStatus);
        }
    }, [])
}

export default IsOnline
