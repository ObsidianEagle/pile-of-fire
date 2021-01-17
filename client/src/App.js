import { useState } from 'react';
import './App.scss';
import GamePage from './pages/game-page/GamePage';
import LandingPage from './pages/landing-page/LandingPage';

const App = () => {
  const [playerId, setPlayerId] = useState(null);
  const [roomState, setRoomState] = useState(null);
  const [ws, setWs] = useState(null);

  return (
    <div className="App">
      {playerId >= 0 && roomState ? (
        <GamePage playerId={playerId} roomState={roomState} ws={ws} setRoomState={setRoomState} />
      ) : (
        <LandingPage setPlayerId={setPlayerId} setRoomState={setRoomState} setWs={setWs} />
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
