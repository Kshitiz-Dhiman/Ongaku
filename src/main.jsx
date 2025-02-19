import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AudioPlayerContext from './context/AudioPlayerContext';

createRoot(document.getElementById('root')).render(
    <AudioPlayerContext>
        <StrictMode>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </StrictMode>,
    </AudioPlayerContext>
)
