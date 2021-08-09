import React, { Component, useEffect } from 'react';
import styles from './index.less';
import { Card, message, Row, Spin } from 'antd';
import echarts from 'echarts';
import color from '../../../utils/config';
import utils from '../../../utils/utils';
import { DownloadOutlined } from '@ant-design/icons';
import ChartTitle from '../../../components/ChartTitle';


function Index({
                 trlNeedTimeData, trlTypeData, trlTimePercentData, trlTimePercentLoading, trlNeedTimeLoading,
                 trlTypeLoading, mothData, mothXdata, dayData, dataXdata, downLoadReport, selectFromArea, selectToArea,
               }) {
  const grid = {
    bottom: '5%',
    height: '70%',
    width: 'auto',
    left: '5%',
    right: '15%',
    containLabel: true,
  };
  useEffect(() => {
    const goTimeAnalysisLine = echarts.init(
      document.getElementById('goTimeAnalysisLine'),
    );
    const goDistanceAnalysisLine = echarts.init(
      document.getElementById('goDistanceAnalysisLine'),
    );
    const goTypeAnalysisBar = echarts.init(
      document.getElementById('goTypeAnalysisBar'),
    );
    const regionsCnt1 = echarts.init(
      document.getElementById('regionsCnt1'),
    );
    const regionsCnt2 = echarts.init(
      document.getElementById('regionsCnt2'),
    );
    const findMax = (dayData) => {
      let max = 0;
      for (let i = 0; i < dayData.length; i++) {
        if (dayData[i] > max) {
          max = dayData[i];
        }
      }
      return max;
    };
    //出行时间段占比 =======================
    const createTimePercentData = [];
    const createTimePercentCurData = [];
    const createTimePercentLastData = [];
    trlTimePercentData.cur && trlTimePercentData.cur.forEach((item, index) => {
      createTimePercentData.push(item.avgTrlTime);
      createTimePercentCurData.push(utils.getFloat(item.proportion * 100, 2));
      createTimePercentLastData.push(utils.getFloat(trlTimePercentData.last[index].proportion * 100, 2));
    });
    //出行方式占比================
    const creatTypeData = [];
    trlTypeData.cur && trlTypeData.cur.forEach((item, index) => {
      creatTypeData.push({
        type: item.trlType,
        '当月': utils.getFloat(item.proportion * 100, 2),
        '上月': utils.getFloat(trlTypeData.last[index].proportion * 100, 2),
      });
    });

    //出行时间特征分布 ======================
    const createPayTimeData = [];
    const createPayTimeLastData = [];
    const createPayTimeCurData = [];
    for (let i in (trlNeedTimeData.last || trlNeedTimeData.cur)) {
      createPayTimeData.push(i);
      createPayTimeLastData.push(trlNeedTimeData.last ? trlNeedTimeData.last[i] : 0);
      createPayTimeCurData.push(trlNeedTimeData.cur ? trlNeedTimeData.cur[i] : 0);
    }

    goTimeAnalysisLine.setOption({
      tooltip: {//提示框组件
        trigger: 'axis', //item数据项图形触发，主要在散点图，饼图等无类目轴的图表中使用。
        axisPointer: {
          type: 'line', // 默认为直线，可选为：'line' | 'shadow'
        },
        formatter: '{b0}<br />{a}: {c}%<br />{a1}: {c1}%',
      },
      legend: {
        data: ['当月', '上月'],
        icon: 'rect',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 20,
        top: 10,
        right: 20,
      },
      grid: grid,
      xAxis: {
        type: 'category',
        name: '时段',
        boundaryGap: false,
        axisTick: { show: false }, //刻度线
        /*  axisLine: {
            lineStyle: {
              color: color.xAxis_line_color,
            },
          },*/
        data: createTimePercentData,
      },
      yAxis: {
        axisLine: { show: false }, //y轴
        axisTick: { show: false }, //刻度线
        name: '百分比',
        nameTextStyle: {
          color: 'rgba(0,0,0,0.45)',
          align: 'right',
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: 'rgba(0,0,0,0.10)',
          },
        },
        axisLabel: {
          show: true,
          formatter: '{value} %',
        },
        type: 'value',
      },
      series: [
        {
          name: '当月',
          type: 'line',
          smooth: true,
          color: '#0B80EF',
          data: createTimePercentCurData,
          lineStyle: {
            color: '#3093F2',
          },
          itemStyle: {
            color: '#3093F2',
          },
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
                offset: 1, color: '#ffffff', // 100% 处的颜色
              }],
              // global: false // 缺省为 false
            },
          },
        },
        {
          name: '上月',
          type: 'line',
          smooth: true,
          color: color.moon_people_type_color,
          data: createTimePercentLastData,
          itemStyle: {
            color: '#26CBE3',
          },
          lineStyle: {
            color: '#26CBE3',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(0,193,222,0.3)', // 0% 处的颜色
              }, {
                offset: 1, color: '#ffffff', // 100% 处的颜色
              }],
              // global: false // 缺省为 false
            },
          },
        },
      ],
    });

    goTypeAnalysisBar.setOption({
      grid: grid,
      legend: {
        orient: 'horizontal',
        top: 10,
        icon: 'rect',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 20,
        right: 20,
      },
      tooltip: {//此为提示配置项
        formatter: (params, ticket, callback) => {
          return params.seriesName + '<br/>' + params.value.type + '：' + params.value[params.seriesName] + '%';
        },
      },
      dataset: {
        dimensions: ['type', '当月', '上月'],
        source: creatTypeData,
      },
      xAxis: {
        type: 'category',
        name: '方式',
        axisTick: {
          show: false,
        }, //刻度线
        /*   axisLine: {
             lineStyle: {
               color: color.xAxis_line_color,
             },
           },*/
        axisLabel: {
          interval: 0,
        },
      },
      yAxis: {
        axisLine: { show: false }, //y轴
        axisTick: { show: false }, //刻度线
        name: '百分比',
        nameTextStyle: {
          color: 'rgba(0,0,0,0.45)',
          align: 'right',
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: 'rgba(0,0,0,0.10)',
          },
        },
        axisLabel: {
          show: true,
          formatter: '{value} %',
        },
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
    });

    goDistanceAnalysisLine.setOption({
      tooltip: {//提示框组件
        trigger: 'axis', //item数据项图形触发，主要在散点图，饼图等无类目轴的图表中使用。
        axisPointer: {
          type: 'line', // 默认为直线，可选为：'line' | 'shadow'
        },
        formatter: '{b0}<br />{a}: {c}<br />{a1}: {c1}',
      },
      legend: {
        data: ['当月', '上月'],
        icon: 'rect',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 20,
        top: 10,
        right: 20,
      },
      grid: grid,
      xAxis: {
        type: 'category',
        name: '时间',
        boundaryGap: false,
        axisTick: { show: false }, //刻度线
        data: createPayTimeData,
        /*    axisLine: {
              lineStyle: {
                color: color.xAxis_line_color,
              },
            },*/
      },
      yAxis: {
        axisLine: { show: false }, //y轴
        axisTick: { show: false }, //刻度线
        name: '人次',
        nameTextStyle: {
          color: 'rgba(0,0,0,0.45)',
          align: 'right',
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: 'rgba(0,0,0,0.10)',
          },
        },
        axisLabel: {
          formatter: (value, index) => {
            return utils.transform(value, 1);
          },
        },
        type: 'value',
      },
      series: [
        {
          name: '当月',
          type: 'line',
          smooth: true,
          showSymbol: false,
          color: color.moon_people_time_color,
          // stack: '总量',
          data: createPayTimeCurData,
          lineStyle: {
            color: '#3093F2',
          },
          itemStyle: {
            color: '#3093F2',
          },
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
                offset: 1, color: '#ffffff', // 100% 处的颜色
              }],
              // global: false // 缺省为 false
            },
          },
        },
        {
          name: '上月',
          type: 'line',
          smooth: true,
          showSymbol: false,
          color: color.moon_people_type_color,
          // stack: '总量',
          data: createPayTimeLastData,
          itemStyle: {
            color: '#26CBE3',
          },
          lineStyle: {
            color: '#26CBE3',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(0,193,222,0.3)', // 0% 处的颜色
              }, {
                offset: 1, color: '#ffffff', // 100% 处的颜色
              }],
              // global: false // 缺省为 false
            },
          },
        },
      ],
    });
    // mothData, mothXdata, dayData, dataXdata
    regionsCnt1.setOption({
      title: {},
      grid: grid,
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'line',        // 默认为直线，可选为：'line' | 'shadow'
        },
      },
      xAxis: {
        data: mothXdata,
        // axisLabel: {
        //   inside: true,
        //   textStyle: {
        //     color: '#fff',
        //   },
        // },
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        z: 10,
      },
      yAxis: {
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          textStyle: {
            color: '#999',
          },
        },
      },
      series: [
        { // For shadow
          type: 'bar',
          itemStyle: {
            color: 'rgba(0,0,0,0.05)',
          },
          barGap: '-100%',
          barCategoryGap: '40%',
          data: mothData,
          animation: false,
          barMaxWidth: 20,
        },
        {
          type: 'bar',
          barMaxWidth: 20,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(
              0, 0, 0, 1,
              [
                { offset: 0, color: '#83bff6' },
                { offset: 0.5, color: '#188df0' },
                { offset: 1, color: '#188df0' },
              ],
            ),
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(
                0, 0, 0, 1,
                [
                  { offset: 0, color: '#2378f7' },
                  { offset: 0.7, color: '#2378f7' },
                  { offset: 1, color: '#83bff6' },
                ],
              ),
            },
          },
          data: mothData,
        },
      ],
    });
    regionsCnt2.setOption({
      visualMap: {
        show: false,
        type: 'continuous',
        seriesIndex: 0,
        min: 0,
        max: findMax(dayData),
      },
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        data: dataXdata,
      },
      yAxis: {
        splitLine: { show: false },
      },
      grid: {
        bottom: '20%',
        height: '70%',
        width: 'auto',
        containLabel: true,
      },
      series: [{
        type: 'line',
        showSymbol: false,
        data: dayData,
      }],
    });
  }, [trlTimePercentData, trlNeedTimeData, trlTypeData, mothData,
    mothXdata,
    dayData,
    dataXdata]);
  const base = () => {
    if (selectFromArea && selectToArea) {
      message.warning('请选择出发地、目的地，才能生成报告');
      return;
    }
    message.info('开始下载报告，请稍等...');
    const goTimeAnalysisLine = echarts.init(document.getElementById('goTimeAnalysisLine'));
    //3
    const goDistanceAnalysisLine = echarts.init(document.getElementById('goDistanceAnalysisLine'));
    //5
    const goTypeAnalysisBar = echarts.init(document.getElementById('goTypeAnalysisBar'));
    //1
    const regionsCnt1 = echarts.init(document.getElementById('regionsCnt1'));
    //2
    const regionsCnt2 = echarts.init(document.getElementById('regionsCnt2'));
    const base1 = regionsCnt1.getDataURL();
    const base2 = regionsCnt2.getDataURL();
    const base4 = goDistanceAnalysisLine.getDataURL();
    const base5 = goTimeAnalysisLine.getDataURL();
    const base3 = goTypeAnalysisBar.getDataURL();
    downLoadReport([base1, base2, base3, base4, base5]);
  };
  return (
    <div className={styles.wrap_chart}>
      <div className={styles.chart_content}>
        <Card className={styles.UnitCard}
              title={<div className={styles.timeTitle}>
                <ChartTitle title="出行时间段占比(分钟)"/>
                <div className={styles.downloadContent} onClick={() => base()}>
                  <DownloadOutlined/>
                  <span style={{paddingLeft:5}}>报告下载</span>
                </div>
              </div>}>
          {/*trlNeedTimeLoading  出行特征分布3*/}
          <Spin spinning={trlTimePercentLoading} className={styles.loading_style}>
            <div id="goTimeAnalysisLine" className={styles.tripTime}></div>
          </Spin>
        </Card>
        <Card className={styles.UnitCard} title={<ChartTitle title="出行方式占比"/>}>
          <Spin spinning={trlTypeLoading} className={styles.loading_style}>
            <div id="goTypeAnalysisBar" className={styles.tripTime}>
            </div>
          </Spin>
        </Card>
        {/**/}
        <Card className={styles.UnitCard} title={<ChartTitle title="出行时间特征分布"/>}>
        {/*<Card className={styles.UnitCard} title={<ChartTitle title="出行用时占比"/>}>*/}
          <Spin spinning={trlNeedTimeLoading} className={styles.loading_style}>
            <div id="goDistanceAnalysisLine" className={styles.tripTime}></div>
          </Spin>
        </Card>
      </div>
      <Card>
        <div id="regionsCnt1" className={styles.goDistanceAnalysisLine}></div>
      </Card>
      <Card>
        <div id="regionsCnt2" className={styles.goDistanceAnalysisLine}></div>
      </Card>
    </div>
  );
}

export default Index;
