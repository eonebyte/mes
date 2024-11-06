import Dashboard from "./pages/Dashboard";
import { Routes, Route } from "react-router-dom";
import IROEEStatus from "./pages/IROEEStatus";
import './Chart.css'
import MachineDowntime from "./pages/MachineDowntime";
import SimulasiIoT from "./pages/SimulasiIoT";

function App() {
  return (
    <>
        <Routes>
          <Route path="/" element={<Dashboard />}></Route>
          <Route path="/ir-oee-status" element={<IROEEStatus />}></Route>
          <Route path="/machine-downtime" element={<MachineDowntime />}></Route>
          <Route path="/simulasi-iot" element={<SimulasiIoT />}></Route>
          {/* <Route path="/home" element={<Home />}></Route> */}
          {/* <Route path="/gedung-b" element={<GedungB />}></Route> */}
        </Routes>
    </>
  );
}

export default App;
