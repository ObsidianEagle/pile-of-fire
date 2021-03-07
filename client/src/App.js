import { useEffect, useState } from 'react';
import './App.scss';
import ErrorMessage from './components/error-message/ErrorMessage';
import GamePage from './pages/game-page/GamePage';
import LandingPage from './pages/landing-page/LandingPage';

const App = () => {
  const [playerId, setPlayerId] = useState(null);
  const [roomState, setRoomState] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [muted, setMuted] = useState(false);
  const [ws, setWs] = useState(null);

  const toggleDarkMode = () => {
    localStorage.setItem('darkMode', (!darkMode).toString());
    setDarkMode(!darkMode);
  };

  const toggleMute = () => {
    localStorage.setItem('muted', (!muted).toString());
    setMuted(!muted);
  };

  useEffect(() => {
    if (localStorage.getItem('darkMode') === 'true') setDarkMode(true);
    if (localStorage.getItem('muted') === 'true') setMuted(true);
  }, []);

  return (
    <div className={`app${darkMode ? ' dark' : ''}`}>
      <ErrorMessage />
      {playerId >= 0 && roomState ? (
        <GamePage
          playerId={playerId}
          roomState={roomState}
          ws={ws}
          setRoomState={setRoomState}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          muted={muted}
          toggleMute={toggleMute}
        />
      ) : (
        <LandingPage
          setPlayerId={setPlayerId}
          setRoomState={setRoomState}
          setWs={setWs}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          muted={muted}
          toggleMute={toggleMute}
        />
      )}
      <div className="main-footer">
        <p>
          Created by Alex King. View the source on <a href="https://github.com/ObsidianEagle/pile-of-fire">GitHub</a>.
        </p>
      </div>
    </div>
  );
};

export default App;
