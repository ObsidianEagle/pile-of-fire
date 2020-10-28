import { useEffect } from 'react';
import { IN_PROGRESS } from '../constants/statuses';
import { DRAW_CARD, GAME_STATE } from '../constants/messages';

const GamePage = ({ playerId, gameState, setGameState }) => {
  const { nextPlayer, status } = gameState;

  const drawCard = () => {
    window.ws.send(JSON.stringify({ type: DRAW_CARD }));
  };

  useEffect(() => {
    window.ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        case GAME_STATE:
          setGameState(msg.payload.gameState);
          break;
        default:
          console.log(msg);
          break;
      }
    };
  }, [setGameState]);

  useEffect(() => {
    console.log(gameState);
  }, [gameState]);

  return (
    <div>
      <button onClick={drawCard} disabled={nextPlayer !== playerId && status === IN_PROGRESS}>
        Draw Card
      </button>
    </div>
  );
};

export default GamePage;
