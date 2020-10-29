import { Container } from 'semantic-ui-react';
import { rules } from '../../constants/rules';
import PlayingCard from '../playing-card/PlayingCard';

const TurnDisplay = ({ playerName, card }) => {
  if (!card) return null;

  const { name, description } = rules[card.value];

  return (
    <Container textAlign="center">
      <h6>{playerName} drew...</h6>
      <PlayingCard card={card} />
      <h2>{name}</h2>
      <h4>{description}</h4>
    </Container>
  );
};

export default TurnDisplay;
