import { Button, Card } from 'semantic-ui-react';
import './DrawCard.scss';

const DrawCard = ({ disabled, sendDrawCardMessage }) => {
  const handleClick = () => {
    window.scroll({
      top: 0,
      behavior: 'smooth'
    });
    sendDrawCardMessage();
  }

  return (
    <Card fluid className="draw-card">
      <Card.Content textAlign="center">
        <Button disabled={disabled} onClick={handleClick} className="draw-card-button">
          Draw Card
        </Button>
      </Card.Content>
    </Card>
  );
}

export default DrawCard;
