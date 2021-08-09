import React, { Component } from 'react';
import echarts from 'echarts';
import { Spin } from 'antd';
import {
  trafficTripMode,
  trafficDistanceMode,
  trafficTripTimeHold,
} from '../../services/global';
import styles from './index.less';
import { Card } from 'antd';
import color from '../../utils/config';
import utils from '../../utils/utils';
import ChartTitle from "../ChartTitle";

class TrafficGraph extends Component {
  state = {
    tripMode: [], //通勤方式data数据
    distanceSeries: [], //通勤距离折线图的series
    timeSeries: [], //通勤时间折线图的series
    echartDataId: '',  //用于显示echart数据的参数id
    echartOdTfcunitId: '',
    trafficModeLoding: false,
    trafficTimeLoding: false,
    trafficDistanceLoding: false,
    statMonth: this.props.fieldsValue.statMonth,
  };

  componentDidMount() {
    const { tfcunitId,odTfcunitId } = this.props;
    if (tfcunitId) {
      this.setState({
        echartDataId: tfcunitId,
        echartOdTfcunitId:odTfcunitId
      }, () => {
        this.getTrafficTripMode();
        this.getTrafficDistanceMode();
        this.getTrafficTripTimeHold(); //通勤时间占比（车辆分析
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const isTripMode = nextProps.fieldsValue.tripMode !== this.props.fieldsValue.tripMode;
    const isStatMonth = nextProps.fieldsValue.statMonth !== this.props.fieldsValue.statMonth;
    const isTravalPeriod = nextProps.fieldsValue.travalPeriod !== this.props.fieldsValue.travalPeriod;
    const isAreaType = nextProps.fieldsValue.areaType !== this.props.fieldsValue.areaType;
    const isTfcunitId = nextProps.tfcunitId !== this.props.tfcunitId;
    const isOdTfcunitId=nextProps.odTfcunitId!==this.props.odTfcunitId;
    if (isTripMode || isStatMonth || isTravalPeriod || isAreaType || isTfcunitId||isOdTfcunitId) {
      this.setState({
        echartDataId: nextProps.tfcunitId,
        echartOdTfcunitId: nextProps.odTfcunitId,
        statMonth: nextProps.fieldsValue.statMonth
      }, () => {
        this.getTrafficTripMode();
        this.getTrafficDistanceMode();
        this.getTrafficTripTimeHold(); //通勤时间占比（车辆分析
      });
    }
  }


  //经济成本分析
  getTrafficTripMode = () => {
    const { echartDataId, statMonth,echartOdTfcunitId } = this.state;
    this.setState({
      trafficModeLoding: true,
    }, () => {
      trafficTripMode({
        tfcunitId: echartDataId,
        odTfcunitId:echartOdTfcunitId,
        statMonth,
      })
        .then(res => {
          this.setState({
            trafficModeLoding: false,
          });
          if (res) {
            if (res.code === 200) {
              const tripMode = [];
              res.data.forEach(item => {
                tripMode.push({
                  value: item.cnt,
                  name: item.trlType,
                });
              });
              this.setState(
                {
                  tripMode,
                },
                () => {
                  this.initTrafficMode();
                },
              );
            }
          }
        })
        .catch(e => {
          console.log(e);
          this.setState({
            trafficModeLoding: false,
          });
        });
    });
  };

  //通勤时间占比（车辆分析）
  getTrafficTripTimeHold = () => {
    const { echartDataId, statMonth, echartOdTfcunitId } = this.state;
    this.setState({
      trafficTimeLoding: true,
    }, () => {
      trafficTripTimeHold({
        tfcunitId: echartDataId,
        odTfcunitId:echartOdTfcunitId,
        statMonth,
      })
        .then(res => {
          this.setState({
            trafficTimeLoding: false,
          });
          if (res) {
            if (res.code === 200) {
              const series = [];
              const data = res.data;
              const colorList = [
                '#00C1DE',
                '#0B80EF',
                '#E25959',
                '#FFAC00',
                '#8B6FE1',
                '#98A9B9',
              ];
              const colorList2 = [
                'rgba(0,193,222,0.3)',
                'rgba(11,128,239,0.3)',
                'rgba(226,89,89,0.3)',
                'rgba(255,172,0,0.3)',
                'rgba(139,111,225,0.3)',
                'rgba(152,169,185,0.3)',
              ];
              // const xAxis = ['0-10', '10-20', '20-30', '30-40', '>40'];
              const xAxis = ['0-20', '20-40', '40-60', '60-80', '>80'];
              for (let key in data) {
                if (data.hasOwnProperty(key)) {
                  series.push({
                    name: key,
                    type: 'line',
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 5,
                  });
                }
              }
              //设置折线的颜色和data
              series.forEach((item, index) => {
                item.lineStyle = { color: colorList[index] };
                item.itemStyle = { color: colorList[index] };
                item.areaStyle={
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                      offset: 0, color: colorList2[index] // 0% 处的颜色
                    }, {
                      offset: 1, color: '#ffffff' // 100% 处的颜色
                    }],
                    // global: false // 缺省为 false
                  },
                };
                let data = [0, 0, 0, 0, 0];
                res.data[item.name].forEach(item2 => {
                  xAxis.forEach((axis, index) => {
                    if (item2.avgTrlTime === axis) {
                      data[index] = item2.cnt;
                    }
                  });
                });
                item.data = data;
              });
              this.setState(
                {
                  timeSeries: series,
                },
                () => {
                  this.initTripTime();
                },
              );
            }
          }
        })
        .catch(e => {
          console.log(e);
          this.setState({
            trafficTimeLoding: false,
          });
        });
    });
  };

  //获取通勤距离占比(交通通勤分析)
  getTrafficDistanceMode = () => {
    const { echartDataId, statMonth, echartOdTfcunitId } = this.state;
    this.setState({
      trafficDistanceLoding: true,
    }, () => {
      trafficDistanceMode({
        tfcunitId: echartDataId,
        odTfcunitId:echartOdTfcunitId,
        statMonth,
      })
        .then(res => {
          this.setState({
            trafficDistanceLoding: false,
          });
          if (res) {
            if (res.code === 200) {
              const series = [];
              const data = res.data;
              const colorList = [
                '#00C1DE',
                '#0B80EF',
                '#E25959',
                '#FFAC00',
                '#8B6FE1',
                '#98A9B9',
              ];
              const colorList2 = [
                'rgba(0,193,222,0.3)',
                'rgba(11,128,239,0.3)',
                'rgba(226,89,89,0.3)',
                'rgba(255,172,0,0.3)',
                'rgba(139,111,225,0.3)',
                'rgba(152,169,185,0.3)',
              ];
              const xAxis = ['0-5', '5-10', '10-15', '15-20', '>20'];
              for (let key in data) {
                if (data.hasOwnProperty(key)) {
                  series.push({
                    name: key,
                    type: 'line',
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 5,
                    areaStyle:{}
                  });
                }
              }
              //设置折线的颜色和data
              series.forEach((item, index) => {
                item.lineStyle = { color: colorList[index] };
                item.itemStyle = { color: colorList[index] };
                item.areaStyle={
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                      offset: 0, color: colorList2[index] // 0% 处的颜色
                    }, {
                      offset: 1, color: '#ffffff' // 100% 处的颜色
                    }],
                    // global: false // 缺省为 false
                  },
                };
                let data = [0, 0, 0, 0, 0];
                res.data[item.name].forEach(item2 => {
                  xAxis.forEach((axis, index) => {
                    if (item2.avgTrlDistance === axis) {
                      data[index] = item2.cnt;
                    }
                  });
                });
                item.data = data;
              });
              this.setState(
                {
                  distanceSeries: series,
                },
                () => {
                  this.initTrafficDistance();
                },
              );
            }
          }
        })
        .catch(e => {
          console.log(e);
          this.setState({
            trafficDistanceLoding: false,
          });
        });
    });
  };

  //经济成本分析扇形
  initTrafficMode = () => {
    const { tripMode } = this.state;
    const data=[];
    tripMode.forEach(item=>{
      data.push(item.value)
    })
    const add = function(a, b) {
      return a + b;
    };
    const sum = data.reduce(add, 0);
    const getPercent=(num)=>{
      return utils.getFloat(num/sum*100,2)+'%';
    }
    const TrafficModeRef = echarts.init(
      document.getElementById('TrafficModeRef'),
    );
    TrafficModeRef.setOption({
      //提示框组件
      tooltip: {
        // trigger: 'item',
        formatter: '{a} <br/>{b}:{d}% ({c})',
      },
      toolbox: {
     /*    feature: {
          saveAsImage: {
            name: '交通通勤分析经济成本分析',
          },
        }, */
      },
      grid: {
        bottom: '5%',
        height: '60%',
        width: 'auto',
        containLabel: true,
      },
      //图例组件
      legend: {
        orient: 'horizontal',
        padding: [5, 2],
        // data: ['公交', '轨交', '出租/网约', '驾车', '步行', '其他'],
        icon: 'circle',
        selectedMode: false,
        textStyle: {
          fontSize: 10,
          color:'rgba(0,0,0,0.45)'
        },
        itemWidth: 8,
        itemHeight:8,
        right:20
      },
      graphic: [{ //环形图中间添加文字
        type: 'text',
        left: 'center',
        top: '50%',
        style: {
          text: '总量' + '\n' + utils.transform(sum,2),
          textAlign: 'center',
          fill: '#898989', //文字的颜色
          width: 30,
          height: 30,
          fontSize: 14,
          textVerticalAlign:'bottom',
          fontFamily: 'Microsoft YaHei',
        },
      }],
      //系列列表
      series: [
        {
          name: '经济成本分析',
          avoidLabelOverlap: true,//对，就是这里avoidLabelOverlap
          type: 'pie',
          radius: ['45%', '60%'],
          bottom: 10,
          stillShowZeroSum: false,
          right: 10,
          left: 10,
          // minAngle:30,
          center:['50%','60%'],
          labelLine:{
            length:5
          },
          data: tripMode,
          label: {
            color: '#313030',
            fontSize: 10,
       /*     padding:10,
            height:40,*/
            formatter:'{b}: {d}%',
          /*  formatter:({data:{value,name}})=>{
              let data=name+'\n'+getPercent(value)+' ('+value+')';
              return data;
            },*/
            distanceToLabelLine: 10,
          },
          itemStyle: {
            color: seriesIndex => {
              console.log(seriesIndex);
              let colorList = [
                '#00C1DE',
                '#0B80EF',
                '#E25959',
                '#FFAC00',
                '#8B6FE1',
                '#98A9B9',
              ];
              return colorList[seriesIndex.dataIndex];
            },
          },
        },
      ],
    });
  };

  //通勤时间占比（车辆分析）
  initTripTime = () => {
    const { timeSeries } = this.state;
    const TrafficTimeRef = echarts.init(
      document.getElementById('TrafficTimeRef'),
    );
    TrafficTimeRef.setOption({
      title: {
        text: '',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        right:20,
        selectedMode: false,
        textStyle: {
          fontSize: 10,
          color:'rgba(0,0,0,0.45)'
        },

      },
      grid: {
        bottom: '5%',
        height: '75%',
        left:'5%',
        right:'15%',
        width: 'auto',
        containLabel: true,
      },
      toolbox: {
      /*   feature: {
          saveAsImage: {
            name: '交通通勤分析通勤时间占比',
          },
        }, */
      },
      xAxis: {
        type: 'category',
        name:'时长',
        boundaryGap: false,
        data: ['0-20', '20-40', '40-60', '60-80', '>80'],
        axisTick: {
          alignWithLabel: true,
        },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false }, //y轴
        axisTick: { show: false }, //刻度线
        name: '人次',
        nameTextStyle:{
          color:'rgba(0,0,0,0.45)',
          align:'right',
        },
        axisLabel: {
          formatter: (value, index) => {
            if (value < 1) return null;
            return utils.transform(value, 1);
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: 'rgba(0,0,0,0.10)',
          },
        },
      },
      series: timeSeries,
    });
  };

  //通勤距离折线
  initTrafficDistance = () => {
    const { distanceSeries } = this.state;
    const TrafficDistanceRef = echarts.init(
      document.getElementById('TrafficDistanceRef'),
    );
    TrafficDistanceRef.setOption({
      title: {
        text: '',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        right:20,
        selectedMode: false,
        textStyle: {
          fontSize: 10,
          color:'rgba(0,0,0,0.45)'
        },
      },
      grid: {
        bottom: '5%',
        height: '75%',
        left: '5%',
        right:'15%',
        width: 'auto',
        containLabel: true,
      },
      toolbox: {
      /*   feature: {
          saveAsImage: {
            name: '交通通勤分析通勤距离占比',
          },
        }, */
      },
      xAxis: {
        type: 'category',
        name:'千米',
        boundaryGap: false,
        data: ['0-5', '5-10', '10-15', '15-20', '>20'],
        axisTick: {
          alignWithLabel: true,
        },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false }, //y轴
        axisTick: { show: false }, //刻度线
        name: '人次',
        nameTextStyle:{
          color:'rgba(0,0,0,0.45)',
          align:'right',
        },
        axisLabel: {
          formatter: (value, index) => {
            if (value < 1) return null;
            return utils.transform(value, 1);
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: 'rgba(0,0,0,0.10)',
          },
        },
      },
      series: distanceSeries,
    });
  };

  render() {
    const { trafficModeLoding, trafficTimeLoding, trafficDistanceLoding } = this.state;
    return (
      <div className={styles.crowdContent}>
        <Card
          title={<ChartTitle title="经济成本分析"/>}
          className={styles.unitCard}
          bordered={false}
        >
          <Spin spinning={trafficModeLoding} className={styles.loading_style}>
            <div id="TrafficModeRef" className={styles.tripTime}></div>
          </Spin>
        </Card>
        <Card
          title={<ChartTitle title="通勤时间占比"/>}
          className={styles.unitCard}
          bordered={false}
        >
          <Spin spinning={trafficTimeLoding} className={styles.loading_style}>
            <div id="TrafficTimeRef" className={styles.tripTime}></div>
          </Spin>
        </Card>
        <Card
          title={<ChartTitle title="通勤距离占比"/>}
          className={styles.unitCard}
          bordered={false}
        >
          <Spin spinning={trafficDistanceLoding} className={styles.loading_style}>
            <div id="TrafficDistanceRef" className={styles.tripTime}></div>
          </Spin>
        </Card>
      </div>
    );
  }
}

export default TrafficGraph;
