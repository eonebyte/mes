import { useEffect, useState } from 'react';

const SimulasiIoT = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3000/ws');

    socket.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, data]);
    };

    console.log(messages);

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => socket.close();
  }, []);

  return (
    <div>
      <h2>Machine Data Updates</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>{msg.message}</strong> - {new Date(msg.timestamp).toLocaleTimeString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SimulasiIoT;
