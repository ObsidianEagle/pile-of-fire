import { Card } from 'semantic-ui-react';
import PlayingCard from '../playing-card/PlayingCard';

const Deck = ({ cardsRemaining }) => (
  <Card fluid>
    <Card.Header>Deck</Card.Header>
    <Card.Content>
      <PlayingCard back />
      <b>Remaining: {cardsRemaining}</b>
    </Card.Content>
  </Card>
);

export default Deck;
