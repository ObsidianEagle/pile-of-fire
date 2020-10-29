import { Button, Card } from 'semantic-ui-react';
import './DrawCard.scss';

const DrawCard = ({ disabled, sendDrawCardMessage }) => (
  <Card fluid className="draw-card">
    <Card.Content textAlign="center">
      <Button disabled={disabled} onClick={sendDrawCardMessage} className="draw-card-button">
        Draw Card
      </Button>
    </Card.Content>
  </Card>
);

export default DrawCard;
