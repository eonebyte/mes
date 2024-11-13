import { useSelector } from 'react-redux';
import { KonvaTimeline } from '@melfore/konva-timeline'; // Importing from the specified package
import LayoutDashboard from "../components/layouts/LayoutDashboard";
import { Row } from 'antd';
import StatusButton from '../components/Buttons/StatusButton';
import React, { useState } from 'react';
import { fetchResources, fetchTasks } from '../utils/fetchData';


const MachineDowntime = () => {
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const [resources, setRessources] = useState([]);
  const [tasks, setTasks] = useState([]);

  console.log('init resources', resources);
    console.log('init tasks', tasks);

  // Conditional background color based on the theme
  const backgroundColor = isDarkMode ? '#333' : '#fff'; 
  const textColor = isDarkMode ? '#fff' : '#000';

  const handleFetchResources = React.useCallback(async () => {

    const resources = await fetchResources();
    const tasks = await fetchTasks();
    console.log('resources', resources);
    console.log('tasks', tasks);
    
    setRessources(resources);
    setTasks(tasks);
}, []);

React.useEffect(() => {
    handleFetchResources();
}, [handleFetchResources]);

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
            theme={isDarkMode ? 'dark' : 'light'}
            dragResolution="5min"
            onErrors={(error) => console.log(error)}
            onTaskChange={(task) => console.log('Task Changed:', task)}
            range={{
              end: 1577919600000, 
              start: 1577833200000 
            }}
            resolution="1hrs"
            resources={[
              {
                color: '#f917a6',
                id: '1',
                label: 'Resource #1'
              },
              {
                color: '#d08b20',
                id: '2',
                label: 'Resource #2'
              },
              {
                color: '#bbb76c',
                id: '3',
                label: 'Resource #3'
              }
            ]}
            tasks={[
              {
                id: '4',
                label: 'Task #4',
                resourceId: '1',
                time: {
                  end: 1577851260100,
                  start: 1577850600100
                }
              },
              {
                id: '2',
                label: 'Task #2',
                resourceId: '1',
                time: {
                  end: 1577835720000,
                  start: 1577833200000
                }
              },
              {
                id: '1',
                label: 'Task #1',
                resourceId: '2',
                time: {
                  end: 1577857020000,
                  start: 1577833200000
                }
              },
              {
                id: '3',
                label: 'Task #3',
                resourceId: '2',
                time: {
                  end: 1577871240100,
                  start: 1577866920100
                }
              },
              {
                id: '5',
                label: 'Task #5',
                resourceId: '1',
                time: {
                  end: 1577860140200,
                  start: 1577859900200
                }
              }
            ]}
          />
        </div>
      </LayoutDashboard>
    </div>
  );
};

export default MachineDowntime;
