import React from 'react';
import Chart from 'chart.js/auto';
import {Pie} from 'react-chartjs-2';

const state = {
    labels: ['January', 'February'],
    datasets: [
      {
        label: 'Rainfall',
        backgroundColor: [
          '#57C47D',
          '#F29D38',
        ],
        hoverBackgroundColor: [
        '#57C47D',
        '#F29D38',
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