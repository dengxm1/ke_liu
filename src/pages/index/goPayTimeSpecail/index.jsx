import React, { Component, useEffect } from 'react';
import color from '../../../utils/config';
import styles from '../index.less';
import { Card } from 'antd';
import echarts from 'echarts';
import utils from '../../../utils/utils';
// // 引入 ECharts 主模块
// const echarts = require('echarts/lib/echarts');
// // 引入柱状图
// require('echarts/lib/chart/line');
// // 引入提示框和标题组件
// require('echarts/lib/component/tooltip');
// require('echarts/lib/component/title');


function Index({ goTypeSpecialAnalysisData, goTypeSpecialAnalysisLoading }) {


  useEffect(() => {

    const xData = [];
    const yDataCur = [];
    const yDataLast = [];
    if (goTypeSpecialAnalysisData) {
      for (let i in (goTypeSpecialAnalysisData.last || goTypeSpecialAnalysisData.cur)) {
        xData.push(i);
        yDataCur.push(goTypeSpecialAnalysisData.cur ? goTypeSpecialAnalysisData.cur[i] : 0);
        yDataLast.push(goTypeSpecialAnalysisData.last ? goTypeSpecialAnalysisData.last[i] : 0);
      }
    }

    const myChart = echarts.init(document.getElementById('chart_id'));
    const colorArray = [
      'rgba(44,161,80,1)',
      'rgba(44,161,80,1)',
      'rgba(44,161,80,1)',
      'rgba(255,185,38,1)',
      'rgba(255,185,38,1)',
      'rgba(255,36,7,1)',
      'rgba(255,36,7,1)',
      'rgba(255,36,7,1)',
    ];
    const option = {
      grid: {
        left: '2%',
        right: '7%',
        bottom: '7%',
        top: '23%',
        containLabel: true, //grid 区域是否包含坐标轴的刻度标签
      },
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        name: '时间',
        boundaryGap: false,
        axisLine: {
          //x轴
          // show: false,
        },
        axisTick: {
          //y轴刻度线
          show: false,
        },
        data: xData,
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false,
        },
        name: '人次',
        axisLabel: {
          formatter: (value, index) => {
            return `${utils.transform(value, 1)}`;
          },
          color: (value, index) => {
            return colorArray[index];
          },
        },
        axisTick: {
          //y轴刻度线
          show: false,
        },
        splitLine: {
          lineStyle: {
            color: colorArray,
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: '上月',
          type: 'line',
          // color: color.moon_people_type_color,
          data: yDataLast,
          itemStyle: {
            normal: {
              lineStyle: {
                width: 2,
                type: 'dotted',
                color: '#FFAC00',
              },
            },
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(255,255,104,0.2)', // 0% 处的颜色
              }, {
                offset: 1, color: '#fff', // 100% 处的颜色
              }],
              // global: false // 缺省为 false
            },
          },
          showSymbol: false,
          smooth: true,
        },
        {
          name: '当月',
          type: 'line',
          color: color.moon_people_time_color,
          data: yDataCur,
          itemStyle: {
            normal: {
              lineStyle: {
                width: 2,
                type: 'solid',
                color: '#489cfd',
              },
            },
          },
          smooth: true,
          showSymbol: false,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(11,128,239,0.3)', // 0% 处的颜色
              }, {
                offset: 1, color: '#fff', // 100% 处的颜色
              }],
              // global: false // 缺省为 false
            },
          },
        },
      ],
    };
    myChart.clear();
    myChart.setOption(option);
    window.onresize = myChart.resize;
  }, [goTypeSpecialAnalysisData, goTypeSpecialAnalysisLoading]);

  return (
    <div id="chart_id" className={styles.echart}></div>
  );
}

export default Index;
