import { PieChart, Pie, Cell } from 'recharts';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const COLORS = ['#000', '#fff'];

export default function RemainingPlanDetail({ planQty, toGoQty, outputQty, CT }) {
    const locationPath = useLocation();
    const path = locationPath.pathname;

    let colorText;
    let colorChart;

    if (path === '/resource' ||
        path == '/resource/plan' ||
        path == '/resource/plan/detail' 

    ) {
        colorChart = COLORS[0]
        colorText = 'rgba(0, 0, 0, 0.1)';
    }


    //Rumus Remaining Time = ((toGoQty x cyclletime) / 60) / 60
    const remainingSeconds = toGoQty * CT;
    const remainingDuration = dayjs.duration(remainingSeconds, 'seconds');
    const remainingTime = `${remainingDuration.days() > 0 ? `${remainingDuration.days()}+` : ''}${remainingDuration.hours().toString().padStart(2, '0')}:${remainingDuration.minutes().toString().padStart(2, '0')}`;


    //Rumus Progress Production = (outputQty / planQty) x 100
    const percentage = planQty > 0 ? (outputQty / planQty * 100).toFixed(1) : 0.0;
    
    const endAngle = planQty > 0 ? (360 * (outputQty / planQty)) : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', justifyContent: 'center' }}>
            <PieChart width={50} height={50}>
                <Pie
                    data={[{ name: 'Remaining', value: 1 }]}
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
                    data={[{ name: 'outputQty', value: Math.max(outputQty, 0.01) }]}
                    cx={21}
                    cy={20}
                    innerRadius={18}
                    outerRadius={23}
                    fill="#8884d8"
                    dataKey="value"
                    startAngle={90} // Mulai dari atas
                    endAngle={90 - endAngle}
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
                            {`${percentage}`}
                        </text>
                    )}
                    labelLine={false}
                    stroke="none"
                >
                    <Cell fill={colorChart} />
                </Pie>
            </PieChart>
            <small>Remaining</small>
            <strong>{remainingTime}</strong>
        </div>

    );
}

RemainingPlanDetail.propTypes = {
    planQty: PropTypes.number.isRequired, // planQty should be a number
    toGoQty: PropTypes.number.isRequired, // planQty should be a number
    outputQty: PropTypes.number.isRequired, // outputQty should be a number
    CT: PropTypes.number.isRequired, // outputQty should be a number
};