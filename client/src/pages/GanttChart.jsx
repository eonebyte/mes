import { useEffect, useRef } from "react";
import "dhtmlx-gantt/dhtmlxgantt.css";
import gantt from "dhtmlx-gantt";

const GanttChartPage = () => {
    const ganttContainer = useRef(null);

    useEffect(() => {
        // Konfigurasi Gantt Chart
        gantt.config.scale_unit = "day";
        gantt.config.date_scale = "%d %M";
        gantt.config.subscales = [{ unit: "hour", step: 4, date: "%H:%i" }];
        gantt.config.show_baseline = true; // Menampilkan baseline
        gantt.config.columns = [
            { name: "text", label: "Task name", width: "*", tree: true },
            { name: "start_date", label: "Start", align: "center" },
            { name: "duration", label: "Duration", align: "center" },
        ];

        // Data dummy
        const tasks = {
            data: [
                {
                    id: 1,
                    text: "Project #1",
                    start_date: "2024-12-01",
                    duration: 5,
                    progress: 0.6,
                    baseline_start_date: "2024-12-01",
                    baseline_end_date: "2024-12-05",
                    open: true,
                },
                {
                    id: 2,
                    text: "Task #1",
                    start_date: "2024-12-02",
                    duration: 3,
                    progress: 0.4,
                    parent: 1,
                    baseline_start_date: "2024-12-02",
                    baseline_end_date: "2024-12-04",
                },
                {
                    id: 3,
                    text: "Task #2",
                    start_date: "2024-12-04",
                    duration: 4,
                    progress: 0.8,
                    parent: 1,
                    baseline_start_date: "2024-12-03",
                    baseline_end_date: "2024-12-06",
                },
            ],
        };

        gantt.init(ganttContainer.current);
        gantt.parse(tasks);

        return () => {
            gantt.clearAll();
        };
    }, []);

    return (
        <div>
            <h1>Gantt Chart with Baseline</h1>
            <div
                ref={ganttContainer}
                style={{ width: "100%", height: "600px" }}
            ></div>
        </div>
    );
};

export default GanttChartPage;
