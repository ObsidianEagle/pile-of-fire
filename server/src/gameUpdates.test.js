import test from 'ava';
import { addMates } from './gameUpdates.js';

test('Adding a new mate pairing resets all other mates if it would result in all players being mated', (t) => {
  const gameState = {
    players: [1, 2, 3, 4],
    mates: [
      [1, 2],
      [3, 4]
    ]
  };
  const expectedGameState = {
    players: [1, 2, 3, 4],
    mates: [[1, 3]]
  };
  addMates(1, 3, gameState);

  t.deepEqual(gameState, expectedGameState);
});

test('Joining 2 pairs of mates works if it does not result in all players being mated', (t) => {
  const gameState = {
    players: [1, 2, 3, 4, 5, 6],
    mates: [
      [1, 2],
      [3, 4],
      [5, 6]
    ]
  };
  const expectedGameState = {
    players: [1, 2, 3, 4, 5, 6],
    mates: [
      [1, 2, 3, 4],
      [5, 6]
    ]
  };
  addMates(1, 3, gameState);

  t.deepEqual(gameState.mates.sort(), expectedGameState.mates.sort());
});
