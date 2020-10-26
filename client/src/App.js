import { useEffect, useMemo } from 'react';
import './App.css';

const App = () => {
  const ws = useMemo(() => new WebSocket('ws://localhost:8080'), []);

  useEffect(() => {
    ws.onopen = () => ws.send('sup bro');
    ws.onmessage = (e) => console.log(e.data);
  }, [ws]);

  return (
    <div className="App">
      WORK IN PROGRESS
    </div>
  );
}

export default App;
