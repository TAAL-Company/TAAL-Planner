import React from 'react';
import { Bar } from "react-chartjs-2";
const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
        {
            type: 'bar',
            label: 'Dataset 1',
            backgroundColor: "#5A607F",
            data: [50, 25, 12, 48, 90, 76, 42]
        },
        {
            type: 'bar',
            label: 'Dataset 2',
            backgroundColor: "#BCE0FD",
            data: [21, 84, 24, 75, 37, 65, 34]
        },
        {
            type: 'bar',
            label: 'Dataset 3',
            backgroundColor:"#2699FB",
            data: [41, 52, 24, 74, 23, 21, 32]
        }
    ]
};
const options = {
    maintainAspectRatio: false,
    aspectRatio: 0.8,
    plugins: {
        tooltips: {
            mode: 'index',
            intersect: false
        },
    },
    scales: {
        x: {
            stacked: true,
        },
        y: {
            stacked: true,
        }
    }
};

function Barchart() {
    return (
        <div>
            <Bar
                data={data}
                options={options}
            />
        </div>
    );
}

export default Barchart;