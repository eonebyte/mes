import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell } from 'recharts';
import PropTypes from 'prop-types';

const COLORS = ['#000'];

export default function RemainingMold({ target, progress }) {
    const isDarkMode = useSelector(state => state.theme.isDarkMode);

    // Hitung sisa nilai
    const remaining = target - progress;

    return (
        <PieChart width={50} height={50}>
            {/* Pie untuk Remaining (Sisa) */}
            <Pie
                data={[{ name: 'Remaining', value: remaining }]}
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
                <Cell fill="rgba(0, 0, 0, 0.1)" /> {/* Latar belakang putih */}
            </Pie>

            {/* Pie untuk Progress */}
            <Pie
                data={[{ name: 'Progress', value: progress }]}
                cx={21}
                cy={20}
                innerRadius={18}
                outerRadius={23}
                fill="red"
                dataKey="value"
                startAngle={90} // Mulai dari atas
                endAngle={90 - (360 * (progress / target))} // Hitung progress sebagai proporsi dari target
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
                        {`${progress}`} {/* Menampilkan nilai progress */}
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

RemainingMold.propTypes = {
    target: PropTypes.number.isRequired, // target should be a number
    progress: PropTypes.number.isRequired, // progress should be a number
};
