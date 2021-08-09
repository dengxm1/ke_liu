import React, { Component, useEffect } from 'react';
import styles from './index.less';
import echarts from 'echarts';
// // 引入 ECharts 主模块
// const echarts = require('echarts/lib/echarts');
// // 引入柱状图
// require('echarts/lib/chart/pie');
// // 引入提示框和标题组件
// require('echarts/lib/component/tooltip');
// require('echarts/lib/component/title');
import color from '../../../utils/config';
import utils from '../../../utils/utils';

function Index({ monthTrlTypeData }) {
  const nameData = [];
  const seriesData = [];
  const data = [];
  monthTrlTypeData && monthTrlTypeData.map(item => {
    nameData.push(item.trlType);
    seriesData.push({ value: item.cnt, name: item.trlType });
    data.push(item.cnt);
  });

//求和
  const add = function(a, b) {
    return a + b;
  };
  const sum = data.reduce(add, 0);
  const goTypeOptions = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {d}% <br/>数量：{c}',
      // formatter: '{a} <br/>{b}: ({d}%)',
    },
    color: [
      color.moon_people_type_color,
      color.moon_people_time_color,
      color.pie_other_color,
      '#ff9d33',
      '#585868',
    ],
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      top: '2%',
      icon: 'circle',
      data: nameData,
      textStyle: {
        fontFamily: 'MicrosoftYaHei',
        fontSize: 12,
        color: 'rgba(0, 0, 0, 0.7)',
      },
      selectedMode: false,
    },
    graphic: [{ //环形图中间添加文字
      type: 'text',
      left: 'center',
      top: '50%',
      style: {
        text: '总量' + '\n' + utils.transform(sum,2),
        // text: '总量',
        textAlign: 'center',
        fill: '#898989', //文字的颜色
        width: 30,
        height: 30,
        fontSize: 14,
        fontFamily: 'Microsoft YaHei',
      },
    }],
    series: [
      {
        name: '出行方式特征',
        type: 'pie',
        radius: ['40%', '55%'],
        // center: ['60%', '41%', '40%', '38%'],  //调整圆环位置
        center: ['50%', '60%'],  //调整圆环位置
        label: {
          formatter: ' {b|{b}}\n {per|{d}%} ',
          rich: {
            b: {
              fontSize: 14,
              lineHeight: 20,
            },
            per: {
              // color: '#eee',
              padding: [1, 2],
              borderRadius: 2,
            },
          },
        },
        data: seriesData,
      },
    ],
  };
  useEffect(() => {
    // const obj = JSON.parse(light);
    // console.log('monthTrlTypeData', monthTrlTypeData);
    const dom = document.getElementById('typeAnalysis');
    const chartTypeDiv = echarts.init(dom);
    chartTypeDiv.clear();
    chartTypeDiv.setOption(goTypeOptions);
  }, [monthTrlTypeData]);

  return (
    <React.Fragment>
      <div id="typeAnalysis" className={styles.wrap_type_chart}></div>
    </React.Fragment>
  );
}

export default Index;
