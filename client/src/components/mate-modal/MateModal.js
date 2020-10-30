import { Button, Modal } from 'semantic-ui-react';

const MateModal = ({ playerId, players, mates, isOpen, chooseMate }) => {
  let availablePlayers = players.filter((player) => player.id !== playerId);

  if (mates.reduce((acc, val) => acc.concat(val), []).length !== players.length) {
    const existingPairing = mates.find((pairing) => pairing.includes(playerId));
    if (existingPairing) availablePlayers = availablePlayers.filter((player) => !existingPairing.includes(player.id));
  }

  if (!availablePlayers) chooseMate(null);

  return (
    <Modal open={isOpen}>
      <Modal.Header>Pick a player to be your mate</Modal.Header>
      <Modal.Content>
        {availablePlayers.map((player) => (
          <Button key={player.id} onClick={() => chooseMate(player.id)}>
            {player.name}
          </Button>
        ))}
      </Modal.Content>
    </Modal>
  );
};

export default MateModal;
