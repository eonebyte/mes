import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);
import { KonvaTimeline } from '@melfore/konva-timeline'; // Importing from the specified package
import LayoutDashboard from "../components/layouts/LayoutDashboard";
import { Row, Modal } from 'antd';
import StatusButton from '../components/Buttons/StatusButton';
import { useCallback, useEffect, useState } from 'react';
import { fetchResources, fetchTasks } from '../utils/fetchData';

const MachineDowntime = () => {
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const [resources, setResources] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  // Conditional background color based on the theme
  const backgroundColor = isDarkMode ? '#333' : '#fff';
  const textColor = isDarkMode ? '#fff' : '#000';

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

  const mappedTasks = tasks.map(task => ({
    id: task.event_id,
    label: `MC ID ${task.machine_id}`,
    resourceId: task.machine_id.toString(),
    time: {
      start: task.start_time,
      end: task.end_time,
    },
    taskColor: task.task_color,
    durationText: task.duration_text,
  }));

  const defaultRange = {
    start: dayjs().startOf('isoWeek').valueOf(), // Mulai dari 00:00 pada hari Senin minggu ini
    end: dayjs().endOf('isoWeek').valueOf(), // Sampai dengan 23:59:59.999 pada hari Minggu minggu ini
  };

  const range = {
    start: defaultRange.start,
    end: defaultRange.end,
  };

  // Fungsi untuk mengatur tampilan modal dan task yang dipilih
  const onTaskClick = (taskData) => {
    setSelectedTask(taskData);  // Menyimpan task yang dipilih
    setIsModalVisible(true);  // Menampilkan modal
  };

  const handleCancel = () => {
    setIsModalVisible(false); // Menutup modal
  };

  const customToolTip = (taskData) => {
    return (
      <div
        style={{
          backgroundColor: isDarkMode ? "#444" : "#fff",
          color: isDarkMode ? "#fff" : "#000",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        <div>{taskData.label}</div>
        <div>Start: {taskData.start}</div>
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
        <div
          style={{
            marginTop: 15,
            padding: 10,
            backgroundColor,
            marginBottom: '20px',
            color: textColor,
          }}
        >
          <KonvaTimeline
            dateLocale="id"
            enableDrag={false}
            enableResize={false}
            headerLabel="Machines"
            theme={isDarkMode ? 'dark' : 'light'}
            dragResolution="5min"
            onErrors={(error) => console.log(error)}
            onTaskChange={(task) => console.log('Task Changed:', task)}
            range={range}
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
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={null}  // Menyembunyikan footer modal, bisa ditambahkan jika perlu
        >
          {selectedTask && (
            <div>
              <p><strong>Task ID:</strong> {selectedTask.id}</p>
              <p><strong>Machine ID:</strong> {selectedTask.resourceId}</p>
              <p><strong>Start Time:</strong> {dayjs(selectedTask.time.start).format('YYYY-MM-DD HH:mm')}</p>
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
