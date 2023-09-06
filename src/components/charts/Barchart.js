import React from 'react';
import Chart from 'chart.js/auto';
import { Bar } from "react-chartjs-2";
const state = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
        {
            label: 'Rainfall',
            backgroundColor: [
                '#57C47D',
                '#F29D38',
                '#B1CDF9'
              ],
              hoverBackgroundColor: [
              '#57C47D',
              '#F29D38',
              '#B1CDF9'
              ],
            borderWidth: 2,
            data: [65, 59, 80, 81, 56]
        }
    ]
}

function Barchart() {
    return (
        <div>
            <Bar
                data={state}
                options={{
                    title: {
                        display: true,
                        text: 'Average Rainfall per month',
                        fontSize: 20
                    },
                    legend: {
                        display: true,
                        position: 'right'
                    }
                }}
            />
        </div>
    );
}

export default Barchart;