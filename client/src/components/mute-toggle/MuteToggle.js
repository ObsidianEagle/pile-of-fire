import { Icon } from 'semantic-ui-react';
import './MuteToggle.scss';

const MuteToggle = ({ isMuted, toggleMute }) => (
  <button onClick={toggleMute} className="mute-toggle">
    <Icon size="large" name={isMuted ? 'volume off' : 'volume up'} disabled />
  </button>
);

export default MuteToggle;
