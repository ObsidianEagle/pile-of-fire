import { useState } from 'react';
import { PLAYER_INIT, PLAYER_INIT_ACK } from './constants/messages';
import GamePage from './pages/game-page/GamePage';
import LandingPage from './pages/landing-page/LandingPage';
import './App.scss';

const PROTOCOL = process.env.REACT_APP_USE_WSS === 'true' ? 'wss' : 'ws';

const App = () => {
  const [playerId, setPlayerId] = useState(null);
  const [gameState, setGameState] = useState(null);

  const enterGame = (host, name) => {
    const ws = new WebSocket(`${PROTOCOL}://${host}`);
    window.ws = ws;

    ws.onopen = () => ws.send(JSON.stringify({ type: PLAYER_INIT, payload: { name: name } }));

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        case PLAYER_INIT_ACK:
          setGameState(msg.payload.gameState);
          setPlayerId(msg.payload.id);
          break;
        default:
          console.log(msg);
          break;
      }
    };
  };

  return (
    <div className="App">
      {playerId >= 0 && gameState ? (
        <GamePage playerId={playerId} gameState={gameState} setGameState={setGameState} />
      ) : (
        <LandingPage enterGame={enterGame} />
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
