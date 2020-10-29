import { Card } from 'semantic-ui-react';

const PlayerList = ({ players }) => (
  <Card fluid>
    <Card.Header>Players</Card.Header>
    <Card.Content>
      <ol>
        {players.map((player) => (
          <li key={player.name}>{player.name}</li>
        ))}
      </ol>
    </Card.Content>
  </Card>
);

export default PlayerList;
