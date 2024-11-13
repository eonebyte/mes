import { useState, useEffect } from "react";
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge'; // Sesuaikan dengan lokasi komponen Gauge MUI
import PropTypes from 'prop-types';
import '../../Chart.css'

export default function OEEChart({ avgMetrics }) {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        if (avgMetrics && avgMetrics.length > 0) {
            const series = avgMetrics.map(metric => metric.percent);
            const color = getColorFromValue(series[0]);

            const value = series[0];

            const formattedValue = Number.isInteger(value) ? value.toString() : value.toFixed(1);

            // Set state for chart data
            setChartData({ value: Number(formattedValue), color });
        } else {
            setChartData(null);
        }
    }, [avgMetrics]);

    const getColorFromValue = (oee) => {
        const color = oee >= 100 ? "#008000" : oee >= 80 ? "#FFA500" : oee >= 60 ? "#1E90FF" : "#800080";
        return color;
    };


    return (
        <>
            {chartData && (
                <Gauge
                    cornerRadius="50%"
                    value={chartData.value}
                    startAngle={-135}
                    endAngle={135}
                    innerRadius="80%"
                    outerRadius="100%"
                    
                    sx={{
                        [`& .${gaugeClasses.valueText}`]: {
                            fontSize: 18,
                            transform: 'translate(0px, 0px)',
                            color: '#FFFFFF', // Warna teks
                            fill: '#FFFFFF',
                        },
                        [`& .${gaugeClasses.referenceArc}`]: {
                            fill: '	#A9A9A9',
                            fontWeight: 'bold',
                        },
                        [`& .${gaugeClasses.valueArc}`]: {
                            fill: chartData.color, // warna chart
                        },
                    }}
                    text={
                        ({ value }) => `${value}`
                    }
                    height={100}
                    width={100}
                />
            )}
        </>
    );
}

OEEChart.propTypes = {
    avgMetrics: PropTypes.array
};
