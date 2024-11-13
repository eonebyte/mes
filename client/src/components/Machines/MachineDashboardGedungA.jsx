import { useState, useEffect } from 'react';
import MachineSVGGedungA from './MachineSVGGedungA';
import { io } from 'socket.io-client'; // Import Socket.IO client

const SERVER_URL = 'http://127.0.0.1:4000'; // Change to your server URL


export default function MachineDashboard() {



    const fillColorGreen = "rgb(33, 244, 54)";
    const fillColorYellow = "rgb(244, 189, 33)";
    const fillColorRed = "rgb(244, 33, 33)";

    const [fillMachines, setFillMachines] = useState({
        machine1: fillColorGreen,
        machine2: fillColorGreen,
        machine3: fillColorGreen,
        machine4: fillColorGreen,
        machine5: fillColorGreen
    });

    useEffect(() => {
        // Connect to the Socket.IO server
        const socket = io(SERVER_URL);

        // Listen for 'connect' event
        socket.on('connect', () => {
            console.log('Socket.IO connection established.');
        });

        // Listen for 'initialState' event to receive initial data from server
        socket.on('initialState', (machinesData) => {
            console.log('Received initial data from server:', machinesData);

            // Update machine statuses
            const updatedFillMachines = {};
            machinesData.forEach((machine, index) => {
                if (machine.status.green) {
                    updatedFillMachines[`machine${index + 1}`] = fillColorGreen;
                } else if (machine.status.yellow) {
                    updatedFillMachines[`machine${index + 1}`] = fillColorYellow;
                } else if (machine.status.red) {
                    updatedFillMachines[`machine${index + 1}`] = fillColorRed;
                } else {
                    updatedFillMachines[`machine${index + 1}`] = fillColorGreen; // Default to green if status is invalid
                }
            });

            setFillMachines(updatedFillMachines);
        });

        // Send a message to the server
        socket.emit('clientMessage', { message: 'Hello Server!' });

        // Clean up
        return () => {
            socket.disconnect(); // Disconnect from the Socket.IO server when component unmounts
        };
    }, []);

    return (
        <div>
            <MachineSVGGedungA fillMachines={fillMachines}
                style={{ width: "100%" }}
            />
        </div>
    );
}
