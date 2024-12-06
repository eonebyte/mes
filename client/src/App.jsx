import Dashboard from "./pages/Dashboard";
import { Routes, Route } from "react-router-dom";
import IROEEStatus from "./pages/IROEEStatus";
import './Chart.css'
import './index.css'
import MachineDowntime from "./pages/MachineDowntime";
import SimulasiIoT from "./pages/SimulasiIoT";
import DashboardResource from "./pages/ShopFloor/DashboardResource";
import ActiveResource from "./pages/ShopFloor/ActiveResource";
import PlanResource from "./pages/ShopFloor/Plan/PlanResource";
import PlanDetail from "./pages/ShopFloor/Plan/PlanDetail";
import MoldResource from "./pages/ShopFloor/Mold/MoldResource";
import StepMoldSetup from "./pages/ShopFloor/Mold/StepMoldSetup";
import DownResource from "./pages/ShopFloor/Down/DownResource";
import Resources from "./pages/Resources";
import GanttChartPage from "./pages/GanttChart";


function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />}></Route>
        <Route path="/shopfloor" element={<DashboardResource />}></Route>
        <Route path="/resource" element={<ActiveResource />}></Route>
        <Route path="/resource/plan" element={<PlanResource />}></Route>
        <Route path="/resource/plan/detail" element={<PlanDetail />}></Route>
        <Route path="/resource/mold" element={<MoldResource />}></Route>
        <Route path="/resource/mold/setup" element={<StepMoldSetup />}></Route>
        <Route path="/resource/down" element={<DownResource />}></Route>



        <Route path="/ir-oee-status" element={<IROEEStatus />}></Route>
        <Route path="/machine-downtime" element={<MachineDowntime />}></Route>
        <Route path="/simulasi-iot" element={<SimulasiIoT />}></Route>
        <Route path="/resources" element={<Resources />}></Route>
        <Route path="/gantt-chart" element={<GanttChartPage />}></Route>
        {/* <Route path="/home" element={<Home />}></Route> */}
        {/* <Route path="/gedung-b" element={<GedungB />}></Route> */}
      </Routes>
    </>
  );
}

export default App;
