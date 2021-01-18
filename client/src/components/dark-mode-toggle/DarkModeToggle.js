import { Checkbox } from 'semantic-ui-react';

const DarkModeToggle = ({ isDark, toggleDarkMode }) => (
  <Checkbox toggle checked={isDark} onChange={toggleDarkMode} />
);

export default DarkModeToggle;
