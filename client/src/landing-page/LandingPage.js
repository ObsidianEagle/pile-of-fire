import { useState } from 'react';

const LandingPage = ({ enterGame }) => {
  const [name, setName] = useState('');
  const [host, setHost] = useState('');
  return (
    <>
      <div>
        <label htmlFor="host-input">Host Address</label>
        <input name="host-input" value={host} onChange={(e) => setHost(e.target.value)} />
      </div>
      <div>
        <label htmlFor="name-input">Name</label>
        <input name="name-input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <button onClick={() => enterGame(host, name)}>Enter Game</button>
      </div>
    </>
  );
};

export default LandingPage;
