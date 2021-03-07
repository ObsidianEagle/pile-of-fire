import Switch from 'react-switch';
import './DarkModeToggle.scss';
import { Icon } from 'semantic-ui-react';

const darkIcon = (
  <div className="icon-wrapper">
    <Icon name="moon" className="icon" />
  </div>
);

const lightIcon = (
  <div className="icon-wrapper">
    <Icon name="sun" className="icon" />
  </div>
);

const DarkModeToggle = ({ isDark, toggleDarkMode }) => (
  <Switch
    checked={isDark}
    onChange={toggleDarkMode}
    className="dark-mode-toggle"
    onColor="#707070"
    offColor="#A0A0A0"
    uncheckedIcon={lightIcon}
    checkedIcon={darkIcon}
  />
);

export default DarkModeToggle;
