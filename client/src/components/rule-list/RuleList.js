import { Card } from 'semantic-ui-react';

const RuleList = ({ rules }) => (
  <Card fluid>
    <Card.Header textAlign="center">
      <h4>Rules</h4>
    </Card.Header>
    <Card.Content>
      <ul>
        {rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </Card.Content>
  </Card>
);

export default RuleList;
