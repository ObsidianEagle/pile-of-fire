import { useEffect, useState } from 'react';
import { Button, Modal } from 'semantic-ui-react';

const anyPickWillResetMates = (players, mates) =>
  mates.reduce((acc, cur) => acc + cur.length, 0) === players.length && mates.length === 2;

const MateModal = ({ playerId, players, mates, isOpen, chooseMate }) => {
  const [availablePlayers, setAvailablePlayers] = useState([]);

  useEffect(() => {
    let newAvailablePlayers = players.filter((player) => player.id !== playerId);

    // If pick won't reset mates, remove player's existing mates
    // else, leave them all available
    if (!anyPickWillResetMates(players, mates)) {
      const existingMates = mates.find((pairing) => pairing.includes(playerId));
      if (existingMates) {
        newAvailablePlayers = newAvailablePlayers.filter((player) => !existingMates.includes(player.id));
      }
    }

    setAvailablePlayers(newAvailablePlayers);
  }, [availablePlayers, setAvailablePlayers, players, mates, playerId]);

  useEffect(() => {
    if (isOpen && !availablePlayers.length) chooseMate(null);
  }, [isOpen, availablePlayers.length, chooseMate]);

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
