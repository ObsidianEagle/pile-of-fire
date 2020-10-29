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
      <Card.Header textAlign="center"><h4>{title}</h4></Card.Header>
      <Card.Content textAlign="center">
        <PlayingCard card={card} />
        <div>
          <b>{playerName}</b>
        </div>
      </Card.Content>
    </Card>
  );
};

export default SpecialCardHolder;
