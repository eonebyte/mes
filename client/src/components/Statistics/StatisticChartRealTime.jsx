/* eslint-disable react/prop-types */
import Chart from "react-apexcharts"
import { Col, Row, Card } from "antd";
import { useEffect, useState } from "react";

export default function StatisticChartRealTime() {
    const [data, setData] = useState([35, 51, 49, 62, 69, 91]);

    useEffect(() => {
        const interval = setInterval(() => {
            const val = Math.floor(Math.random() * (100 - 30 + 1)) + 30;
            let array = [...data, val];
            array.shift();
            setData(array);
        }, 2000);
        return () => {
            clearInterval(interval); // clear the interval in the cleanup function
        };
    }, [data]);
    const series = [
        {
            name: "Computer Sales",
            data: data
        }
    ];

    const options = {
        chart: {
            id: "realtime",
            height: 350,
            type: "line",
            animations: {
                enabled: true,
                easing: "linear",
                dynamicAnimation: {
                    speed: 1000
                }
            },
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: "smooth"
        },
        title: {
            text: "Dynamic Updating Chart",
            align: "left"
        },
        markers: {
            size: 0
        },
        yaxis: {
            max: 170
        },
        legend: {
            show: false
        }
    };


    return (
        <>
            <Row>
                <Col span={24}>
                    <Card>
                        <Chart
                            options={options}
                            series={series}
                            type="line"
                            width="400"
                        />
                    </Card>
                </Col>
            </Row>
        </>
    )
}
