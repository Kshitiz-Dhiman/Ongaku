// client/src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AudioPlayerContext from './context/AudioPlayerContext';
import { AuthUserInfoProvider } from './context/AuthUserInfoContext';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);

                if (error.message.includes('404')) {
                    console.log('Attempting to register service worker from alternative path...');
                    return navigator.serviceWorker.register('./sw.js')
                        .then(reg => console.log('SW registered from alternative path:', reg.scope))
                        .catch(err => console.error('Alternative SW registration also failed:', err));
                }
            });
    });
}

createRoot(document.getElementById('root')).render(
    <AuthUserInfoProvider>
        <BrowserRouter>
            <StrictMode>
                <AudioPlayerContext>
                    <App />
                </AudioPlayerContext>
            </StrictMode>
        </BrowserRouter>
    </AuthUserInfoProvider>
)
