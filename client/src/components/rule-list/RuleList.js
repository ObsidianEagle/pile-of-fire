import { Card } from 'semantic-ui-react';
import './RuleList.scss';

const RuleList = ({ rules }) => (
  <Card fluid className="rule-list-card">
    <Card.Header textAlign="center">
      <h4>Custom Rules</h4>
    </Card.Header>
    <Card.Content className="rule-list-content">
      <ul>
        {rules.map((rule) => (
          <li key={rule.id}>{rule.rule}</li>
        ))}
      </ul>
    </Card.Content>
  </Card>
);

export default RuleList;
