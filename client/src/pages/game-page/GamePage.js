import { useEffect } from 'react';
import { DRAW_CARD, GAME_STATE } from '../../constants/messages';
import { Card, Container, Grid } from 'semantic-ui-react';
import TurnDisplay from '../../components/turn-display/TurnDisplay';
import Deck from '../../components/deck/Deck';
import PlayerList from '../../components/player-list/PlayerList';
import SpecialCardHolder from '../../components/special-card-holder/SpecialCardHolder';
import DrawCard from '../../components/draw-card/DrawCard';
import './GamePage.scss';

const GamePage = ({ playerId, gameState, setGameState }) => {
  useEffect(() => {
    window.ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        case GAME_STATE:
          setGameState(msg.payload.gameState);
          break;
        default:
          console.log(msg);
          break;
      }
    };
  }, [setGameState]);

  // For debug purposes
  useEffect(() => {
    console.log(gameState);
  }, [gameState]);

  if (!gameState) return null;

  const { nextPlayer, lastPlayer, deck, lastCardDrawn, players, specialHolders } = gameState;

  const sendDrawCardMessage = () => {
    window.ws.send(JSON.stringify({ type: DRAW_CARD }));
  };

  const findPlayerName = (id) => players.find((player) => player.id === id)?.name;

  return (
    <Container className="game-page">
      <Grid stackable>
        <Grid.Column width={10}>
          <TurnDisplay playerName={findPlayerName(lastPlayer)} card={lastCardDrawn} />
        </Grid.Column>
        <Grid.Column width={6}>
          <Grid stackable>
            <Grid.Column width={8}>
              {Object.keys(specialHolders).map((key) =>
                specialHolders[key] ? (
                  <SpecialCardHolder
                    playerName={findPlayerName(specialHolders[key].player)}
                    card={specialHolders[key].card}
                    key={key}
                  />
                ) : null
              )}
            </Grid.Column>
            <Grid.Column width={8}>
              <Deck cardsRemaining={deck.length} />
              <PlayerList players={players} nextUp={nextPlayer} />
              <DrawCard disabled={nextPlayer !== playerId} sendDrawCardMessage={sendDrawCardMessage} />
            </Grid.Column>
          </Grid>
        </Grid.Column>
      </Grid>
    </Container>
  );
};

export default GamePage;
