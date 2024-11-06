import { Component, createRef } from 'react';
import LayoutDashboard from '../components/layouts/LayoutDashboard';
import Scheduler, { SchedulerData, ViewType, DATE_FORMAT } from 'react-big-scheduler-stch';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import "react-big-scheduler-stch/lib/css/style.css";
import dayjs from "dayjs";
import * as dayjsLocale from 'dayjs/locale/id';
dayjs.locale("id");
import DemoData from '../DemoData';
import { Modal, Row, Button } from 'antd';
import StatusButton from '../components/Buttons/StatusButton';
import axios from 'axios';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class MachineDowntimeComponent extends Component {
    constructor(props) {
        super(props);

        this.schedulerRef = createRef();


        let schedulerData = new SchedulerData(new dayjs().format(DATE_FORMAT), ViewType.Day, false, false, {
            besidesWidth: 100,
            dayMaxEvents: 99,
            dayCellWidth: 2,
            minuteStep: 1,
            resourceName: 'Machine',
            nonAgendaDayCellHeaderFormat: 'HH:mm',
            eventItemHeight: 30,
            nonAgendaSlotMinHeight: 70, // Tinggi minimum untuk slot non-agenda
            nonWorkingTimeHeadBgColor: 'transparent',
            nonWorkingTimeBodyBgColor: 'transparent',
            schedulerContentHeight: '400px',
            views: [
                { viewType: ViewType.Day, viewName: 'LAST 24H' },
            ]
        });



        schedulerData.setSchedulerLocale(dayjsLocale);
        schedulerData.setCalendarPopoverLocale(dayjsLocale);

        this.state = {
            viewModel: schedulerData,
            isModalVisible: false,
            selectedEvent: null,
            isDarkMode: props.isDarkMode,
            resources: [],
            events: []
        };
    }

    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate(prevProps) {
        // Perbarui style jika nilai isDarkMode berubah
        if (prevProps.isDarkMode !== this.props.isDarkMode) {
            this.setState({ isDarkMode: this.props.isDarkMode });
        }
    }

    fetchData = async () => {
        try {
            const [resourcesRes, eventsRes] = await Promise.all([
                axios.get('http://localhost:3000/api/machines'),
                axios.get('http://localhost:3000/api/machine-events')
            ]);

            console.log('Resources Response:', resourcesRes); // Log response awal
            console.log('Events Response:', eventsRes); // Log response awal

            // Memastikan resources adalah array
            const resources = Array.isArray(resourcesRes.data) ? resourcesRes.data.map(resource => ({
                id: resource.machine_id, // ID mesin
                name: resource.machine_name // Nama mesin
            })) : []; // Fallback ke array kosong jika bukan array

            const formatDateTime = (isoString) => {
                const date = new Date(isoString);
                const options = {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false, // Format 24 jam
                };
                return date.toLocaleString('sv-SE', options).replace(' ', ' ').replace(',', '');
            };


            // Memastikan events adalah array
            const events = Array.isArray(eventsRes.data) ? eventsRes.data.map(event => ({
                id: event.eventId, // ID acara
                title: event.status, // Judul/status acara
                start: formatDateTime(event.startTime), // Waktu mulai
                end: formatDateTime(event.endTime), // Waktu selesai
                resourceId: parseInt(event.machineId), // ID mesin yang terkait
                bgColor: event.eventColor || 'purple' // Warna latar belakang
            })) : []; // Fallback ke array kosong jika bukan array

            // Log resources dan events dengan cara yang lebih informatif
            console.log("Resources:", resources);
            console.log("Events:", events);

            const { viewModel } = this.state;

            viewModel.setResources(resources);
            viewModel.setEvents(events);

            this.setState({ viewModel, resources, events });
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }


    render() {
        const { viewModel, isModalVisible, selectedEvent, isDarkMode } = this.state;
        return (
            <div style={{
                backgroundColor: "isDarkMode ? 'rgb(33, 33, 33 / 90%)' : 'rgb(255, 255, 255 / 70%)'", // Warna latar belakang berdasarkan isDarkMode
                borderRadius: '8px', // Menambahkan sudut melengkung
                boxShadow: isDarkMode ? '0 2px 10px rgba(255, 255, 255, 0.2)' : '0 2px 10px rgba(0, 0, 0, 1)', // Bayangan berdasarkan isDarkMode
                width: '100%', // Membuat lebar responsif
                overflow: 'auto', // Menghindari masalah overflow
                marginTop: 10,
            }}>
                <Row style={{ marginBottom: '10px' }}>
                    <Button onClick={() => { }}>Zoom In</Button>
                    <Button onClick={() => { }}>Zoom Out</Button>
                </Row>
                <Scheduler
                    ref={this.schedulerRef}
                    schedulerData={viewModel}
                    prevClick={this.prevClick}
                    nextClick={this.nextClick}
                    onSelectDate={this.onSelectDate}
                    onViewChange={this.onViewChange}
                    eventItemClick={this.eventClicked}
                    viewEventClick={this.ops1}
                    viewEventText="Ops 1"
                    viewEvent2Text="Ops 2"
                    viewEvent2Click={this.ops2}
                    updateEventStart={this.updateEventStart}
                    updateEventEnd={this.updateEventEnd}
                    moveEvent={this.moveEvent}
                    newEvent={this.newEvent}
                    eventItemTemplateResolver={this.eventItemTemplateResolver}
                    toggleExpandFunc={this.toggleExpandFunc}
                />
                {/* Modal for displaying event details */}
                <Modal
                    title="Event Details"
                    open={isModalVisible}
                    onOk={this.handleOk} // Close on OK
                    onCancel={this.handleCancel} // Close on Cancel
                >
                    {selectedEvent && (
                        <>
                            <p><strong>ID:</strong> {selectedEvent.id}</p>
                            <p><strong>Title:</strong> {selectedEvent.title}</p>
                            {/* Add more event details here as needed */}
                        </>
                    )}
                </Modal>
            </div>
        )
    }

    prevClick = (schedulerData) => {
        schedulerData.prev();
        schedulerData.setEvents(DemoData.events);
        this.setState({
            viewModel: schedulerData
        });
    }

    nextClick = (schedulerData) => {
        schedulerData.next();
        schedulerData.setEvents(DemoData.events);
        this.setState({
            viewModel: schedulerData
        });
    }

    onViewChange = (schedulerData, view) => {
        schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
        schedulerData.setEvents(DemoData.events);
        this.setState({
            viewModel: schedulerData
        });
    }

    onSelectDate = (schedulerData, date) => {
        schedulerData.setDate(date);
        schedulerData.setEvents(DemoData.events);
        this.setState({
            viewModel: schedulerData
        });
    }

    eventClicked = (schedulerData, event) => {
        this.setState({
            selectedEvent: event,
            isModalVisible: true // Set modal visibility to true
        });
    };

    handleOk = () => {
        this.setState({ isModalVisible: false }); // Close the modal
    };

    handleCancel = () => {
        this.setState({ isModalVisible: false }); // Close the modal
    };

    ops1 = (schedulerData, event) => {
        alert(`You just executed ops1 on event: {id: ${event.id}, title: ${event.title}}`);
    };

    ops2 = (schedulerData, event) => {
        alert(`You just executed ops2 on event: {id: ${event.id}, title: ${event.title}}`);
    };

    newEvent = (schedulerData, slotId, slotName, start, end, type, item) => {
        if (confirm(`Do you want to create a new event? {slotId: ${slotId}, slotName: ${slotName}, start: ${start}, end: ${end}, type: ${type}, item: ${item}}`)) {
            let newFreshId = Math.max(0, ...schedulerData.events.map(event => event.id)) + 1;

            let newEvent = {
                id: newFreshId,
                title: 'New event you just created',
                start: start,
                end: end,
                resourceId: slotId,
                bgColor: 'purple'
            }
            schedulerData.addEvent(newEvent);
            this.setState({
                viewModel: schedulerData
            });
        }
    }

    updateEventStart = (schedulerData, event, newStart) => {
        if (confirm(`Do you want to adjust the start of the event? {eventId: ${event.id}, eventTitle: ${event.title}, newStart: ${newStart}}`)) {
            schedulerData.updateEventStart(event, newStart);
            this.setState({
                viewModel: schedulerData
            });
        }
    }

    updateEventEnd = (schedulerData, event, newEnd) => {
        if (confirm(`Do you want to adjust the end of the event? {eventId: ${event.id}, eventTitle: ${event.title}, newEnd: ${newEnd}}`)) {
            schedulerData.updateEventEnd(event, newEnd);
            this.setState({
                viewModel: schedulerData
            });
        }
    }

    moveEvent = (schedulerData, event, slotId, slotName, start, end) => {
        if (confirm(`Do you want to move the event? {eventId: ${event.id}, eventTitle: ${event.title}, newSlotId: ${slotId}, newSlotName: ${slotName}, newStart: ${start}, newEnd: ${end}`)) {
            schedulerData.moveEvent(event, slotId, slotName, start, end);
            this.setState({
                viewModel: schedulerData
            });
        }
    }

    eventItemTemplateResolver = (schedulerData, event, bgColor, isStart, isEnd, mustAddCssClass, mustBeHeight, agendaMaxEventWidth) => {

        const borderWidth = isStart ? '0' : '0';
        const borderColor = 'rgba(0,139,236,1)'; // Default border color if needed
        const backgroundColor = event.bgColor || bgColor; // Use event's bgColor

        // const titleText = schedulerData.behaviors.getEventTextFunc(schedulerData, event);
        const divStyle = {
            borderLeft: `${borderWidth} solid ${borderColor}`,
            backgroundColor: backgroundColor,
            height: mustBeHeight,
        };

        if (agendaMaxEventWidth) {
            divStyle.maxWidth = agendaMaxEventWidth;
        }

        return (
            <div key={event.id} className={mustAddCssClass} style={divStyle}>
                {/* <span style={{ marginLeft: '4px', lineHeight: `${mustBeHeight}px` }}>
                        {titleText}
                    </span> */}
            </div>
        );
    };


    toggleExpandFunc = (schedulerData, slotId) => {
        schedulerData.toggleExpandStatus(slotId);
        this.setState({
            viewModel: schedulerData
        });
    }
}

const MachineDowntime = ({ isDarkMode }) => (
    <LayoutDashboard>
        <>
            <Row gutter={[8, 8]} style={{ maxWidth: '100%', margin: 0, marginTop: 5 }}>
                <StatusButton />
            </Row>
        </>
        <DndProvider backend={HTML5Backend}>
            <MachineDowntimeComponent isDarkMode={isDarkMode} />
        </DndProvider>
    </LayoutDashboard>
);

const mapStateToProps = (state) => ({
    isDarkMode: state.theme.isDarkMode,
});


MachineDowntime.propTypes = {
    isDarkMode: PropTypes.bool.isRequired, // Validate isDarkMode prop
};

// Menambahkan validasi prop untuk komponen ini
MachineDowntimeComponent.propTypes = {
    isDarkMode: PropTypes.bool.isRequired,
};



export default connect(mapStateToProps)(MachineDowntime);
