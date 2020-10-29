import { Card } from 'semantic-ui-react';

const PlayerList = ({ players }) => (
  <Card fluid>
    <Card.Header textAlign="center"><h4>Players</h4></Card.Header>
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
