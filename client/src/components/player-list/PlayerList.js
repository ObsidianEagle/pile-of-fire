import { Card } from 'semantic-ui-react';

const PlayerList = ({ players, nextUp }) => (
  <Card fluid>
    <Card.Header textAlign="center">
      <h4>Players</h4>
    </Card.Header>
    <Card.Content>
      <ol>
        {players.map((player) => (
          <li key={player.name}>{nextUp === player.id ? <b>{player.name} (next up)</b> : player.name}</li>
        ))}
      </ol>
    </Card.Content>
  </Card>
);

export default PlayerList;
