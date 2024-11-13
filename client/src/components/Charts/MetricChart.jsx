import ReactApexChart from "react-apexcharts";
import PropTypes from 'prop-types';

export default function MetricChart({ avgMetrics }) {
    // Data series untuk chart
    const series = avgMetrics.map(metric => metric.value);

    // Opsi untuk chart
    const options = {
        chart: {
            type: 'radialBar',
            height: 100,
        },
        plotOptions: {
            radialBar: {
                startAngle: -135,
                endAngle: 135,
                dataLabels: {
                    name: {
                        fontSize: '22px',
                    },
                    value: {
                        fontSize: '16px',
                    },
                    total: {
                        show: true,
                        label: 'Average Metrics',
                        formatter: function () {
                            const total = avgMetrics.reduce((acc, metric) => acc + metric.value, 0);
                            return total.toFixed(2); // Format total menjadi dua angka di belakang koma
                        }
                    }
                }
            }
        },
        labels: avgMetrics.map(metric => metric.name)
    };

    return (
        <div>
            <ReactApexChart options={options} series={series} type="radialBar" height={350} />
        </div>
    );
}

MetricChart.propTypes = {
    avgMetrics: PropTypes.array
}