import { useEffect, useState } from 'react';
import { Container, Grid } from 'semantic-ui-react';
import AdminCommands from '../../components/admin-commands/AdminCommands';
import DarkModeToggle from '../../components/dark-mode-toggle/DarkModeToggle';
import Deck from '../../components/deck/Deck';
import GameButtons from '../../components/game-buttons/GameButtons';
import MateList from '../../components/mate-list/MateList';
import MateModal from '../../components/mate-modal/MateModal';
import MuteToggle from '../../components/mute-toggle/MuteToggle';
import PlayerList from '../../components/player-list/PlayerList';
import RoomCodeDisplay from '../../components/room-code-display/RoomCodeDisplay';
import RuleList from '../../components/rule-list/RuleList';
import RuleModal from '../../components/rule-modal/RuleModal';
import SpecialCardHolder from '../../components/special-card-holder/SpecialCardHolder';
import StatusMessage from '../../components/status-message/StatusMessage';
import TurnDisplay from '../../components/turn-display/TurnDisplay';
import {
  DRAW_CARD,
  PLAYER_CHOICE_REQUEST,
  PLAYER_CHOICE_RESPONSE,
  RESTART_GAME,
  ROOM_STATE,
  SKIP_TURN
} from '../../constants/messages';
import { GAME_ENDED, GAME_ENDED_FROM_ERROR, IN_PROGRESS } from '../../constants/statuses';
import eventBus from '../../utils/eventBus';
import './GamePage.scss';

const GamePage = ({ playerId, roomState, ws, setRoomState, darkMode, toggleDarkMode, muted, toggleMute }) => {
  const [showMateModal, setShowMateModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [mobileWidth, setMobileWidth] = useState(false);

  useEffect(() => {
    window.addEventListener('resize', () => setMobileWidth(window.innerWidth < 600));
  }, [setMobileWidth]);

  useEffect(() => {
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        case ROOM_STATE:
          setRoomState(msg.payload.room);
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
              console.debug(msg);
              break;
          }
          break;
        default:
          console.debug(msg);
          break;
      }
    };

    ws.onclose = () => {
      eventBus.emit('flash', {
        header: 'Server Error',
        content: 'Connection closec'
      });
      setTimeout(window.location.reload.bind(window.location), 5000);
    };
  }, [setRoomState, ws]);

  /* DEBUG */
  useEffect(() => {
    console.debug(roomState);
  }, [roomState]);

  if (!roomState) return null;

  const {
    code: roomCode,
    host: hostId,
    gameState: { nextPlayer, lastPlayer, deck, lastCardDrawn, players, specialHolders, status, rules, mates, endless }
  } = roomState;

  const sendDrawCardMessage = () => {
    const msgObject = {
      type: DRAW_CARD,
      room: roomCode
    };
    const msgString = JSON.stringify(msgObject);
    ws.send(msgString);
  };

  const sendRestartGameMessage = () => {
    const msgObject = {
      type: RESTART_GAME,
      room: roomCode
    };
    const msgString = JSON.stringify(msgObject);
    ws.send(msgString);
  };

  const chooseMate = (mateId) => {
    const msgObject = {
      type: PLAYER_CHOICE_RESPONSE,
      room: roomCode,
      payload: {
        mateId
      }
    };
    const msgString = JSON.stringify(msgObject);
    ws.send(msgString);
    setShowMateModal(false);
  };

  const chooseRule = (rule) => {
    const msgObject = {
      type: PLAYER_CHOICE_RESPONSE,
      room: roomCode,
      payload: {
        rule
      }
    };
    const msgString = JSON.stringify(msgObject);
    ws.send(msgString);
    setShowRuleModal(false);
  };

  const skipTurn = () => {
    const msgObject = {
      type: SKIP_TURN,
      room: roomCode
    };
    const msgString = JSON.stringify(msgObject);
    ws.send(msgString);
  };

  const findPlayerName = (id) => players.find((player) => player.id === id)?.name;

  const desktopView = (
    <Grid stackable>
      <Grid.Column width={10}>
        <TurnDisplay playerName={findPlayerName(lastPlayer)} card={lastCardDrawn} isMuted={muted} />
        <StatusMessage playerName={findPlayerName(lastPlayer)} status={status} />
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
            <Deck cardsRemaining={deck.length} endless={endless} />
            <PlayerList
              players={players}
              nextPlayerName={findPlayerName(nextPlayer)}
              thisPlayerName={findPlayerName(playerId)}
            />
            {mates.length ? <MateList mates={mates} players={players} /> : null}
            <GameButtons
              drawButtonDisabled={nextPlayer !== playerId || status !== IN_PROGRESS}
              restartButtonVisible={status === GAME_ENDED || status === GAME_ENDED_FROM_ERROR}
              sendDrawCardMessage={sendDrawCardMessage}
              sendRestartGameMessage={sendRestartGameMessage}
            />
            {hostId === playerId ? <AdminCommands skipTurn={skipTurn} /> : null}
          </Grid.Column>
        </Grid>
      </Grid.Column>
    </Grid>
  );

  const mobileView = (
    <>
      <TurnDisplay playerName={findPlayerName(lastPlayer)} card={lastCardDrawn} mobile={true} isMuted={muted} />
      <StatusMessage playerName={findPlayerName(lastPlayer)} status={status} />
      {rules.length ? <RuleList rules={rules} /> : null}
      {Object.keys(specialHolders).filter((key) => specialHolders[key]).length ? (
        <Grid columns={Object.keys(specialHolders).filter((key) => specialHolders[key]).length}>
          {Object.keys(specialHolders).map((key) =>
            specialHolders[key] ? (
              <Grid.Column key={key}>
                <SpecialCardHolder
                  playerName={findPlayerName(specialHolders[key].player)}
                  card={specialHolders[key].card}
                  key={key}
                />
              </Grid.Column>
            ) : null
          )}
        </Grid>
      ) : null}
      {mates.length ? <MateList mates={mates} players={players} /> : null}
      <Grid columns={2}>
        <Grid.Column>
          <PlayerList
            players={players}
            nextPlayerName={findPlayerName(nextPlayer)}
            thisPlayerName={findPlayerName(playerId)}
          />
        </Grid.Column>
        <Grid.Column>
          <Deck cardsRemaining={deck.length} endless={endless} />
          <GameButtons
            drawButtonDisabled={nextPlayer !== playerId || status !== IN_PROGRESS}
            restartButtonVisible={status === GAME_ENDED || status === GAME_ENDED_FROM_ERROR}
            sendDrawCardMessage={sendDrawCardMessage}
            sendRestartGameMessage={sendRestartGameMessage}
          />
        </Grid.Column>
      </Grid>
    </>
  );

  return (
    <div>
      <div className="top-bar">
        <div className="top-bar-left">
          <RoomCodeDisplay roomCode={roomCode} />
        </div>
        <div className="top-bar-right">
          <MuteToggle isMuted={muted} toggleMute={toggleMute} />
          <DarkModeToggle isDark={darkMode} toggleDarkMode={toggleDarkMode} />
        </div>
      </div>
      <Container className="game-page">
        <MateModal playerId={playerId} players={players} mates={mates} chooseMate={chooseMate} isOpen={showMateModal} />
        <RuleModal rules={rules} chooseRule={chooseRule} isOpen={showRuleModal} />
        {mobileWidth ? mobileView : desktopView}
      </Container>
    </div>
  );
};

export default GamePage;
