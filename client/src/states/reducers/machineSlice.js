// machineSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    data: [
        {
            id: 1,
            modulus: 392750,
            work: new Date("2024-05-30T08:00:00").getTime(),
            cycle: 20,
            machineName: "Machine 1",
            status: null,
            imageUrl: "/src/assets/images/machine.png",
            utilization: null,
            stopTimes: [] // Ubah stopTimeInMinutes menjadi array stopTimes
        }
    ],
    logs: [
        {
            id: 1,
            machine_id: 1,
            running:  new Date("2024-05-30T08:00:00").getTime(),
            stop: null,
            totalMinutes: null,
        },
        {
            id: 2,
            machine_id: 1,
            running:  new Date("2024-05-30T08:00:00").getTime(),
            stop: new Date("2024-05-30T12:00:00").getTime(),
            totalMinutes: 240,
        },
        {
            id: 3,
            machine_id: 1,
            running:  new Date("2024-05-30T13:00:00").getTime(),
            stop: new Date("2024-05-30T16:00:00").getTime(),
            totalMinutes: 180,
        },
    ]
};

const machineSlice = createSlice({
    name: 'machines',
    initialState,
    reducers: {
        updateMachineStatus(state, action) {
            const { id, newStatus, stopTime } = action.payload;
            const machine = state.data.find(machine => machine.id === id);
            if (machine) {
                if (newStatus === "Stop") {
                    if (stopTime) {
                        machine.status = newStatus;
                        machine.stopTimes.push(parseInt(stopTime));
                    } else {
                        console.error("Stop time is required when newStatus is 'Stop'.");
                    }
                } else {
                    machine.status = newStatus;
                }
            }
        },
        deleteAllStopTimes(state, action) {
            const { id } = action.payload;
            const machine = state.data.find(machine => machine.id === id);
            if (machine) {
                machine.stopTimes = []; // Kosongkan array stopTimes
            }
        }
    }
});


export const { updateMachineStatus, deleteAllStopTimes } = machineSlice.actions;
export default machineSlice.reducer;
