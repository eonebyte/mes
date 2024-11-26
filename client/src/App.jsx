import Dashboard from "./pages/Dashboard";
import { Routes, Route, useLocation } from "react-router-dom";
import IROEEStatus from "./pages/IROEEStatus";
import './Chart.css'
import './index.css'
import MachineDowntime from "./pages/MachineDowntime";
import SimulasiIoT from "./pages/SimulasiIoT";
import DashboardResource from "./pages/ShopFloor/DashboardResource";
import ActiveResource from "./pages/ShopFloor/ActiveResource";
import PlanResource from "./pages/ShopFloor/PlanResource";

const resourceModules = {
  active: ActiveResource,
  plan: PlanResource,
  default: DashboardResource, // Modul default jika tidak ada yang cocok
};

function App() {

  const location = useLocation();
  const modulName = location.state?.module;
  
  const ResourceComponent = resourceModules[modulName] || resourceModules.default;

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />}></Route>
        <Route path="/shopfloor" element={<DashboardResource />}></Route>
        <Route path="/resource" element={<ResourceComponent />}></Route>
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
