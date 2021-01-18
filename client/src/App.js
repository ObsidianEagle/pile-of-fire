import { useEffect, useState } from 'react';
import './App.scss';
import GamePage from './pages/game-page/GamePage';
import LandingPage from './pages/landing-page/LandingPage';

const App = () => {
  const [playerId, setPlayerId] = useState(null);
  const [roomState, setRoomState] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [ws, setWs] = useState(null);

  const toggleDarkMode = () => {
    localStorage.setItem('darkMode', (!darkMode).toString());
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (localStorage.getItem('darkMode') === 'true') setDarkMode(true);
  }, []);

  return (
    <div className={`app${darkMode ? ' dark' : ''}`}>
      {playerId >= 0 && roomState ? (
        <GamePage
          playerId={playerId}
          roomState={roomState}
          ws={ws}
          setRoomState={setRoomState}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
      ) : (
        <LandingPage
          setPlayerId={setPlayerId}
          setRoomState={setRoomState}
          setWs={setWs}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
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
