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
import PropTypes from 'prop-types';

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

    const { data } = program;
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

// Define prop types for runtime validation
ProgramItem.propTypes = {
    program: PropTypes.shape({
        data: PropTypes.shape({
            image: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            since: PropTypes.string.isRequired,  // Assuming these are string dates
            till: PropTypes.string.isRequired    // Assuming these are string dates
        }).isRequired
    }).isRequired,
    // If `rest` contains additional props, we can define them as well
};
