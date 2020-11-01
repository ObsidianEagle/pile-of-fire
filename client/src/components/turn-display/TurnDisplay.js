import { Container, Grid } from 'semantic-ui-react';
import { rules } from '../../constants/rules';
import PlayingCard from '../playing-card/PlayingCard';

const TurnDisplay = ({ playerName, card, mobile }) => {
  if (!card) return null;

  const { name, description } = rules[card.value];

  const desktopView = (
    <Container textAlign="center">
      <h3>{playerName || "The last player"} drew...</h3>
      <PlayingCard card={card} large />
      <h1>{name}</h1>
      <h3>{description}</h3>
    </Container>
  );

  const mobileView = (
    <Grid columns={2}>
      <Grid.Column width={7}>
        <PlayingCard card={card} large />
      </Grid.Column>
      <Grid.Column width={9}>
        <h3>{playerName || "The last player"} drew...</h3>
        <h1>{name}</h1>
        <h3>{description}</h3>
      </Grid.Column>
    </Grid>
  );

  return mobile ? mobileView : desktopView;
};

export default TurnDisplay;
