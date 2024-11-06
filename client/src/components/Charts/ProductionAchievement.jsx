import { useEffect, useState } from "react"
import ReactApexChart from "react-apexcharts"

export default function ProductionAchievement() {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const series = [25.85];
        const color = getColorFromValue(series[0]);
        const options = {
            chart: {
                height: 100, // Ukuran chart lebih kecil
                type: 'radialBar',
                sparkline: {
                    enabled: true
                },
            }, 
            plotOptions: {
                radialBar: {
                    // hollow: {
                    //     size: '70%',
                    // }
                    dataLabels: {
                        showOn: 'always',
                        name: {
                            show: false
                        },
                        value: {
                            fontSize: '16px',
                            offsetY: 5,
                            color: color,
                            margin: 0,
                            formatter: function (val) {
                                return Number.isInteger(val) ? val.toFixed(0) : val.toFixed(1);
                            }
                        }
                    }
                },
            },
            fill: {
                colors: [color]
            },
            labels: ['Cricket'],
        };

        setChartData({series, options})
        
    }, []);

    const getColorFromValue = (oee) => {
        const color = oee >= 100 ? "#008000" : oee >= 80 ? "#FFA500" : oee >= 60 ? "#1E90FF" : "#00FFFF";
        return color;
    };

  return (
    <>
          {chartData && (
              <ReactApexChart options={chartData.options} series={chartData.series} type="radialBar" />
          )}
    </>
  )
}
