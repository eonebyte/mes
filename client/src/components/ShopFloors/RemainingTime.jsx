import PropTypes from 'prop-types';
import dayjs from 'dayjs';

export default function RemainingTime({ toGoQty, CT }) {
    //Rumus Remaining Time = ((toGoQty x cyclletime) / 60) / 60
    const remainingSeconds = toGoQty * CT;
    const remainingDuration = dayjs.duration(remainingSeconds, 'seconds');
    const remainingTime = `${remainingDuration.days() > 0 ? `${remainingDuration.days()}+` : ''}${remainingDuration.hours().toString().padStart(2, '0')}:${remainingDuration.minutes().toString().padStart(2, '0')}`;

    return (
        <span>{remainingTime}</span>
    );
}

RemainingTime.propTypes = {
    toGoQty: PropTypes.number.isRequired, // planQty should be a number
    CT: PropTypes.number.isRequired, // outputQty should be a number
};