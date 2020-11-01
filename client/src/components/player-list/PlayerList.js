import { Card } from 'semantic-ui-react';

const PlayerList = ({ players, thisPlayerName, nextPlayer, lastPlayer }) => (
  <Card fluid>
    <Card.Header textAlign="center">
      <h4>Players</h4>
    </Card.Header>
    <Card.Content>
      <ol>
        {players.map((player) => {
          if (player.name === thisPlayerName) {
            if (player.id === nextPlayer) {
              return (
                <li key={player.name}>
                  <b>{player.name}</b> (next up)
                </li>
              );
            } else if (player.id === lastPlayer) {
              return (
                <li key={player.name}>
                  <b>{player.name}</b> (current)
                </li>
              );
            } else {
              return (
                <li key={player.name}>
                  <b>{player.name}</b>
                </li>
              );
            }
          } else {
            if (player.id === nextPlayer) {
              return <li key={player.name}>{player.name} (next up)</li>;
            } else if (player.id === lastPlayer) {
              return <li key={player.name}>{player.name} (current)</li>;
            } else {
              return <li key={player.name}>{player.name}</li>;
            }
          }
        })}
      </ol>
    </Card.Content>
  </Card>
);

export default PlayerList;
