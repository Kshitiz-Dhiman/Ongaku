# 🎵 Ongaku

A modern music application built with React and Vite, designed to provide an intuitive and responsive music listening experience.

## ✨ Features

- **Modern UI/UX**: Clean and intuitive interface for seamless music browsing
- **Fast Performance**: Built with Vite for lightning-fast development and optimized production builds
- **Responsive Design**: Works perfectly across desktop, tablet, and mobile devices
- **Music Playback**: High-quality audio playback with essential controls
- **Search Functionality**: Quick search through your music library

## 🚀 Quick Start

### Screenshots

#### 📱 Mobile Views
<div align="center">
  <table>
    <tr>
      <td align="center" width="20%">
        <img width="200" height="400" alt="Home Screen" src="https://github.com/user-attachments/assets/ea3b7da1-0651-4d9f-9ff4-507856ee25a7" />
        <br><em>Home Screen</em>
      </td>
      <td align="center" width="20%">
        <img width="200" height="400" alt="Music Player" src="https://github.com/user-attachments/assets/0c4e7591-d7f6-40e7-99e3-d4545078ee48" />
        <br><em>Music Player</em>
      </td>
      <td align="center" width="20%">
        <img width="200" height="400" alt="Library View" src="https://github.com/user-attachments/assets/45aba1d6-a5f6-490f-be74-02505f6d9d3f" />
        <br><em>Library View</em>
      </td>
      <td align="center" width="20%">
        <img width="200" height="400" alt="Search Feature" src="https://github.com/user-attachments/assets/08767444-33cd-4c25-98ad-0ab546317e65" />
        <br><em>Artist View</em>
      </td>
      <td align="center" width="20%">
        <img width="200" height="400" alt="Settings" src="https://github.com/user-attachments/assets/5d9b3fdc-17ee-4983-941a-96bba9833bcc" />
        <br><em>Album View</em>
      </td>
    </tr>
  </table>
</div>

#### 🖥️ Desktop Views
<div align="center">
  <table>
    <tr>
      <td align="center" width="33.33%">
       <img width="400" height="250" alt="Screenshot 2025-08-16 190920" src="https://github.com/user-attachments/assets/60b4dd8a-bb01-4e85-b4ba-3bf5c52c5bf4"/>  
        <br><em>Desktop Home Interface</em>
      </td>
      <td align="center" width="33.33%">
        <img width="400" height="250" alt="Screenshot 2025-08-16 191239" src="https://github.com/user-attachments/assets/66a43c8d-f884-4e55-8d65-7ba342e042d7" />
        <br><em>Desktop Music Player</em>
      </td>
      <td align="center" width="33.33%">
         <img width="2495" height="1518" alt="Screenshot 2025-08-16 191331" src="https://github.com/user-attachments/assets/e07fa4ef-d1a7-4396-b322-a5f2436a431d" />
        <br><em>Desktop Artist View</em>
      </td>
    </tr>
  </table>
</div>

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (version 16.0 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kshitiz-Dhiman/Ongaku.git
   cd Ongaku
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

## 📱 Mobile Installation

### Install as PWA (Progressive Web App)
Ongaku can be installed directly on your device for a native app-like experience:

#### On Android/Chrome:
1. Open the app in Chrome browser
2. Tap the menu (three dots) → "Add to Home screen" or "Install app"
3. Follow the prompts to install

#### On iOS/Safari:
1. Open the app in Safari
2. Tap the Share button → "Add to Home Screen"
3. Name the app and tap "Add"

#### On Desktop:
1. Open the app in Chrome, Edge, or other supported browsers
2. Click the install icon in the address bar or
3. Go to browser menu → "Install Ongaku..."

### Download APK (Android)
For Android users who prefer APK installation:

1. **Download from Releases**:
   - Visit the [Releases section](https://github.com/Kshitiz-Dhiman/Ongaku/releases)
   - Download the latest `ongaku.apk` file

2. **Install the APK**:
   - Enable "Install from unknown sources" in your device settings
   - Open the downloaded APK file
   - Follow the installation prompts

> **Note**: The PWA installation is recommended as it provides automatic updates and better integration with your system.

## 🛠️ Available Scripts

- **`npm run dev`** - Start the development server
- **`npm run build`** - Build the app for production
- **`npm run preview`** - Preview the production build locally
- **`npm run lint`** - Run ESLint to check code quality

## 🏗️ Tech Stack

- **Frontend Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: JavaScript/TypeScript
- **Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query)
- **Styling**: CSS3 / Styled Components / Tailwind CSS
- **State Management**: Zustand
- **Code Quality**: ESLint

## 📁 Project Structure

```
Ongaku/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable React components
│   ├── pages/             # Application pages
│   ├── hooks/             # Custom React hooks
│   ├── queries/           # React Query hooks and API calls
│   ├── utils/             # Utility functions
│   ├── styles/            # CSS/styling files
│   ├── assets/            # Images, icons, etc.
│   └── App.jsx            # Main application component
├── package.json           # Dependencies and scripts
└── vite.config.js         # Vite configuration
```

## 🎨 Features Overview

### Data Management with React Query
- **Efficient API Calls**: Automatic caching, synchronization, and background updates
- **Optimistic Updates**: Instant UI feedback while syncing with server
- **Error Handling**: Built-in error boundaries and retry mechanisms
- **Offline Support**: Cached data available when offline

### Music Player
- Play, pause, skip, and previous controls
- Volume control and mute functionality
- Progress bar with seek functionality
- Shuffle and repeat modes

### Library Management
- Browse music by artists, albums, and genres
- Search functionality with real-time results
- Sorting and filtering options

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set the build command to `npm run build`
3. Set the publish directory to `dist`
4. Deploy!

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow the existing code style
- Run `npm run lint` before committing
- Use meaningful commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite team for the blazing fast build tool
- All contributors who help improve this project

## 📞 Support

If you encounter any issues or have questions:

- Open an [issue](https://github.com/Kshitiz-Dhiman/Ongaku/issues) on GitHub
- Check out the [documentation](https://github.com/Kshitiz-Dhiman/Ongaku/wiki)

## 🔮 Future Enhancements

- [ ] Dark/Light theme toggle
- [ ] Social sharing features
- [ ] Audio equalizer
- [ ] Lyrics display
- [ ] Offline playback support

---

**Made with ❤️ by [Kshitiz Dhiman](https://github.com/Kshitiz-Dhiman)**

*Ongaku (音楽) - Japanese for "music"*
