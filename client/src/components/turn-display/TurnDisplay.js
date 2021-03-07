import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Container, Grid } from 'semantic-ui-react';
import { rules } from '../../constants/rules';
import { useAudio } from '../../hooks';
import PlayingCard from '../playing-card/PlayingCard';
import "./TurnDisplay.scss";

const TurnDisplay = ({ playerName, card, mobile, isMuted }) => {
  const [, setAudioPlaying] = useAudio(isMuted);

  useEffect(() => {
    if (card && card.suit === 'SPADES' && card.value === 'A') {
      setAudioPlaying(true);
    } else {
      setAudioPlaying(false);
    }
  }, [card, setAudioPlaying]);

  if (!card) return null;

  const { name, description } = rules[card.value];

  const desktopView = (
    <Container textAlign="center">
      <h3>{playerName || 'The last player'} drew...</h3>
      <PlayingCard card={card} large />
      <h1>{name}</h1>
      <ReactMarkdown className="turn-description">{description}</ReactMarkdown>
    </Container>
  );

  const mobileView = (
    <Grid columns={2}>
      <Grid.Column width={7}>
        <PlayingCard card={card} large />
      </Grid.Column>
      <Grid.Column width={9}>
        <h3>{playerName || 'The last player'} drew...</h3>
        <h1>{name}</h1>
        <ReactMarkdown className="turn-description">{description}</ReactMarkdown>
      </Grid.Column>
    </Grid>
  );

  return mobile ? mobileView : desktopView;
};

export default TurnDisplay;
