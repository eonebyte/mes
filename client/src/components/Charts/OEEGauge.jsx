import GaugeChart from 'react-gauge-chart';
import PropTypes from 'prop-types';

const OEEGauge = ({ value }) => {
    return (
        <div style={{ width: '100%', height: '100px' }}>
            <GaugeChart
                id="gauge-chart1"
                percent={value}
                colors={['#FF0000', '#FFFF00', '#00FF00']} // Merah di kiri, kuning di tengah, hijau di kanan
            />
        </div>
    );
};

OEEGauge.propTypes = {
    value: PropTypes.number
};

export default OEEGauge;
