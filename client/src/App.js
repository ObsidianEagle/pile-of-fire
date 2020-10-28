import { useState } from 'react';
import { PLAYER_INIT, PLAYER_INIT_ACK } from './constants/messages';
import GamePage from './game-page/GamePage';
import LandingPage from './landing-page/LandingPage';

const App = () => {
  const [playerId, setPlayerId] = useState(null);
  const [gameState, setGameState] = useState(null);

  const enterGame = (host, name) => {
    const ws = new WebSocket(`ws://${host}`);
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
    </div>
  );
};

export default App;
