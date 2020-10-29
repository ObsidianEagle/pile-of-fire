import { useState } from 'react';
import { Button, Input, Modal } from 'semantic-ui-react';

const RuleModal = ({ isOpen, chooseRule, rules }) => {
  const [inputRule, setInputRule] = useState('');

  return (
    <Modal open={isOpen}>
      <Modal.Content>
        <h3>Create a new rule</h3>
        <Input
          action={{ 
            content: 'Add Rule',
            onClick: () => chooseRule(inputRule),
            disabled: inputRule.length < 1
          }}
          value={inputRule}
          onChange={(e) => setInputRule(e.target.value)}
          fluid
        />
        {rules.length ? (
          <>
            <br />
            <h3>Or remove an existing rule</h3>
            {rules.map((rule) => (
              <Button key={rule} onClick={() => chooseRule(rule)} fluid>
                {rule}
              </Button>
            ))}
          </>
        ) : null}
      </Modal.Content>
    </Modal>
  );
};

export default RuleModal;
