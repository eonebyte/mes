import {
    ProgramBox,
    ProgramContent,
    ProgramFlex,
    ProgramStack,
    ProgramTitle,
    ProgramText,
    ProgramImage,
    useProgram
  } from "planby";
  
  // eslint-disable-next-line react/prop-types
  export const ProgramItem = ({ program, ...rest }) => {
    const {
      styles,
      formatTime,
      set12HoursTimeFormat,
      isLive,
      isMinWidth
    } = useProgram({
      program,
      ...rest
    });
  
    // eslint-disable-next-line react/prop-types
    const { data } = program;
    // eslint-disable-next-line react/prop-types
    const { image, title, since, till } = data;
  
    const sinceTime = formatTime(since, set12HoursTimeFormat()).toLowerCase();
    const tillTime = formatTime(till, set12HoursTimeFormat()).toLowerCase();
  
    return (
      <ProgramBox width={styles.width} style={styles.position}>
        <ProgramContent width={styles.width} isLive={isLive}>
          <ProgramFlex>
            {isLive && isMinWidth && <ProgramImage src={image} alt="Preview" />}
            <ProgramStack>
              <ProgramTitle>{title}</ProgramTitle>
              <ProgramText>
                {sinceTime} - {tillTime}
              </ProgramText>
            </ProgramStack>
          </ProgramFlex>
        </ProgramContent>
      </ProgramBox>
    );
  };
  