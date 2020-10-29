import Cards from '../../assets/cards';

const PlayingCard = ({ card, back}) => {
  if (back) {
    return <Cards.B1 />
  } else {
    const componentName = card.suit.substr(0, 1) + card.value;
    const Component = Cards[componentName];
    return <Component />;
  }
};

export default PlayingCard;
