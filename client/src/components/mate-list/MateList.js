import { Card } from 'semantic-ui-react';
import './MateList.scss';

const MateList = ({ mates, players }) => (
  <Card fluid className="mate-list-card">
    <Card.Header textAlign="center">
      <h4>Mates</h4>
    </Card.Header>
    <Card.Content className="mate-list-content">
      <ul>
        {mates.map((pairing) => (
          <li key={pairing.join()}>
            {pairing.map((playerId) => players.find((player) => player.id === playerId).name).join(' ❤️ ')}
          </li>
        ))}
      </ul>
    </Card.Content>
  </Card>
);

export default MateList;
