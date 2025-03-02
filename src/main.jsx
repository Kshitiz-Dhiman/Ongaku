// client/src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AudioPlayerContext from './context/AudioPlayerContext';

// Register service worker with better error handling
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);

                // Fallback: Try alternative path if main registration fails
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
    <AudioPlayerContext>
        <StrictMode>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </StrictMode>
    </AudioPlayerContext>
)
