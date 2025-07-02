import React from "react";
import visavail from "visavail";
import moment from "moment";
import "../../../node_modules/visavail/visavail.min.css";
import "../../../node_modules/visavail/visavail.min.js";

class VisavailChart extends React.Component {
    alarm_bar = {};
    test = 0;
    constructor(props) {
        super(props);
        this.alarm_bar["dataset"] = [
            {
                measure: "Balance",
                interval_s: 3 * 30.5 * 24 * 60 * 60,
                data: [
                    ["2015-03-31", 0],
                    ["2015-06-30", 1],
                    ["2015-09-30", 1],
                    ["2015-12-31", 1],
                    ["2016-03-31", 1],
                    ["2016-06-30", 1],
                    ["2016-09-30", 1],
                    ["2016-12-31", 1],
                    ["2017-03-31", 0],
                    ["2017-06-30", 1],
                    ["2017-09-30", 1],
                    ["2017-12-31", 1],
                    ["2018-03-31", 1],
                    ["2018-06-30", 1],
                    ["2018-09-30", 1]
                ]
            }
        ];

        this.alarm_bar["options"] = {
            id_div_container: "alarm_bar_container",
            id_div_graph: "alarm_bar_div",
            date_in_utc: false,
            //width: document.getElementById("alarm_bar_div").offsetWidth,
            line_spacing: 24,
            tooltip: {
                height: 18,
                position: "overlay",
                left_spacing: 20,
                only_first_date: true,
                date_plus_time: true
            },
            responsive: {
                enabled: true
            }
        };
    }

    renderChart() {
        this.alarm_bar["chart"] = visavail.generate(
            this.alarm_bar.options,
            this.alarm_bar.dataset
        );
    }

    updateGraph() {
        let length = this.alarm_bar.dataset[0].data.length;
        this.alarm_bar.dataset[0].data.push([
            moment(this.alarm_bar.dataset[0].data[length - 1][0])
                .add(1, "month")
                .format("YYYY-MM-DD"),
            this.alarm_bar.dataset[0].data[length - 1][1] ? 0 : 1
        ]);
        this.setState({ test: 0 });
    }

    componentDidMount() {
        this.renderChart();
        setInterval(() => {
            this.updateGraph();
        }, 2000);
    }

    componentDidUpdate() {
        if (this.alarm_bar["chart"]) {
            this.alarm_bar.chart.updateGraph(this.alarm_bar.dataset);
        } else this.renderChart();
    }

    render() {
        return (
            <div
                style={{ width: "100%", overflow: "hidden" }}
                className="visavail"
                id="alarm_bar_container"
            >
                <p id="alarm_bar_div" style={{ overflow: "hidden" }} />
            </div>
        );
    }
}

export default VisavailChart;
