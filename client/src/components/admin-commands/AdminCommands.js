import { Button, Card } from 'semantic-ui-react';

const AdminCommands = ({ skipTurn }) => (
  <Card fluid>
    <Card.Header textAlign="center">
      <h4>Admin</h4>
    </Card.Header>
    <Card.Content textAlign="center">
      <Button onClick={skipTurn}>Skip Current Turn</Button>
    </Card.Content>
  </Card>
);

export default AdminCommands;
