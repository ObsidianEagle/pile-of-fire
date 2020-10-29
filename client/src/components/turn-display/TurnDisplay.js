import { Container } from 'semantic-ui-react';
import { rules } from '../../constants/rules';
import PlayingCard from '../playing-card/PlayingCard';

const TurnDisplay = ({ playerName, card }) => {
  if (!card) return null;

  const { name, description } = rules[card.value];

  return (
    <Container textAlign="center">
      <h3>{playerName} drew...</h3>
      <PlayingCard card={card} large />
      <h1>{name}</h1>
      <h3>{description}</h3>
    </Container>
  );
};

export default TurnDisplay;
