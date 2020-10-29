import { Card } from 'semantic-ui-react';

const MateList = ({ mates, players }) => (
  <Card fluid>
    <Card.Header textAlign="center">
      <h4>Mates</h4>
    </Card.Header>
    <Card.Content>
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
