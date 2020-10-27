import { useEffect, useMemo } from 'react';
import './App.css';

const App = () => {
  const ws = useMemo(() => new WebSocket('ws://localhost:8080'), []);

  // Open socket after entering data, client sends init
  useEffect(() => {
    ws.onopen = () => ws.send(JSON.stringify({ type: 'PLAYER_INIT', payload: { name: 'hello' } }));
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        case 'PLAYER_INIT_ACK':
          console.log(msg.payload);
          ws.send(JSON.stringify({ type: 'MAKE_MOVE', payload: { suit: 'C', value: '4' } }));
          break;
        default:
          console.log(msg.payload);
          break;
      }
    }
  }, [ws]);

  return (
    <div className="App">
      WORK IN PROGRESS
    </div>
  );
}

export default App;
