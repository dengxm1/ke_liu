import React, { Component } from 'react';
import echarts from 'echarts';
import styles from './graph.less';
import { Card, Spin } from 'antd';
import {
  crowdTripMode,
  trafficDistanceCompare,
  tripTimeHold,
} from '../../services/global';
import color from '../../utils/config';
import utils from "../../utils/utils";
import ChartTitle from "../ChartTitle";

class CrowdGraph extends Component {
  state = {
    tripModeXAxis: [], //通勤方式柱状图x轴
    tripModeCurData: [], //当月人群通勤方式占比
    tripModeLastData: [], //上月人群通勤方式占比
    curData: [], //当月人群通勤距离占比折线图数据
    lastData: [], //上月人群通勤距离占比折线图数据
    curTimeData: [], //当月人群通勤时间占比折线图数据
    lastTimeData: [], //上月人群通勤时间占比折线图数据
    echartDataId: '',  //用于显示echart数据的参数id
    echartOdTfcunitId: '',
    tripModeLoding:false,
    tripTimeLoding:false,
    tripDistanceLoding:false,
    statMonth:this.props.fieldsValue.statMonth,
    trlTypeNo:this.props.fieldsValue.tripMode
  };

  componentDidMount() {
    const {tfcunitId, odTfcunitId}=this.props;
    if (tfcunitId){
      this.setState({
        echartDataId: tfcunitId,
        echartOdTfcunitId:odTfcunitId
      },()=>{
        this.getcrowdTripMode(); //获取人群通勤方式柱状图信息接口
        this.getTrafficDistanceCompare(); //当月和上月人员通勤距离对比
        this.getTripTimeHold(); //通勤时间占比（人群分析）
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log('nextProps',nextProps)
    const isTripMode=nextProps.fieldsValue.tripMode!==this.props.fieldsValue.tripMode;
    const isStatMonth=nextProps.fieldsValue.statMonth!==this.props.fieldsValue.statMonth;
    const isTravalPeriod=nextProps.fieldsValue.travalPeriod!==this.props.fieldsValue.travalPeriod;
    const isAreaType=nextProps.fieldsValue.areaType!==this.props.fieldsValue.areaType;
    const isTfcunitId= nextProps.tfcunitId && nextProps.tfcunitId!==this.props.tfcunitId;
    const isOdTfcunitId=nextProps.odTfcunitId && nextProps.odTfcunitId!==this.props.odTfcunitId;
    if (isTripMode||isStatMonth||isTravalPeriod||isAreaType||isTfcunitId||isOdTfcunitId) {
      this.setState({
        echartDataId: nextProps.tfcunitId,
        echartOdTfcunitId: nextProps.odTfcunitId,
        statMonth:nextProps.fieldsValue.statMonth,
        trlTypeNo:nextProps.fieldsValue.tripMode
      },()=>{
        this.getcrowdTripMode();
        this.getTrafficDistanceCompare();
        this.getTripTimeHold(); //通勤时间占比（车辆分析
      })
    }
  }

  //获取人群通勤方式柱状图信息接口
  getcrowdTripMode = () => {
      const {echartDataId, statMonth, echartOdTfcunitId} = this.state;
    this.setState({
      tripModeLoding: true,
    },()=>{
      crowdTripMode({
        tfcunitId: echartDataId,
        odTfcunitId:echartOdTfcunitId,
        statMonth
      })
          .then(res => {
             this.setState({
               tripModeLoding: false,
             })
            if (res) {
              if (res.code === 200) {
                const cur = res.data.cur;
                const last = res.data.last;
                const tripModeXAxis = [];
                const tripModeCurData = [];
                const tripModeLastData = [];
                cur.forEach(item => {
                  tripModeXAxis.push(item.trlType);
                  tripModeCurData.push(item.cnt);
                });
                last.forEach(item => {
                  tripModeLastData.push(item.cnt);
                });
                this.setState(
                    {
                      tripModeXAxis, //通勤方式柱状图x轴
                      tripModeCurData, //当月人群通勤方式占比
                      tripModeLastData, //上月人群通勤方式占比
                    },
                    () => {
                      this.initTripMode(); //初始化通勤方式柱状图
                    },
                );
              }
            }
          })
          .catch(e => {
            console.log(e);
            this.setState({
              tripModeLoding: false,
            })
          });
    });

  };

  //当月和上月人员通勤距离对比
  getTrafficDistanceCompare = () => {
    const {echartDataId, statMonth, echartOdTfcunitId, trlTypeNo} = this.state;
    this.setState({
      tripDistanceLoding: true
    },()=>{
      trafficDistanceCompare({
        tfcunitId: echartDataId,
        odTfcunitId:echartOdTfcunitId,
        statMonth,
        trlTypeNo
      }).then(res => {
        this.setState({
          tripDistanceLoding: false
        })
        if (res) {
          if (res.code === 200) {
            const series = [];
            const xAxis = ['0-5', '5-10', '10-15', '15-20', '>20'];
            let curData = [0, 0, 0, 0, 0]; //当月人群通勤距离占比
            let lastData = [0, 0, 0, 0, 0]; //上月人群通勤距离占比
            res.data.cur.forEach(item => {
              xAxis.forEach((axis, index) => {
                if (item.avgTrlDistance === axis) {
                  curData[index] = item.cnt;
                }
              });
            });
            res.data.last.forEach(item => {
              xAxis.forEach((axis, index) => {
                if (item.avgTrlDistance === axis) {
                  lastData[index] = item.cnt;
                }
              });
            });
            this.setState(
                {
                  curData,
                  lastData,
                },
                () => {
                  this.initTripDistance();
                },
            );
          }
        }
      });
    })
  };

  //通勤时间占比（人群分析）  0-10 10-20  20-30  30-40 >40
  getTripTimeHold = () => {
    const {echartDataId, statMonth, echartOdTfcunitId, trlTypeNo} = this.state;
    this.setState({
      tripTimeLoding:true
    },()=>{
      tripTimeHold({
        tfcunitId: echartDataId,
        odTfcunitId:echartOdTfcunitId,
        statMonth,
        trlTypeNo
      }).then(res => {
        this.setState({
          tripTimeLoding:false
        })
        if (res) {
          if (res.code === 200) {
            const series = [];
            // const xAxis = ['0-10', '10-20', '20-30', '30-40', '>40'];
            const xAxis = ['0-20', '20-40', '40-60', '60-80', '>80'];
            let curTimeData = [0, 0, 0, 0, 0]; //当月人群通勤时间占比
            let lastTimeData = [0, 0, 0, 0, 0]; //上月人群通勤时间占比
            res.data.cur.forEach(item => {
              xAxis.forEach((axis, index) => {
                if (item.avgTrlTime === axis) {
                  curTimeData[index] = item.cnt;
                }
              });
            });
            res.data.last.forEach(item => {
              xAxis.forEach((axis, index) => {
                if (item.avgTrlTime === axis) {
                  lastTimeData[index] = item.cnt;
                }
              });
            });
            this.setState(
                {
                  curTimeData,
                  lastTimeData,
                },
                () => {
                  this.initTripTime();
                },
            );
          }
        }
      });
    })
  };

  //初始化通勤时间
  initTripTime = () => {
    const { curTimeData, lastTimeData } = this.state;
    const tripTimeEcharts = echarts.init(
      document.getElementById('tripTimeRef'),
    );
    tripTimeEcharts.setOption({
      title: {
        text: '',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        icon: 'rect',
        itemWidth: 8,
        itemHeight: 8,
        selectedMode: false,
        // itemGap: 20,
        right:20,
        textStyle: {
          fontSize: 12,
          color:'rgba(0,0,0,0.45)'
        },
      },
      grid: {
        bottom: '5%',
        left:'5%',
        right:'15%',
        height: '75%',
        width: 'auto',
        containLabel: true,
      },
      toolbox: {
     /*    feature: {
          saveAsImage: {
            name: '人群通勤分析通勤时间占比'
          },
        }, */
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        name:'时长',
  /*      nameTextStyle:{
          color:'rgba(0,0,0,0.45)',
        },*/
        // 0-10 10-20  20-30  30-40 >40
        data: ['0-20', '20-40', '40-60', '60-80', '>80'],
        axisTick: {
          show:false,
          // alignWithLabel: true,
        },
      /*  axisLine: {
          lineStyle: {
            color: color.xAxis_line_color,
          },
        },*/
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
            return utils.transform(value,1);
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: 'rgba(0,0,0,0.10)',
          },
        },
      },
      series: [
        {
          name: '当月',
          type: 'line',
          // stack: '总量',
          data: curTimeData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
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
                offset: 0, color: 'rgba(11,128,239,0.3)' // 0% 处的颜色
              }, {
                offset: 1, color: '#ffffff' // 100% 处的颜色
              }],
              // global: false // 缺省为 false
            },
          }
        },
        {
          name: '上月',
          type: 'line',
          // stack: '总量',
          data: lastTimeData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
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
                offset: 0, color: 'rgba(0,193,222,0.3)' // 0% 处的颜色
              }, {
                offset: 1, color: '#ffffff' // 100% 处的颜色
              }],
              // global: false // 缺省为 false
            },
          }
        },
      ],
    });
  };

  //初始化通勤方式柱状图
  initTripMode = () => {
    const { tripModeXAxis, tripModeCurData, tripModeLastData } = this.state;
    const tripModeRef = echarts.init(document.getElementById('tripModeRef'));
    tripModeRef.setOption({
      grid: {
        bottom: '5%',
        height: '75%',
        left:'5%',
        right:'15%',
        width: 'auto',
        containLabel: true,
      },
      legend: {
        orient: 'horizontal',
        top: 5,
        itemWidth: 8,
        itemHeight: 8,
        right:20,
        selectedMode: false,
        textStyle: {
          fontSize: 12,
          color:'rgba(0,0,0,0.45)'
        },
      },
      tooltip: {},
      toolbox: {
     /*    feature: {
          saveAsImage: {
            name: '人群通勤分析通勤方式占比'
          },
        }, */
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        name:'方式',
        axisTick: {
          show:false,
          alignWithLabel: true,
          interval: 0,
        },
        axisLabel: {
          interval: 0, //横轴信息全部显示
        },
    /*    axisLine: {
          lineStyle: {
            color: color.xAxis_line_color,
          },
        },*/
        data: tripModeXAxis,
      },
      yAxis: {
        axisLine: { show: false }, //y轴
        axisTick: { show: false }, //刻度线
        name: '人次',
        nameTextStyle:{
          color:'rgba(0,0,0,0.45)',
          align:'right',
        },
        axisLabel: {
          formatter: (value, index) => {
            return utils.transform(value,1);
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: 'rgba(0,0,0,0.10)',
            onZero: false, // y轴是否在x轴0刻度上
          },
        },
        type: 'value',
      },
      series: [
        {
          name: '当月',
          type: 'bar',
          color: color.moon_people_type_color,
          barMaxWidth:6,
          itemStyle:{
            barBorderRadius:[10, 10, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: '#1C6BD9'
            }, {
              offset: 1,
              color: 'rgba(28,107,217,0.3)'
            }])
          },
          data: tripModeCurData,
        },
        {
          name: '上月',
          type: 'bar',
          color: color.moon_people_time_color, //moon_people_time_color
          barMaxWidth:6,
          itemStyle:{
            barBorderRadius:[10, 10, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: '#00C1DE'
            }, {
              offset: 1,
              color: 'rgba(0,193,222,0.3)'
            }])
          },
          data: tripModeLastData,
        },
      ],
    });
  };

  //初始化通勤距离占比
  initTripDistance = () => {
    const { curData, lastData } = this.state;
    const tripDistanceRef = echarts.init(
      document.getElementById('tripDistanceRef'),
    );
    tripDistanceRef.setOption({
      title: {
        text: '',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        icon: 'rect',
        itemWidth: 8,
        itemHeight: 8,
        right:20,
        selectedMode: false,
        textStyle: {
          fontSize: 12,
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
     /*    feature: {
          saveAsImage: {
            name: '人群通勤分析通勤距离占比'
          },
        }, */
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        name:'千米',
  /*      nameTextStyle:{
          color:'rgba(0,0,0,0.45)',
        },*/
        data: ['0-5', '5-10', '10-15', '15-20', '>20'],
        axisTick: {
          show:false,
          alignWithLabel: true,
        },
 /*       axisLine: {
          lineStyle: {
            color: color.xAxis_line_color,
          },
        },*/
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
            return utils.transform(value,1);
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: 'rgba(0,0,0,0.10)',
          },
        },
      },
      series: [
        {
          name: '当月',
          type: 'line',
          data: curData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
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
                offset: 0, color: 'rgba(11,128,239,0.3)' // 0% 处的颜色
              }, {
                offset: 1, color: '#ffffff' // 100% 处的颜色
              }],
              // global: false // 缺省为 false
            },

          }
        },
        {
          name: '上月',
          type: 'line',
          data: lastData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
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
                offset: 0, color: 'rgba(0,193,222,0.3)' // 0% 处的颜色
              }, {
                offset: 1, color: '#ffffff' // 100% 处的颜色
              }],
              // global: false // 缺省为 false
            },
          }
        },
      ],
    });
  };

  render() {
    const {tripModeLoding, tripTimeLoding, tripDistanceLoding} = this.state;
    return (
      <div className={styles.crowdContent}>
        <Card
          title={<ChartTitle title='通勤方式占比'/>}
          className={styles.unitCard}
          bordered={false}
        >
          <Spin spinning={tripModeLoding} className={styles.loading_style}>
             <div id="tripModeRef" className={styles.tripTime}></div>
          </Spin>
        </Card>
        <Card
          title={<ChartTitle title='通勤时间占比'/>}
          className={styles.unitCard}
          bordered={false}
        >
          <Spin spinning={tripTimeLoding} className={styles.loading_style}>
          <div id="tripTimeRef" className={styles.tripTime}></div>
          </Spin>
        </Card>
        <Card
          title={<ChartTitle title='通勤距离占比'/>}
          className={styles.unitCard}
          bordered={false}
        >
          <Spin spinning={tripDistanceLoding} className={styles.loading_style}>
          <div id="tripDistanceRef" className={styles.tripTime}></div>
          </Spin>
        </Card>
      </div>
    );
  }
}
export default CrowdGraph;
