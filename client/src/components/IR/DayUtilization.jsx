import { useSelector } from 'react-redux';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import PropTypes from 'prop-types';


const DaysUtilization = () => {
    const data = [
        {
            name: 'Page A',
            uv: 4000,
            pv: 2400,
            amt: 2400,
        },
        {
            name: 'Page B',
            uv: 3000,
            pv: 1398,
            amt: 2210,
        },
        {
            name: 'Page C',
            uv: 2000,
            pv: 9800,
            amt: 2290,
        },
        {
            name: 'Page D',
            uv: 2780,
            pv: 3908,
            amt: 2000,
        },
        {
            name: 'Page E',
            uv: 1890,
            pv: 4800,
            amt: 2181,
        },
        {
            name: 'Page F',
            uv: 2390,
            pv: 3800,
            amt: 2500,
        },
        {
            name: 'Page G',
            uv: 3490,
            pv: 4300,
            amt: 2100,
        },
    ];

    const isDarkMode = useSelector(state => state.theme.isDarkMode);
    
    return (
        <ResponsiveContainer width="100%" height={200}>
            <AreaChart
                data={data}
                margin={{
                    top: 0,
                    right: 30,
                    left: 0,
                    bottom: 0,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: isDarkMode ? '#FFF' : '#000' }} />
                <YAxis tick={{ fill: isDarkMode ? '#FFF' : '#000' }} />
                <Tooltip contentStyle={{ color: isDarkMode ? '#000' : '#000' }} />
                <Area type="linear" dataKey="uv" stroke="#000" fill="#389e0d" />
            </AreaChart>
        </ResponsiveContainer>
    );
};

// DaysUtilization.propTypes = {
//     utilization: PropTypes.array.isRequired
// }


export default DaysUtilization;
