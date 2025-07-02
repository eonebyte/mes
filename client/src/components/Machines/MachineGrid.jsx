import { Row, Col } from 'antd';
import InjectionMoldingIcon from './InjectionMoldIcon2';
import PropTypes from 'prop-types';
import LinearProgress from '@mui/material/LinearProgress';
import { memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';


// Sidebar line default
const defaultLines = [
    { name: 'A1' },
    { name: 'A2' },
    { name: 'B1.1' },
    { name: 'B1.2' },
    { name: 'B2.1' },
];

const columnWidth = 62;
const rowHeight = 80;
const maxColumns = 20;

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3080';
const prefix = '/api/v1';

const MachineGrid = ({ resources }) => {

    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const [codeColors, setCodeColors] = useState({});

    const fetchCodeColors = async () => {
        try {
            const res = await fetch(`${backendUrl}${prefix}/resource/code/colors`);
            const data = await res.json();
            setCodeColors(data);

        } catch (error) {
            console.error("Failed to fetch count events data:", error);
        }
    };

    useEffect(() => {
        fetchCodeColors();
    }, []);

    const getColorByCode = (code) => {
        return codeColors[code] || '#ccc'; // default abu-abu
    }

    return (
        <div style={{ overflowX: 'auto', padding: 16, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', backgroundColor: "rgba(0, 0, 0, 0.2)" }}>
            {/* Header atas */}
            <Row style={{ minWidth: maxColumns * columnWidth + columnWidth }}>
                <LinearProgress />
                <Col style={{ width: columnWidth, height: 50, background: isDarkMode ? '#000' : '#e0e0e0', border: isDarkMode ? '1px solid #fff' : '1px solid #000' }} />
                {Array.from({ length: maxColumns }, (_, i) => (
                    <Col
                        key={`header-${i + 1}`}
                        style={{
                            width: columnWidth,
                            height: 50,
                            background: isDarkMode ? '#000' : '#e0e0e0',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontWeight: 'bold',
                            border: isDarkMode ? '1px solid #fff' : '1px solid #000',
                        }}
                    >
                        {i + 1}
                    </Col>
                ))}
            </Row>

            {/* Konten grid */}
            <div>
                {defaultLines.map(({ name }) => (
                    <Row key={name} style={{ minWidth: maxColumns * columnWidth + columnWidth }}>
                        {/* Sidebar line */}
                        <Col
                            style={{
                                width: columnWidth,
                                height: rowHeight,
                                background: isDarkMode ? '#000' : '#e0e0e0',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontWeight: 'bold',
                                border: isDarkMode ? '1px solid #fff' : '1px solid #000'
                            }}
                        >
                            {name}
                        </Col>

                        {/* Mesin per kolom */}
                        {Array.from({ length: maxColumns }, (_, i) => {
                            const lineno = String(i + 1);
                            const machine = resources.find(r => r.line === name && r.lineno === lineno);

                            return (
                                <Col
                                    key={`${name}-${lineno}`}
                                    style={{
                                        width: columnWidth,
                                        height: rowHeight,
                                        background: isDarkMode ? '#000' : '#fff',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        border: isDarkMode ? '1px solid rgba(181, 181, 181, 0.29)' : '1px solid rgba(0, 0, 0, 0.29)',
                                    }}
                                >
                                    {machine && (
                                        <div style={{ transform: 'rotate(270deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <InjectionMoldingIcon fill={getColorByCode(machine.status)} />
                                        </div>
                                    )}
                                </Col>
                            );
                        })}
                    </Row>
                ))}
            </div>
        </div>
    );
}

MachineGrid.propTypes = {
    resources: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            status: PropTypes.string.isRequired,
            line: PropTypes.string,
            lineno: PropTypes.string,
            code: PropTypes.string,
            image: PropTypes.string,
        })
    ).isRequired,
};

export default memo(MachineGrid, (prevProps, nextProps) => {
    // Custom comparison supaya rerender hanya jika resources berubah
    return JSON.stringify(prevProps.resources) === JSON.stringify(nextProps.resources);
});
