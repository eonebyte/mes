const DemoData = {
    resources: [
        {
            id: 'm1',
            name: '1',
            line: 'A1',
            lineno: 'A1-02',
            MC: 66
        },
        {
            id: 'm2',
            name: '2',
            line: 'B1',
            lineno: 'B1-01',
            MC: 67
        },
        {
            id: 'm3',
            name: '3',
            line: 'B1',
            lineno: 'B1-02',
            MC: 68
        },
        {
            id: 'm4',
            name: '4',
            line: 'C1',
            lineno: 'C1-01',
            MC: 69
        },
        {
            id: 'm5',
            name: '5',
            line: 'C1',
            lineno: 'C1-02',
            MC: 70
        },
        {
            id: 'm6',
            name: '6',
            line: 'D1',
            lineno: 'D1-01',
            MC: 71
        },
        {
            id: 'm7',
            name: '7',
            line: 'D1',
            lineno: 'D1-02',
            MC: 72
        }
    ],
    events: [
        {
            id: 1,
            start: '2024-11-01 08:00:00',
            end: '2024-11-01 10:00:00',
            resourceId: 'm1',
            title: 'Downtime - Maintenance',
            bgColor: '#FF0000'
        },
        {
            id: 2,
            start: '2024-11-01 10:00:00', // Second downtime for 1 on the same day
            end: '2024-11-01 12:00:00',
            resourceId: 'm1',
            title: 'Downtime - Inspection',
            bgColor: '#20B2AA'
        },
        {
            id: 3,
            start: '2024-11-01 13:00:00', // Third downtime for 1 on the same day
            end: '2024-11-01 15:00:00',
            resourceId: 'm1',
            title: 'Downtime - Emergency Repair',
            bgColor: '#FF0000'
        },
        {
            id: 13,
            start: '2024-11-01 15:00:00', // Third downtime for 1 on the same day
            end: '2024-11-01 16:00:00',
            resourceId: 'm1',
            title: 'Downtime - Emergency Repair',
            bgColor: '#FF0000'
        },
        {
            id: 14,
            start: '2024-11-01 16:00:00', // Third downtime for 1 on the same day
            end: '2024-11-01 18:00:00',
            resourceId: 'm1',
            title: 'Downtime - Emergency Repair',
            bgColor: '#FF0000'
        },
        {
            id: 4,
            start: '2024-11-02 14:00:00',
            end: '2024-11-02 16:30:00',
            resourceId: 'm2',
            title: 'Downtime - Unexpected Issue',
            bgColor: '#FF0000'
        },
        {
            id: 5,
            start: '2024-11-03 09:00:00',
            end: '2024-11-03 12:00:00',
            resourceId: 'm3',
            title: 'Downtime - Routine Check',
            bgColor: '#FFD700'
        },
        {
            id: 6,
            start: '2024-11-04 08:30:00',
            end: '2024-11-04 11:00:00',
            resourceId: 'm4',
            title: 'Downtime - Power Issue',
            bgColor: '#FF0000'
        },
        {
            id: 16,
            start: '2024-11-04 11:00:00',
            end: '2024-11-04 12:00:00',
            resourceId: 'm4',
            title: 'Downtime - Power Issue',
            bgColor: '#52C41A'
        },
        {
            id: 17,
            start: '2024-11-04 12:00:00',
            end: '2024-11-04 15:00:00',
            resourceId: 'm4',
            title: 'Downtime - Power Issue',
            bgColor: '#FF0000'
        },
        {
            id: 7,
            start: '2024-11-05 13:00:00',
            end: '2024-11-05 16:00:00',
            resourceId: 'm5',
            title: 'Downtime - Mechanical Failure',
            bgColor: '#DC143C'
        },
        {
            id: 8,
            start: '2024-11-06 10:00:00',
            end: '2024-11-06 12:30:00',
            resourceId: 'm6',
            title: 'Downtime - Scheduled Maintenance',
            bgColor: '#20B2AA'
        },
        {
            id: 9,
            start: '2024-11-07 08:00:00',
            end: '2024-11-07 10:30:00',
            resourceId: 'm7',
            title: 'Downtime - Lubrication',
            bgColor: '#FF4500'
        },
        {
            id: 10,
            start: '2024-11-08 11:00:00',
            end: '2024-11-08 13:30:00',
            resourceId: 'm0',
            title: 'Downtime - Cooling System Check',
            bgColor: '#4682B4'
        }
    ]
};

export default DemoData;
