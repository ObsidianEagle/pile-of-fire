import { Button, Card } from 'semantic-ui-react';
import './GameButtons.scss';

const GameButtons = ({ drawButtonDisabled, restartButtonVisible, sendDrawCardMessage, sendRestartGameMessage }) => {
  const handleDraw = () => {
    window.scroll({
      top: 0,
      behavior: 'smooth'
    });
    sendDrawCardMessage();
  };

  const handleRestart = () => {
    window.scroll({
      top: 0,
      behavior: 'smooth'
    });
    sendRestartGameMessage();
  };

  return (
    <Card fluid className="game-buttons-card">
      <Card.Content textAlign="center">
        <Button disabled={drawButtonDisabled} onClick={handleDraw} className="game-button">
          Draw Card
        </Button>
        {restartButtonVisible && (
          <Button onClick={handleRestart} className="game-button">
            Restart Game
          </Button>
        )}
      </Card.Content>
    </Card>
  );
};

export default GameButtons;
