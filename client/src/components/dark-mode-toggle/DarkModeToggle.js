import { Checkbox } from 'semantic-ui-react';
import './DarkModeToggle.scss';

const DarkModeToggle = ({ isDark, toggleDarkMode }) => (
  <Checkbox toggle checked={isDark} onChange={toggleDarkMode} className="dark-mode-toggle" />
);

export default DarkModeToggle;
