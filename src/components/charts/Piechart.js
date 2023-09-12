import React from 'react';
import Chart from 'chart.js/auto';
import {Pie} from 'react-chartjs-2';

const state = {
    labels: ['January', 'February'],
    datasets: [
      {
        label: 'Rainfall',
        backgroundColor: [
          '#BCE0FD',
          '#2699FB',
        ],
        hoverBackgroundColor: [
        '#BCE0FD',
        '#2699FB',
        ],
        data: [60, 40]
      }
    ]
  }

function Piechart() {
    return (
        <div >
        <Pie
          data={state}
          options={{
            title:{
              display:true,
              text:'Average Rainfall per month',
              fontSize:20
            },
            legend:{
              display:true,
              position:'right'
            }
          }}
        />
      </div>
    );
}

export default Piechart;