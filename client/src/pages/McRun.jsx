import { useEffect, useState } from "react";
import highstock from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";

export default function McRun() {
  const [chartOptions5Min, setChartOptions5Min] = useState(null);
  const [chartOptions15Min, setChartOptions15Min] = useState(null);

  useEffect(() => {
    // Mengambil data dari API
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/mc-run");
        const data = await response.json();

        // Data untuk interval kecil (5 menit)
        const smallIntervalTwoHours = data.smallIntervalTwoHoursAgo;
        console.log(smallIntervalTwoHours);
        console.log("Categories:", smallIntervalTwoHours.categories);

        
        const options5Min = {
          chart: {
            type: 'line',
          },
          title: {
            text: 'MC RUNNING LAST 2H (5 Minute Interval)',
          },
          series: [
            {
              name: "MCNO Count",
              data: smallIntervalTwoHours.data, // Jumlah mesin yang aktif per interval 5 menit
            },
          ],
          xAxis: {
            labels: {
              rotation: -90,
              groupedOptions: [{
                rotation: 0
              }]
            },
            categories: smallIntervalTwoHours.categories.map(item => item.categories).flat()
          },
          yAxis: {
            title: {
              text: "Count of MCNO",
            },
          },
          plotOptions: {
            line: {
              dataLabels: {
                enabled: true,
              },
              enableMouseTracking: false,
            },
          },
        };

        // Data untuk interval besar (15 menit)
        const largeIntervalData = data.largeInterval;
        const options15Min = {
          chart: {
            type: 'line',
          },
          title: {
            text: 'MC RUNNING LAST 2H (15 Minute Interval)',
          },
          series: [
            {
              name: "MCNO Count",
              data: largeIntervalData.data, // Jumlah mesin yang aktif per interval 15 menit
            },
          ],
          xAxis: {
            categories: smallIntervalTwoHours.categories.map(item => item.categories).flat(),
            labels: {
              rotation: -90,
            },
          },
          yAxis: {
            title: {
              text: "Count of MCNO",
            },
          },
          plotOptions: {
            line: {
              dataLabels: {
                enabled: true,
              },
              enableMouseTracking: false,
            },
          },
        };

        // Update state untuk menampilkan grafik
        setChartOptions5Min(options5Min);
        setChartOptions15Min(options15Min);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ }}>
      <div style={{ height: "400px", width: "100%" }}>
        {chartOptions5Min && <HighchartsReact highcharts={highstock} options={chartOptions5Min} />}
      </div>
      <div style={{ height: "400px", width: "100%" }}>
        {chartOptions15Min && <HighchartsReact highcharts={highstock} options={chartOptions15Min} />}
      </div>
    </div>
  );
}
