import { Button, Card } from 'semantic-ui-react';

const DrawCard = ({ disabled, sendDrawCardMessage }) => (
  <Card fluid>
    <Card.Content>
      <Button disabled={disabled} onClick={sendDrawCardMessage}>
        Draw Card
      </Button>
    </Card.Content>
  </Card>
);

export default DrawCard;
