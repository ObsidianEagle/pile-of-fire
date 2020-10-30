import { useState } from 'react';
import { Button, Container, Header, Input } from 'semantic-ui-react';
import './LandingPage.scss';

const LandingPage = ({ enterGame }) => {
  let initialHost = '';
  if (window.location.search.length) {
    const queryParams = window.location.search
      .substring(1)
      .split('&')
      .map(s => s.split('='));
    const hostParam = queryParams.find(pair => pair[0] === 'host');
    if (hostParam) initialHost = hostParam[1];
  }

  const [name, setName] = useState('');
  const [host, setHost] = useState(initialHost);
  return (
    <Container textAlign="center" className="landing-page">
      <Header className="main-header">Pile of Fire</Header>
      <Input
        label="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="form-element form-input"
        maxLength={12}
      />
      <Input
        label="Host Address"
        value={host}
        onChange={(e) => setHost(e.target.value)}
        className="form-element form-input"
      />
      <Button
        disabled={!name || !host}
        onClick={() => enterGame(host, name)}
        className="form-element enter-game-button"
      >
        Enter Game
      </Button>
    </Container>
  );
};

export default LandingPage;
