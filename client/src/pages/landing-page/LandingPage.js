import { useEffect, useState } from 'react';
import { Button, Container, Divider, Grid, Header, Input, Segment } from 'semantic-ui-react';
import DarkModeToggle from '../../components/dark-mode-toggle/DarkModeToggle';
import StatusMessage from '../../components/status-message/StatusMessage';
import { PLAYER_INIT, PLAYER_INIT_ACK, ROOM_INIT, SERVER_ERROR } from '../../constants/messages';
import './LandingPage.scss';

const PROTOCOL = process.env.REACT_APP_USE_WSS === 'true' ? 'wss' : 'ws';
const HOST = process.env.REACT_APP_SERVER_ADDRESS;

const LandingPage = ({ setPlayerId, setRoomState, setWs, darkMode, toggleDarkMode }) => {
  let initialRoomCode = '';
  if (window.location.search.length) {
    const queryParams = window.location.search
      .substring(1)
      .split('&')
      .map((s) => s.split('='));
    const roomCodeParam = queryParams.find((pair) => pair[0] === 'room');
    if (roomCodeParam) initialRoomCode = roomCodeParam[1];
  }

  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [numberOfDecks, setNumberOfDecks] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [mobileWidth, setMobileWidth] = useState(false);

  useEffect(() => {
    window.addEventListener('resize', () => setMobileWidth(window.innerWidth < 768));
  }, [setMobileWidth]);

  const joinRoom = (event, name, roomCode) => {
    event.preventDefault();
    setConnecting(true);
    const ws = new WebSocket(`${PROTOCOL}://${HOST}`);
    setWs(ws);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: PLAYER_INIT, payload: { name: name.trim(), room: roomCode } }));
      const preventTimeoutInterval = window.setInterval(() => fetch(HOST), 1500000);
      localStorage.setItem('preventTimeoutInterval', preventTimeoutInterval);
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        case PLAYER_INIT_ACK:
          setRoomState(msg.payload.room);
          setPlayerId(msg.payload.id);
          break;
        case SERVER_ERROR:
          setErrorMessage(msg.payload.errorMessage);
          ws.close();
          break;
        default:
          console.log(msg);
          break;
      }
      setConnecting(false);
    };

    ws.onerror = (e) => console.error(`WebSocket error: ${JSON.stringify(e)}`);

    ws.onclose = (e) => {
      console.error(`Connection closed: ${e.code} - ${e.reason}`);
      const preventTimeoutInterval = localStorage.getItem('preventTimeoutInterval');
      window.clearInterval(preventTimeoutInterval);
    }
  };

  const createRoom = (event, name, numberOfDecks) => {
    event.preventDefault();
    setConnecting(true);
    const ws = new WebSocket(`${PROTOCOL}://${HOST}`);
    setWs(ws);

    ws.onopen = () => {
      const decks = parseInt(numberOfDecks);
      ws.send(
        JSON.stringify({
          type: ROOM_INIT,
          payload: {
            name: name.trim(),
            numberOfDecks: isNaN(decks) || decks < 1 ? 1 : decks
          }
        })
      );
      const preventTimeoutInterval = window.setInterval(() => fetch(HOST), 1500000);
      localStorage.setItem('preventTimeoutInterval', preventTimeoutInterval);
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        case PLAYER_INIT_ACK:
          setRoomState(msg.payload.room);
          setPlayerId(msg.payload.id);
          break;
        case SERVER_ERROR:
          setErrorMessage(msg.payload.errorMessage);
          console.error(msg.payload.errorMessage);
          ws.close();
          break;
        default:
          console.log(msg);
          break;
      }
      setConnecting(false);
    };

    ws.onerror = (e) => setErrorMessage(`WebSocket error: ${JSON.stringify(e)}`);

    ws.onclose = (e) => {
      setErrorMessage(`Connection closed: ${e.code} - ${e.reason}`);
      const preventTimeoutInterval = localStorage.getItem('preventTimeoutInterval');
      window.clearInterval(preventTimeoutInterval);
    }
  };

  return (
    <div className="landing-page">
      <div className="dark-mode-toggle-container">
        <DarkModeToggle isDark={darkMode} toggleDarkMode={toggleDarkMode} />
      </div>
      <Container textAlign="center">
        <Header className="main-header">Pile of Fire</Header>
        <Segment>
          <Grid stackable relaxed="very" columns={2} divided={mobileWidth}>
            <Grid.Column>
              <form>
                <Input
                  label="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-element form-input"
                  maxLength={12}
                />
                <Input
                  label="Number of Decks"
                  value={numberOfDecks}
                  onChange={(e) => setNumberOfDecks(e.target.value)}
                  className="form-element form-input"
                  maxLength={2}
                />
                <br />
                <Button
                  disabled={!name || connecting}
                  onClick={(e) => createRoom(e, name, numberOfDecks)}
                  className="form-element enter-game-button"
                  type="submit"
                >
                  Create Room
                </Button>
              </form>
            </Grid.Column>
            <Grid.Column>
              <form>
                <Input
                  label="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-element form-input"
                  maxLength={12}
                />
                <Input
                  label="Room Code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="form-element form-input"
                  maxLength={5}
                />
                <br />
                <Button
                  disabled={!name || !roomCode || connecting}
                  onClick={(e) => joinRoom(e, name, roomCode)}
                  className="form-element enter-game-button"
                  type="submit"
                >
                  Join Room
                </Button>
              </form>
            </Grid.Column>
          </Grid>
          {!mobileWidth && <Divider vertical>OR</Divider>}
        </Segment>
        {errorMessage.length > 0 && <StatusMessage message={errorMessage} />}
      </Container>
    </div>
  );
};

export default LandingPage;
