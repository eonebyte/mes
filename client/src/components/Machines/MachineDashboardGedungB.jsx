import { useState, useEffect } from 'react';
import MachineSVGGedungB from './MachineSVGGedungB';

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

    // Fungsi untuk menghasilkan angka acak antara 0 dan 255
    const getRandomNumber = () => Math.floor(Math.random() * 256);

    // Fungsi untuk memperbarui status warna lampu berdasarkan nilai yang dihasilkan
    const updateMachineStatus = (value) => {
        if (value > 200) {
            return fillColorRed;
        } else if (value > 100) {
            return fillColorYellow;
        } else {
            return fillColorGreen;
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            const randomizedFillMachines = {
                machine1: updateMachineStatus(getRandomNumber()),
                machine2: updateMachineStatus(getRandomNumber()),
                machine3: updateMachineStatus(getRandomNumber()),
                machine4: updateMachineStatus(getRandomNumber()),
                machine5: updateMachineStatus(getRandomNumber())
            };

            setFillMachines(randomizedFillMachines)
        }, 10000000);

        return () => {
            clearInterval(intervalId);
        };
    }, [])

    return (
        <div>
            <MachineSVGGedungB fillMachines={fillMachines}
                style={{ width: "100%" }}
            />
        </div>
    );
}
