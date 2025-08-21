import { useEffect } from 'react';
import './TimelineDownDetail.css'; // Assuming you have a CSS file for styles

const rawItems = [
    { id: 1, content: "Set Up", start: "2025-07-08T07:00:00", end: "2025-07-08T07:15:00", className: "setup" },
    { id: 2, content: "Running", start: "2025-07-08T07:15:00", end: "2025-07-08T07:50:00", className: "running" },
    { id: 3, content: "Failure", start: "2025-07-08T08:00:00", end: "2025-07-08T08:15:00", className: "failure" },
    { id: 4, content: "Running", start: "2025-07-08T08:30:00", end: "2025-07-08T09:00:00", className: "running" },
    { id: 5, content: "Running", start: "2025-07-08T09:00:00", end: "2025-07-08T10:00:00", className: "running" },
    { id: 6, content: "Failure", start: "2025-07-08T10:45:00", end: "2025-07-08T11:30:00", className: "failure" }
];

const TimelineDownDetail = () => {
    useEffect(() => {
        const tbody = document.getElementById("timeline-body");

        // Buat baris jam 07:00 - 15:00
        for (let h = 7; h <= 15; h++) {
            const tr = document.createElement("tr");

            const label = document.createElement("td");
            label.className = "label";
            label.textContent = `${String(h).padStart(2, '0')}:00`;
            tr.appendChild(label);

            const td = document.createElement("td");
            td.colSpan = 4;
            td.style.position = "relative";

            const grid = document.createElement("div");
            grid.className = "grid-container";
            td.appendChild(grid);

            tr.appendChild(td);
            tbody.appendChild(tr);
        }

        // Render items ke grid
        function renderItem(item) {
            const start = new Date(item.start);
            const end = new Date(item.end);
            let current = new Date(start);

            while (current < end) {
                const hour = current.getHours();
                const row = [...tbody.rows].find(r =>
                    r.cells[0].textContent.trim() === `${String(hour).padStart(2, '0')}:00`
                );
                if (!row) break;

                const hourStart = new Date(current);
                hourStart.setMinutes(0, 0, 0);
                const hourEnd = new Date(hourStart);
                hourEnd.setHours(hourEnd.getHours() + 1);

                const segmentEnd = new Date(Math.min(end, hourEnd));

                const minutesFrom = (current - hourStart) / 60000;
                const minutesTo = (segmentEnd - hourStart) / 60000;

                const leftPercent = (minutesFrom / 60) * 100;
                const widthPercent = ((minutesTo - minutesFrom) / 60) * 100;

                if (widthPercent <= 0) break;

                const div = document.createElement("div");
                div.className = `item ${item.className}`;
                div.textContent = item.content;

                div.style.left = `${leftPercent.toFixed(5)}%`;
                div.style.width = `${widthPercent.toFixed(5)}%`;

                row.cells[1].querySelector(".grid-container").appendChild(div);

                current = segmentEnd;
            }
        }

        rawItems.forEach(renderItem);
    }, []);

    return (
        <div style={{ background: '#111', color: 'white', fontFamily: 'Arial, sans-serif', height: '100vh' }}>
            <h2 style={{ padding: 16, background: '#222', margin: 0, borderBottom: '1px solid #444' }}>
                PRODUCTION LINE B1.2-01 [54|HT120]
            </h2>
            <div id="scroll-container">
                <table>
                    <thead>
                        <tr>
                            <th className="label">Jam</th>
                            <th>15</th>
                            <th>30</th>
                            <th>45</th>
                            <th>60</th>
                        </tr>
                    </thead>
                    <tbody id="timeline-body"></tbody>
                </table>
            </div>
        </div>
    );
};

export default TimelineDownDetail;
