// import { useEffect, useRef } from 'react';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import '../assets/gantt/controls_styles.css'
// import gantt from 'dhtmlx-gantt';

const Scheduler = () => {
    // const ganttRef = useRef(null);
    // console.log(gantt);
    // console.log(gantt.version);


    // useEffect(() => {
    //     gantt.config.resize_rows = true;
    //     gantt.config.min_task_grid_row_height = 10;
    //     gantt.config.open_split_tasks = true;
    //     gantt.config.date_format = "%Y-%m-%d %H:%i:%s";

    //     // Parent Section
    //     gantt.config.lightbox.project_sections = [
    //         { name: "description", height: 70, map_to: "description", type: "template", focus: true },
    //         { name: "time", map_to: "auto", type: "duration", readonly: true },
    //     ];

    //     gantt.config.lightbox.milestone_sections = gantt.config.lightbox.sections = [
    //         { name: "description", height: 38, map_to: "text", type: "textarea", focus: true },
    //         { name: "time", type: "duration", map_to: "auto" },
    //         { name: "baselines", height: 100, type: "baselines", map_to: "baselines", readonly: true },
    //     ];

    //     gantt.locale.labels.section_jono = "Job Order - Part No";

    //     gantt.config.lightbox.sections = [
    //         { name: "jono", height: 50, map_to: "text", type: "template" },
    //         { name: "description", height: 38, map_to: "description", type: "template" },
    //         { name: "time", type: "duration", map_to: "auto", label: "Planned Time" },
    //         { name: "baselines", height: 100, type: "baselines", map_to: "baselines" },
    //     ];

    //     gantt.locale.labels.section_baselines = "Actual";
    //     gantt.config.columns = [
    //         { name: "text", label: "Task MC/JO", tree: true, width: '*', resize: true },
    //         { name: "start_date", label: "Start", align: "center", width: 100 },
    //         {
    //             name: "docstatus", label: "State", align: "center", width: 60, template: function (task) {
    //                 if (gantt.hasChild(task.id)) return "<span class=sorter onclick='sort_children(" + task.id + ")' type=button><i class='fa fa-sort'>&nbsp;</i><i class='fa fa-calendar fa-lg'></i></span>";
    //                 else return task.docstatus;
    //             }
    //         },
    //         {
    //             name: "progress", label: "Progress", width: 80, align: "center",
    //             template: function (item) {
    //                 if (item.progress >= 1)
    //                     return "Complete";
    //                 if (item.progress == 0 && item.docstatus == "DR")
    //                     return "Plan";
    //                 if (item.progress == 0 && item.docstatus == "OP")
    //                     return "Ready";
    //                 return Math.round(item.progress * 100) + "%";
    //             },
    //             readonly: true
    //         }
    //     ];

    //     gantt.templates.task_class = function (start, end, task) {
    //         if (task.planned_end) {
    //             var classes = ['has-baseline'];
    //             if (end.getTime() > task.planned_end.getTime()) {
    //                 classes.push('overdue');
    //             }
    //             return classes.join(' ');
    //         }
    //     };

    //     gantt.templates.rightside_text = function (start, end, task) {
    //         if (task.planned_end) {
    //             if (end.getTime() > task.planned_end.getTime()) {
    //                 var overdue = Math.ceil(Math.abs((end.getTime() - task.planned_end.getTime()) / (24 * 60 * 60 * 1000)));
    //                 var text = "<b>Overdue: " + overdue + " days</b>";
    //                 return text;
    //             }
    //         }
    //     };

    //     gantt.attachEvent("onLoadEnd", function () {
    //         const tasks = gantt.getTaskByTime();
    //         tasks.forEach(task => {
    //             console.log(`Task ID: ${task.id}, Baselines: ${JSON.stringify(task.baselines)}`);
    //         });
    //     });


    //     gantt.attachEvent("onLightboxSave", function (/* id, task, is_new */) {
    //         const userRole = 'admin';
    //         if (userRole != 'admin') {
    //             alert("Hanya ada admin yang bisa melakukan perubahan");
    //             return false;
    //         }
    //         return true;
    //     })

    //     gantt.attachEvent("onLightboxDelete", function (id) {
    //         const task = gantt.getTask(id);
    //         if (task.docstatus === 'OP') {
    //             alert("Tidak boleh hapus karna status OP");
    //             return false;
    //         }
    //         return true;
    //     });

    //     gantt.config.drag_progress = false;

    //     gantt.config.order_branch = true;
    //     gantt.config.order_branch_free = true;
    //     gantt.config.baselines = {
    //         datastore: "baselines",
    //         render_mode: "separateRow",
    //         dataprocessor_baselines: true,
    //         row_height: 20,
    //         bar_height: 12
    //     };


    //     // Inisialisasi Gantt
    //     gantt.init(ganttRef.current);
    //     gantt.load("http://localhost:3080/api/tasks");
    //     const dp = new gantt.dataProcessor("http://localhost:3080/api");
    //     dp.init(gantt);
    //     dp.setTransactionMode("REST");

    //     // Cleanup on component unmount
    //     return () => {
    //         gantt.clearAll();
    //     };
    // }, []);

    // return (
    //     <div style={{ height: "500px", width: "100%" }}>
    //         <div ref={ganttRef} style={{ width: "100%", height: "100%" }}></div>
    //     </div>
    // );
};

export default Scheduler;
