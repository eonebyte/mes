import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);
import { KonvaTimeline } from '@melfore/konva-timeline'; // Importing from the specified package
import LayoutDashboard from "../components/layouts/LayoutDashboard";
import { Row, Modal } from 'antd';
import StatusButton from '../components/Buttons/StatusButton';
import { useCallback, useEffect, useState } from 'react';
import { fetchResources, fetchTasks } from '../data/fetchData';

const MachineDowntime = () => {
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const [resources, setResources] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  // Conditional background color based on the theme
  // const backgroundColor = isDarkMode ? '#333' : '#fff';
  // const textColor = isDarkMode ? '#fff' : '#000';

  const handleFetchResources = useCallback(async () => {
    try {
      const fetchedResources = await fetchResources();
      const fetchedTasks = await fetchTasks();
      setResources(fetchedResources);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    handleFetchResources();
  }, [handleFetchResources]);

  const mappedResources = resources.map(resource => ({
    id: resource.machine_id.toString(),
    label: `MC ${resource.machine_name}`,
  }));

  const formatDuration = (start, end) => {
    const gapDuration = dayjs.duration(dayjs(end).diff(dayjs(start)));
    const days = gapDuration.days();
    const hours = gapDuration.hours();
    const minutes = gapDuration.minutes();
    const seconds = gapDuration.seconds();
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const mappedTasks = resources.flatMap(resource => {
    const machineTasks = tasks
      .filter(task => task.machine_id === resource.machine_id)
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    const machineIdString = resource.machine_id.toString();
    const machineMappedTasks = [];

    for (let i = 0; i < machineTasks.length; i++) {
      const task = machineTasks[i];
      const taskStart = dayjs(task.start_time);

      // update start menjadi 00:00 jika task start timenya < dari 00:00
      const adjustedStart = taskStart.isBefore(dayjs().subtract(1, 'day').startOf('day').valueOf())
        ? dayjs().subtract(1, 'day').startOf('day').valueOf()
        : taskStart;

      machineMappedTasks.push({
        id: task.event_id,
        label: `MC ID ${task.machine_id}`,
        customStart: task.start_time,
        resourceId: machineIdString,
        time: {
          start: adjustedStart.valueOf(),  // Use adjusted start time
          end: task.end_time,
        },
        taskColor: task.task_color,
        durationText: formatDuration(task.start_time, task.end_time), // Updated duration text
      });

      // Add gap if there is a next task
      if (i < machineTasks.length - 1) {
        const nextTask = machineTasks[i + 1];
        const gapStart = dayjs(task.end_time);
        const gapEnd = dayjs(nextTask.start_time);

        if (gapStart.isBefore(gapEnd)) {
          machineMappedTasks.push({
            id: `gap-${task.event_id}-${nextTask.event_id}`,
            label: `Gap for MC ${resource.machine_name}`,
            resourceId: machineIdString,
            time: {
              start: gapStart.valueOf(),
              end: gapEnd.valueOf(),
            },
            taskColor: '#00FF00', // Green color for gap tasks
            durationText: formatDuration(gapStart, gapEnd),
          });
        }
      }
    }

    return machineMappedTasks;
  });


  const defaultRange = {
    start: dayjs().subtract(1, 'day').startOf('day').valueOf(), // Mulai dari 00:00 pada hari Senin minggu ini
    end: dayjs().endOf('day').valueOf(), // Sampai dengan 23:59:59.999 pada hari Minggu minggu ini
  };

  // const range = tasks.length > 0 ? {
  //   start: Math.min(...tasks.map(task => dayjs(task.start_time).valueOf())), 
  //   end: Math.max(...tasks.map(task => dayjs(task.end_time).valueOf())), 
  // } : defaultRange;


  // Fungsi untuk mengatur tampilan modal dan task yang dipilih
  const onTaskClick = (taskData) => {
    setSelectedTask(taskData);  // Menyimpan task yang dipilih
    setIsModalVisible(true);  // Menampilkan modal
  };

  const handleCancel = () => {
    setIsModalVisible(false); // Menutup modal
  };

  const customToolTip = (taskData) => {
    console.log(taskData);

    return (
      <div
        style={{
          backgroundColor: isDarkMode ? "#444" : "#fff",
          color: isDarkMode ? "#fff" : "#000",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        <div>{taskData.label}</div>
        <div>Start: {dayjs(taskData.customStart).format("DD/MM/YYYY HH:mm:ss")}</div>
        <div>End: {taskData.end}</div>
        <div>Duration: {taskData.durationText}</div>
      </div>
    );
  };


  return (
    <div>
      <LayoutDashboard>
        <Row gutter={[8, 8]} style={{ maxWidth: '100%', margin: 0, marginTop: 5 }}>
          <StatusButton />
        </Row>
        <div style={{ marginTop: 15 }}>
          <KonvaTimeline
            dateLocale="id"
            enableDrag={false}
            enableResize={false}
            headerLabel="Machines"
            theme={isDarkMode ? 'dark' : 'light'}
            dragResolution="5min"
            onErrors={(error) => console.log(error)}
            onTaskChange={(task) => console.log('Task Changed:', task)}
            range={defaultRange}
            resolution="1hrs"
            resources={mappedResources}
            tasks={mappedTasks}
            rowHeight={30}
            customToolTip={customToolTip}
            onTaskClick={onTaskClick}  // Menambahkan onTaskClick untuk menangani klik task
          />
        </div>
        {/* Modal untuk menampilkan detail task */}
        <Modal
          title="Task Detail"
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}  // Menyembunyikan footer modal, bisa ditambahkan jika perlu
        >
          {selectedTask && (
            <div>
              <p><strong>Task ID:</strong> {selectedTask.id}</p>
              <p><strong>Machine ID:</strong> {selectedTask.resourceId}</p>
              <p><strong>Start Time:</strong> {dayjs(selectedTask.customStart).format('YYYY-MM-DD HH:mm')}</p>
              <p><strong>End Time:</strong> {dayjs(selectedTask.time.end).format('YYYY-MM-DD HH:mm')}</p>
              <p><strong>Duration:</strong> {selectedTask.durationText}</p>
            </div>
          )}
        </Modal>
      </LayoutDashboard>
    </div>
  );
};

export default MachineDowntime;
