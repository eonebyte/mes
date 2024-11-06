import { useEffect, useState } from 'react';

const SimulasiIoT = () => {
  const [socketMessages, setSocketMessages] = useState([]);
  const [influxData, setInfluxData] = useState([]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3000/websocket');

    socket.addEventListener('open', () => {
      console.log('Connected to the server');
    });

    socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data); // Parse data JSON
      console.log('Received from WebSocket:', data);
      setSocketMessages(prevMessages => [...prevMessages, data]); // Tambahkan pesan baru ke state
    });

    socket.addEventListener('close', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.close(); // Tutup socket saat komponen di-unmount
    };
  }, []);

  useEffect(() => {
    const fetchInfluxData = async () => {
      try {
        const response = await fetch('http://localhost:3000/machine-downtime');
        const data = await response.json();
        setInfluxData(data);
      } catch (error) {
        console.error('Error fetching InfluxDB data:', error);
      }
    };

    fetchInfluxData();
  }, []);

  return (
    <div>
      <h1>Device Messages</h1>
      <h2>From WebSocket</h2>
      <ul>
        {socketMessages.map((msg, index) => (
          <li key={index}>
            Device ID: {msg.device_id}, Timestamp: {msg.timestamp}
          </li>
        ))}
      </ul>

      <h2>From InfluxDB</h2>
      <ul>
        {influxData.map((data, index) => (
          <li key={index}>
            Device ID: {data.device_id}, Value: {data._value}, Timestamp: {data._time}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SimulasiIoT;
