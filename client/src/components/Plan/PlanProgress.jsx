import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell } from 'recharts';
import PropTypes from 'prop-types';



const COLORS = ['#000'];

export default function PlanProgress({ target, progress }) {
    const isDarkMode = useSelector(state => state.theme.isDarkMode);
    return (
        <PieChart width={50} height={50}>
            <Pie
                data={[{ name: 'Remaining', value: target }]}
                cx={21}
                cy={20}
                innerRadius={18}
                outerRadius={23}
                fill="rgba(255, 255, 255,0.5)" // Warna putih penuh di belakang
                dataKey="value"
                startAngle={90}
                endAngle={450} // Full circle
                stroke="none"
            >
                <Cell fill="rgba(255, 255, 255, 0.5)" /> {/* Latar belakang putih */}
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
                            fill: `${isDarkMode ? '#fff' : '#333'}`,
                        }}
                    >
                        {`${progress}`}
                    </text>
                )}
                labelLine={false}
                stroke="none"
            >
                <Cell fill={COLORS[0]} />
            </Pie>
        </PieChart>
    );
}

PlanProgress.propTypes = {
    target: PropTypes.number.isRequired, // target should be a number
    progress: PropTypes.number.isRequired, // progress should be a number
};