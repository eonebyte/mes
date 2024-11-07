import {
    TimelineWrapper,
    TimelineBox,
    TimelineTime,
    TimelineDivider,
    TimelineDividers,
    useTimeline
} from "planby";
import PropTypes from 'prop-types';

export function Timeline({
    isBaseTimeFormat,
    isSidebar,
    dayWidth,
    hourWidth,
    numberOfHoursInDay,
    offsetStartHoursRange,
    sidebarWidth
}) {
    const { time, dividers, formatTime } = useTimeline(
        numberOfHoursInDay,
        isBaseTimeFormat
    );

    const renderTime = (index) => (
        <TimelineBox key={index} width={hourWidth}>
            <TimelineTime>
                {formatTime(index + offsetStartHoursRange).toLowerCase()}
            </TimelineTime>
            <TimelineDividers>{renderDividers()}</TimelineDividers>
        </TimelineBox>
    );

    const renderDividers = () =>
        dividers.map((_, index) => (
            <TimelineDivider key={index} width={hourWidth} />
        ));

    return (
        <TimelineWrapper
            dayWidth={dayWidth}
            sidebarWidth={sidebarWidth}
            isSidebar={isSidebar}
        >
            {time.map((_, index) => renderTime(index))}
        </TimelineWrapper>
    );
}

// Define prop types for runtime validation
Timeline.propTypes = {
    isBaseTimeFormat: PropTypes.bool.isRequired, // True or false for base time format
    isSidebar: PropTypes.bool.isRequired, // True or false for sidebar presence
    dayWidth: PropTypes.number.isRequired, // Width of the day container
    hourWidth: PropTypes.number.isRequired, // Width of each hour
    numberOfHoursInDay: PropTypes.number.isRequired, // Total number of hours in a day
    offsetStartHoursRange: PropTypes.number.isRequired, // Hour offset to adjust start time
    sidebarWidth: PropTypes.number.isRequired // Width of the sidebar
};
