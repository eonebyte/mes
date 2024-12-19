import { PieChart, Pie, Cell } from 'recharts';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';


const COLORS = ['#000', '#fff'];

export default function RemainingPlanDetail({ status, target, progress }) {
    const locationPath = useLocation();
    const path = locationPath.pathname;

    let colorText;
    let colorChart;

    // Hanya di halaman resource bg chart warnanya sedikit gelap
    if (path === '/resource') {
        colorText = 'rgba(0, 0, 0, 0.1)';
    } else {
        if (status === 'Inspect') {
            colorText = 'rgba(255, 255, 255, 0.3)'
        } else {
            colorText = 'rgba(255, 255, 255, 0.5)'
        }
    }

    if (status === 'Inspect') {
        colorChart = COLORS[1]
    } else {
        colorChart = COLORS[0]
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', justifyContent: 'center' }}>
            <PieChart width={50} height={50}>
                <Pie
                    data={[{ name: 'Remaining', value: target }]}
                    cx={21}
                    cy={20}
                    innerRadius={18}
                    outerRadius={23}
                    fill="rgba(0, 0, 0, 0.1)" // Warna putih penuh di belakang
                    dataKey="value"
                    startAngle={90}
                    endAngle={450} // Full circle
                    stroke="none"
                >
                    <Cell fill={colorText} /> {/* Latar belakang putih */}
                </Pie>
                <Pie
                    data={[{ name: 'Progress', value: progress }]}
                    cx={21}
                    cy={20}
                    innerRadius={18}
                    outerRadius={23}
                    fill="#8884d8"
                    dataKey="value"
                    startAngle={90} // Mulai dari atas
                    endAngle={90 - (360 * (progress / target))}
                    label={() => (
                        <text
                            x={26} // X tengah
                            y={24} // Y tengah
                            textAnchor="middle"
                            dominantBaseline="central"
                            style={{
                                fontSize: 12,
                                fontWeight: "bold",
                                fill: colorChart,
                            }}
                        >
                            {`${progress}`}
                        </text>
                    )}
                    labelLine={false}
                    stroke="none"
                >
                    <Cell fill={colorChart} />
                </Pie>
            </PieChart>
            <small>Remaining</small>
            <strong>864+16:30</strong>
        </div>

    );
}

RemainingPlanDetail.propTypes = {
    status: PropTypes.string.isRequired,
    target: PropTypes.number.isRequired, // target should be a number
    progress: PropTypes.number.isRequired, // progress should be a number
};