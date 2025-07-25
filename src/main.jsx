// client/src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthUserInfoProvider } from './context/AuthUserInfoContext';
import { AudioPlayerProvider } from 'react-use-audio-player'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
const queryClient = new QueryClient({});

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
    <AudioPlayerProvider>
        <AuthUserInfoProvider>
            <BrowserRouter>
                <StrictMode>
                    <QueryClientProvider client={queryClient}>
                        <App />
                        <ReactQueryDevtools initialIsOpen={false} />
                    </QueryClientProvider>
                </StrictMode>
            </BrowserRouter>
        </AuthUserInfoProvider>
    </AudioPlayerProvider >

)
