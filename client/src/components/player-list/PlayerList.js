import { Card } from 'semantic-ui-react';

const PlayerList = ({ players, thisPlayerName, nextPlayerName }) => (
  <Card fluid>
    <Card.Header textAlign="center">
      <h4>Players</h4>
    </Card.Header>
    <Card.Content>
      <ol>
        {players.map((player) => (
          <li key={player.name}>{player.name}</li>
        ))}
      </ol>
      <p style={{ textAlign: 'center' }}>
        You are <b>{thisPlayerName}</b><br />
        Next up is {nextPlayerName === thisPlayerName ? <b>{nextPlayerName}</b> : nextPlayerName}
      </p>
    </Card.Content>
  </Card>
);

export default PlayerList;
