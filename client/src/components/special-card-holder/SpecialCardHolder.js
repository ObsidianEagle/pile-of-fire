import { Card } from 'semantic-ui-react';
import { CAPTAIN, QUESTION_MASTER, THUMB_MASTER } from '../../constants/specialCards';
import PlayingCard from '../playing-card/PlayingCard';

const SpecialCardHolder = ({ playerName, card }) => {
  let title;
  switch (card.value) {
    case 'A':
      title = CAPTAIN;
      break;
    case 'Q':
      title = QUESTION_MASTER;
      break;
    case '5':
      title = THUMB_MASTER;
      break;
    default:
      break;
  }

  return (
    <Card fluid>
      <Card.Header>{title}</Card.Header>
      <Card.Content>
        <PlayingCard card={card} />
        <b>{playerName}</b>
      </Card.Content>
    </Card>
  );
};

export default SpecialCardHolder;
