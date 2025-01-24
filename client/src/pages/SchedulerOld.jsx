import LayoutDashboard from "../components/layouts/LayoutDashboard";
import { Gantt, Willow } from "wx-react-gantt";
import "wx-react-gantt/dist/gantt.css";

const SchedulerOld = () => {
  const tasks = [
    {
      id: 1,
      start: new Date(2024, 3, 3),
      duration: 4,
      text: "React Gantt Widget",
      progress: 60,
      type: "summary",
      open: true,
      base_start: new Date(2024, 3, 1),
      base_end: new Date(2024, 3, 5),
    },
    {
      id: 2,
      start: new Date(2024, 3, 3),
      duration: 3,
      text: "Lib-Gantt",
      progress: 80,
      parent: 1,
      type: "task",
      base_start: new Date(2024, 3, 2),
      base_end: new Date(2024, 3, 4),
    },
  ];

  const links = [{ id: 1, source: 1, target: 2, type: "e2e" }];

  const scales = [
    { unit: "month", step: 1, format: "MMMM yyyy" },
    { unit: "day", step: 1, format: "d" },
  ];

  return (
    <LayoutDashboard>
      <div style={{ marginTop: 5 }}>
        <Willow>
          <Gantt tasks={tasks} links={links} scales={scales} baselines={true} />
        </Willow>
      </div>
    </LayoutDashboard>
  );
};

export default SchedulerOld;
