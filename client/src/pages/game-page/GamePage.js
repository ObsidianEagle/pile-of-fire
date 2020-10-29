import { useEffect, useState } from 'react';
import { Container, Grid } from 'semantic-ui-react';
import Deck from '../../components/deck/Deck';
import DrawCard from '../../components/draw-card/DrawCard';
import MateList from '../../components/mate-list/MateList';
import MateModal from '../../components/mate-modal/MateModal';
import PlayerList from '../../components/player-list/PlayerList';
import RuleList from '../../components/rule-list/RuleList';
import RuleModal from '../../components/rule-modal/RuleModal';
import SpecialCardHolder from '../../components/special-card-holder/SpecialCardHolder';
import StatusMessage from '../../components/status-message/StatusMessage';
import TurnDisplay from '../../components/turn-display/TurnDisplay';
import { DRAW_CARD, GAME_STATE, PLAYER_CHOICE_REQUEST, PLAYER_CHOICE_RESPONSE } from '../../constants/messages';
import { IN_PROGRESS } from '../../constants/statuses';
import './GamePage.scss';

const GamePage = ({ playerId, gameState, setGameState }) => {
  const [showMateModal, setShowMateModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  useEffect(() => {
    window.ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        case GAME_STATE:
          setGameState(msg.payload.gameState);
          break;
        case PLAYER_CHOICE_REQUEST:
          const { value } = msg.payload.card;
          switch (value) {
            case '8':
              setShowMateModal(true);
              break;
            case 'J':
              setShowRuleModal(true);
              break;
            default:
              console.log(msg);
              break;
          }
          break;
        default:
          console.log(msg);
          break;
      }
    };

    window.ws.onclose = () => {
      setConnectionError('Game connection closed by server');
      setTimeout(window.location.reload.bind(window.location), 5000)
    }
  }, [setGameState]);

  // For debug purposes
  useEffect(() => {
    console.log(gameState);
  }, [gameState]);

  if (!gameState) return null;

  const { nextPlayer, lastPlayer, deck, lastCardDrawn, players, specialHolders, status, rules, mates } = gameState;

  const sendDrawCardMessage = () => {
    const msgObject = {
      type: DRAW_CARD
    };
    const msgString = JSON.stringify(msgObject);
    window.ws.send(msgString);
  };

  const chooseMate = (mateId) => {
    const msgObject = {
      type: PLAYER_CHOICE_RESPONSE,
      payload: {
        mateId
      }
    };
    const msgString = JSON.stringify(msgObject);
    window.ws.send(msgString);
    setShowMateModal(false);
  };

  const chooseRule = (rule) => {
    const msgObject = {
      type: PLAYER_CHOICE_RESPONSE,
      payload: {
        rule
      }
    };
    const msgString = JSON.stringify(msgObject);
    window.ws.send(msgString);
    setShowRuleModal(false);
  };

  const findPlayerName = (id) => players.find((player) => player.id === id)?.name;

  return (
    <Container className="game-page">
      <MateModal playerId={playerId} players={players} mates={mates} chooseMate={chooseMate} isOpen={showMateModal} />
      <RuleModal rules={rules} chooseRule={chooseRule} isOpen={showRuleModal} />
      <Grid stackable>
        <Grid.Column width={10}>
          <TurnDisplay playerName={findPlayerName(lastPlayer)} card={lastCardDrawn} />
          <StatusMessage playerName={findPlayerName(lastPlayer)} status={status} overrideMessage={connectionError} />
          <br />
          {rules.length ? <RuleList rules={rules} /> : null}
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
              <DrawCard
                disabled={nextPlayer !== playerId || status !== IN_PROGRESS}
                sendDrawCardMessage={sendDrawCardMessage}
              />
              {mates.length ? <MateList mates={mates} players={players} /> : null}
            </Grid.Column>
          </Grid>
        </Grid.Column>
      </Grid>
    </Container>
  );
};

export default GamePage;
