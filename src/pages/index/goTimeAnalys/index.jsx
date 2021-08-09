import React, { Component, useEffect } from 'react';
import styles from './index.less';

import echarts from 'echarts';
// // 引入 ECharts 主模块
// const echarts = require('echarts/lib/echarts');
// // 引入柱状图
// require('echarts/lib/chart/bar');
// // 引入提示框和标题组件
// require('echarts/lib/component/tooltip');
// require('echarts/lib/component/title');
import color from '../../../utils/config';
import utils from '../../../utils/utils';
import {Spin} from 'antd'

//utils.transform(odTotal)
function Index({ goTimeHowLongSpecail,timeLoading }) {
  const createData = [['时间段', '当月', '上月']];
  goTimeHowLongSpecail.cur && goTimeHowLongSpecail.cur.map((item, index) => {
    createData.push([item.avgTrlTime, item.cnt, goTimeHowLongSpecail.last[index] ? goTimeHowLongSpecail.last[index].cnt : 0]);
  });
  useEffect(() => {
    const myChart = echarts.init(document.getElementById('goTimeAnalysis'));
    myChart.clear()
    const option = {
      grid: {
        bottom: '1%',
        height: '65%',
        left: 45,
        right: 48,
        width: 'auto',
        top: '20%',
      },
      legend: {
        orient: 'horizontal',
        top: '5%',
        right: '8%',
        icon: 'rect',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 20,
        selectedMode: false,
      },
      tooltip: {},
      dataset: {
        source: createData,
      },
      xAxis: {
        type: 'category',
        axisTick: { show: false }, //刻度线
        name: '时长',
        axisLine: {
          lineStyle: {
            color: color.xAxis_line_color,
          },
        },
        axisLabel: {
          formatter: (value) => {
            return `${value}min`
          }
        }
      },
      yAxis: {
        axisLine: { show: false }, //y轴
        axisTick: { show: false }, //刻度线
        name: '人次',
        axisLabel: {
          formatter: (value, index) => {
            return `${utils.transform(value, 0)}`;
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: 'rgba(0,0,0,0.10)',
          },
        },
        type: 'value',
      },

      series: [{
        type: 'bar',
        barMaxWidth: 6,
        color: color.moon_people_time_color,
        itemStyle: {
          barBorderRadius: [10, 10, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: '#1C6BD9',
          }, {
            offset: 1,
            color: 'rgba(28,107,217,0.30)',
          }]),
        },
      }, {
        type: 'bar',
        barMaxWidth: 6,
        color: color.moon_people_type_color,
        itemStyle: {
          barBorderRadius: [10, 10, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: '#00C1DE',
          }, {
            offset: 1,
            color: 'rgba(0,193,222,0.3)',
          }]),
        },
      }],
    }
    myChart.setOption(option);
  }, [goTimeHowLongSpecail]);

  return (
    <React.Fragment>
      <div id="goTimeAnalysis" className={styles.wrap_time_chart}></div>

    </React.Fragment>
  );
}

export default Index;
