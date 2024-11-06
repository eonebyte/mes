/* eslint-disable no-undef */
import Chart from "react-apexcharts"
import { useState } from "react"
import { Col, Row, Card } from "antd";

function generateDayWiseTimeSeries(baseval, count, yrange) {
    var i = 0;
    var series = [];
    while (i < count) {
        var x = baseval;
        var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
        series.push([x, y]);
        baseval += 86400000; // Satu hari dalam milidetik (1000 ms * 60 detik * 60 menit * 24 jam)
        i++;
    }
    return series;
}

export default function StatisticChart() {


    const [options,] = useState({
        chart: {
            id: "basic-bar"
        },
        xaxis: {
            categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
        },
    });
    const [series,] = useState([
        {
            name: "series-1",
            data: [30, 40, 45, 50, 49, 60, 70, 91]
        }
    ]);

    const [options2,] = useState({
        chart: {
            type: 'area',
            height: 350,
            stacked: true,
            events: {
                selection: function (chart, e) {
                    console.log(new Date(e.xaxis.min))
                }
            },
        },
        colors: ["rgb(33, 244, 54)", "rgb(244, 189, 33)", "rgb(244, 33, 33)"],
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        fill: {
            type: 'gradient',
            gradient: {
                opacityFrom: 0.6,
                opacityTo: 0.8,
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'left'
        },
        xaxis: {
            type: 'datetime'
        },
    });

    const startDate = new Date('11 Feb 2017 GMT').getTime();
    const dataDayWiseTimeSeries = generateDayWiseTimeSeries(startDate, 20, { min: 10, max: 60 });

    const [series2,] = useState([
        {
            name: 'Green',
            data: dataDayWiseTimeSeries,
        },
        {
            name: 'Yellow',
            data: dataDayWiseTimeSeries,
        },
        {
            name: 'Red',
            data: dataDayWiseTimeSeries,
        }
    ]);

    return (
        <>
            <Row>
                <Col span={8}>
                    <Card>
                        <Chart
                            options={options}
                            series={series}
                            type="bar"
                            width="400"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Chart
                            options={options}
                            series={series}
                            type="line"
                            width="400"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Chart
                            options={options2}
                            series={series2}
                            type="area"
                            width="400"
                        />
                    </Card>
                </Col>
            </Row>
        </>
    )
}
