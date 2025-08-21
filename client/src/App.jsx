import OverAll from "./pages/OverAll";
import { Routes, Route } from "react-router-dom";
import IROEEStatus from "./pages/IROEEStatus";
import './Chart.css'
import './index.css'
import './libs/visavail/visavail.css'
import MachineDowntime from "./pages/MachineDowntime";
import SimulasiIoT from "./pages/SimulasiIoT";
import Dashboard from "./pages/ShopFloor/Dashboard";
import Active from "./pages/ShopFloor/Resource/Active";
import PlanList from "./pages/ShopFloor/Resource/PlanList";
import PlanDetail from "./pages/ShopFloor/Resource/PlanDetail";
import Mold from "./pages/ShopFloor/Resource/Mold";
import MoldSetup from "./pages/ShopFloor/Resource/MoldSetup";
import Down from "./pages/ShopFloor/Resource/Down";
import Resources from "./pages/Resources";
import McRun from "./pages/McRun";
import Import from "./pages/Plan/Import";
import ListPlan from "./pages/Plan/List";
import Login from "./pages/Auth/Login";
import { Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { checkAuthStatus } from "./states/reducers/authSlice";
import { useEffect } from "react";
import TimelineDown from "./pages/ShopFloor/TimelineDown";
import TimelineDownDetail from "./pages/ShopFloor/TimelineDownDetail";
import Forbidden from "./components/Forbidden";
import TableDown from "./pages/ShopFloor/TableDown";

// import ProtectedRoute from "./components/ProtectedRoute";
// <Route path="/resource" element={
//   <ProtectedRoute allowedRoles={['Leader_Produksi']}>
//     <Active />
//   </ProtectedRoute>
// }>
// </Route>

function App() {

  const dispatch = useDispatch();


  const { auth, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  if (isLoading) {
    return <Spin tip="Loading..." spinning={isLoading} fullscreen />;
  }

  if (!auth) {
    return <Login />;
  }


  return (
    <>
      <Routes>
        <Route path="/" element={<OverAll />}></Route>

        {/* Auth */}
        <Route path="/login" element={<Login />}></Route>

        {/* Forbidden */}
        <Route path="/403" element={<Forbidden />}></Route>

        {/* Shopfloor */}
        <Route path="/shopfloor/dashboard" element={<Dashboard />}></Route>
        <Route path="/shopfloor/timeline" element={<TimelineDown />}></Route>
        <Route path="/shopfloor/timeline/detail" element={<TimelineDownDetail />}></Route>
        <Route path="/shopfloor/table/down" element={<TableDown />}></Route>
        <Route path="/resource" element={<Active />}></Route>
        <Route path="/resource/plan" element={<PlanList />}></Route>
        <Route path="/resource/plan/detail" element={<PlanDetail />}></Route>
        <Route path="/resource/mold" element={<Mold />}></Route>
        <Route path="/resource/mold/setup" element={<MoldSetup />}></Route>
        <Route path="/resource/down" element={<Down />}></Route>
        {/* End shopfloor */}

        {/* Plan */}
        <Route path="/plan/list" element={<ListPlan />}></Route>
        <Route path="/plan/import" element={<Import />}></Route>
        {/* End plan */}

        <Route path="/ir-oee-status" element={<IROEEStatus />}></Route>
        <Route path="/machine-downtime" element={<MachineDowntime />}></Route>
        <Route path="/simulasi-iot" element={<SimulasiIoT />}></Route>
        <Route path="/resources" element={<Resources />}></Route>
        <Route path="/mc-run" element={<McRun />}></Route>
        {/* <Route path="/home" element={<Home />}></Route> */}
        {/* <Route path="/gedung-b" element={<GedungB />}></Route> */}
      </Routes>
    </>
  );
}

export default App;
