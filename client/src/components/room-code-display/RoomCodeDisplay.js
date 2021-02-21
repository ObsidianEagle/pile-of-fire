import { Icon } from 'semantic-ui-react';
import './RoomCodeDisplay.scss';

const RoomCodeDisplay = ({ roomCode }) => (
  <div className="room-code-display">
    <h3>
      Room Code: {roomCode}{' '}
      <button
        className="room-code-button"
        onClick={() => navigator.clipboard.writeText(`${window.location.href}?room=${roomCode}`)}
      >
        <Icon name="copy" />
      </button>
    </h3>
  </div>
);

export default RoomCodeDisplay;
