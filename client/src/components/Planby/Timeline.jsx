import {
    TimelineWrapper,
    TimelineBox,
    TimelineTime,
    TimelineDivider,
    TimelineDividers,
    useTimeline
  } from "planby";
  
  export function Timeline({
    // eslint-disable-next-line react/prop-types
    isBaseTimeFormat,
    // eslint-disable-next-line react/prop-types
    isSidebar,
    // eslint-disable-next-line react/prop-types
    dayWidth,
    // eslint-disable-next-line react/prop-types
    hourWidth,
    // eslint-disable-next-line react/prop-types
    numberOfHoursInDay,
    // eslint-disable-next-line react/prop-types
    offsetStartHoursRange,
    // eslint-disable-next-line react/prop-types
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
  