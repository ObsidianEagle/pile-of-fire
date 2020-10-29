import { Card } from 'semantic-ui-react';
import PlayingCard from '../playing-card/PlayingCard';

const Deck = ({ cardsRemaining }) => (
  <Card fluid>
    <Card.Header textAlign="center"><h4>Deck</h4></Card.Header>
    <Card.Content textAlign="center">
      <PlayingCard back />
      <div>
        <b>Remaining: {cardsRemaining}</b>
      </div>
    </Card.Content>
  </Card>
);

export default Deck;
