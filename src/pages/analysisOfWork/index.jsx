import React, { Component } from 'react';
import styles from './index.less';
import '../../components/LeafletMap/leaflet.curve.arrow';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import {
  workHomeAdvise,
  analysisOdCntFlyLine,
  analysisAvgTrlTimeFlyLine,
  analysisAvgTrlDistanceFlyLine,
  lineDetail,
} from '../../services/global';
import { Map, TileLayer } from 'react-leaflet';
import '../../components/LeafletMap/leaflet-heat';
import { connect } from 'dva';
import Corner from '../../components/Corner';
import ReturnListButton from '../../components/ReturnListButton/index';
import {
  Card,
  Collapse,
  Empty,
  List, message, Pagination, Radio,
  Spin, Tabs, Checkbox,
  Progress, Tooltip,
} from 'antd';
import utils, { areaColorByPeopleNum } from '../../utils/utils';
import JudgeSuggest from '../../components/judgeSuggest';
import up from '../../static/up.png';
import down from '../../static/down.png';
import InfiniteScroll from 'react-infinite-scroller';
import CrowdGraph from '../../components/CrowdGraph/graph';
import TrafficGraph from '../../components/TrafficGraph';
import CardForm from '../../components/carForm';
import moment from 'moment';
import config from '../../utils/config';
import go from '../../static/go.png';
import arrive from '../../static/arrive.png';
import ChartTitle from '../../components/ChartTitle';
import PopModal from '../../components/PopModal';
import filterIcon from '../../static/filter_icon.png';
import FilterComp from '../../components/FiterComp';

const busStationIcon = {
  '#0B80EF': require('../../static/busIcon/#0B80EF.png'),
  '#FFAC00': require('../../static/busIcon/#FFAC00.png'),
  '#00C1DE': require('../../static/busIcon/#00C1DE.png'),
  '#5F9EA0': require('../../static/busIcon/#5F9EA0.png'),
  '#fade64': require('../../static/busIcon/#fade64.png'),
  '#7790ed': require('../../static/busIcon/#7790ed.png'),
  '#80cc3d': require('../../static/busIcon/#80cc3d.png'),
  '#ff667f': require('../../static/busIcon/#ff667f.png'),
  '#8c3ebb': require('../../static/busIcon/#8c3ebb.png'),
  '#A0522D': require('../../static/busIcon/#A0522D.png'),
};
const { Panel } = Collapse;
const { TabPane } = Tabs;
const markerArr = [];
const busStopMarkerArr = [];
const busLineArr = [];
const tipConfig = [
  { number: '20万人以上', color: '#FF0200' },
  { number: '10-20万人', color: '#FFAC00' },
  { number: '5-10万人', color: '#0B80EF' },
  { number: '1-5万人', color: '#00C1DE' },
  { number: '1万人以下', color: '#10E251' },
];

const sortOptions = [
  { label: '按客流强度', value: 1 },
  { label: '按通勤时间', value: 2 },
  { label: '按通勤距离', value: 3 },
];

@connect(({ global, loading }) => {
  return { ...global, mapAreaLoading: loading.effects['global/fetchFlowAnalyze'] };
})
class AnalysisOfWork extends Component {

  map = null;
  relativeContain = null;
  heatMapData = new L.heatLayer([]);  //热力图数组
  areaArcMarkerInstance = []; //两点之间的距离标记
  flyLineData = [];   //飞线数据
  originArea = []; //区域分块数组
  areaMarkerName = [];
  state = {
    areaType: '0103', //区域类型
    travalPeriod: '-1', //工作日非工作日
    selectFlag: false,
    tfcunitIds: [], //选中的区块数组
    mapLoading: false,
    unmount: false,
    createResMapArea: [],
    defaultCenter: config.map_default_center,
    latlngData: [],
    unitType: '',
    isShow: true, //是否显示左边选项卡片
    isShowRight: false, //是否显示右边的卡片
    hiddenSize: '1', //右边卡片隐藏的尺寸 1 -620px 0 -400px
    analyzeResult: [], //分析结果
    activeKey: ['1'], //当前激活的折叠面板
    flowAnalyzeData: [], // 居住地、工作地
    flowAnalyseTypeNo: false, //分析类型 1居住地 2工作地
    flowPageNum: 1, //客流分析的当前页
    flowPageSize: 10, //一页的数据大小
    tripPageNum: 1, //通勤特征的当前页
    tripPageSize: 10, //通勤特征的数据大小
    flowPageTotal: 0, //总页数
    liveDensity: '', //居住地人口密度
    workDensity: '', //工作地人口密度
    flowHasMore: true, //是否加载更多
    regionsBySize: [],  //左边弹窗下拉框选项
    regionsLoading: true,
    analyzeLoading: false, //分析列表loading
    analyzePageNum: 1, //客流分析列表的当前页
    analyzeListSize: 16, //客流分析列表一页的条数
    analyzeListTotalPage: 0,  //客流分析的总页数
    tfcunitId: '',  //分析列表项的tfcunitId
    odTfcunitId: '',
    flowChecked: [false, false],
    liveHeatMap: [],  //居住人口热力图数据
    workHeatMap: [],  //工作人口热力图数据
    showNoneAnalyze: false,  //是否显示缺省页
    flowLoading: true, //客流分析loading是否显示
    checkedList: ['居住地', '工作地'],
    statMonth: moment(moment().subtract(1, 'months')).format('YYYYMM'),
    liveOrWorkType: 'liveAndWork',
    analyzeContainTop: 0,
    isShowSuggest: false,
    suggusetLoding: true,
    showOrHiddenFilter: false,
    timeCursor: { value: 0, position: 0 },
    distanceCursor: { value: 0, position: 0 },
    outCursor: { value: 0, position: 0 },
    inCursor: { value: 0, position: 0 },
    portFlag: 1,
    distance: '',
    peopleNum: '',
  };
  temp = {
    first: true,
  };

  componentDidMount() {
    this.map = this.refs.map.contextValue.map;
    this.labels2 = this.map.createPane('labels2');
    this.map.getPane('labels2').style.zIndex = 700;
    // this.fetchMapArea();
    this.getFlowAnalyze(); //获取客流分析的接口
    let fieldsValue = {
      tripMode: '-1',
      statMonth: moment().subtract(1, 'months').format('YYYYMM'),
      travalPeriod: '-1',
      areaType: '0103',
    };
    this.setState({
      analyzeContainTop: this.relativeContain.clientHeight + 1,
      fieldsValue,
    }, () => {
      this.getTripFeatureAnalyze();//默认开始分析
    });
    // this.fetchMapArea();
    //获取当前放大或者缩小的等级
    // this.map.on('zoomend', e => {
    //   const { areaType, showEchart, chooseItem } = this.state;
    //   if (!showEchart) {
    //     if (areaType !== '0103') {
    //       if (e.target.getZoom() <= 10) {
    //         this.setState({ showOrHiddenPopModal: false });
    //         this.removeAreaArcMarkerInstance(); //移除飞线提示框
    //       } else {
    //         console.log('绘制飞线提示框');
    //         this.getFlyToolTip();
    //       }
    //     } else {
    //       if (e.target.getZoom() <= 10) {
    //         this.setState({ showOrHiddenPopModal: false });
    //         this.removeAreaArcMarkerInstance(); //移除飞线提示框
    //       } else {
    //         this.getFlyToolTip();
    //       }
    //     }
    //   }
    // });
  }

  onRef = (ref) => {
    this.child = ref;
  };
  //获取客流分析接口
  getFlowAnalyze = () => {
    const { flowPageNum, areaType, statMonth } = this.state;
    this.props.dispatch({
      type: 'global/fetchFlowAnalyze',
      payload: {
        pageNum: flowPageNum,
        pageSize: 1500,
        subUnitTypeNo: areaType, //交通区域
        statMonth,
      },
      callback: (data) => {
        this.mapAnimator();
        this.setState({
          flowLoading: false,
        });
        const liveHeatMap = [];
        const workHeatMap = [];
        this.setState({
          flowAnalyzeData: data.records,
          createResMapArea: data.records,
          flowPageTotal: data.pages,
          liveHeatMap,  //居住人口热力图数据
          workHeatMap,  //工作人口热力图数据
        }, () => {
          console.time('渲染时间计时');
          this.renderMapArea(this.state.flowAnalyzeData);
          console.timeEnd('渲染时间计时');
        });
      },
    });
  };

  // 设置动画效果
  mapAnimator = () => {
    if (this.map) {
      this.map.setView(this.state.defaultCenter, 10, {
        pan: { animate: true, duration: 1 },
        zoom: { animate: true },
        animate: true,
      });
    }
  };

  //开始分析
  onFinish = (fieldsValue) => {
    const { tfcunitIds } = this.state;
    let tArr = tfcunitIds.join(',');
    try {
      // if (!tArr) {
      //   message.info('你还没有选中区域哦!');
      //   return;
      // }
      this.mapAnimator();
      this.removeFlyLine();  //清除飞线
      this.removeAreaArcMarkerInstance(); //清除飞线上的icon
      this.setState({
        analyzeContainTop: this.relativeContain.clientHeight + 1,
        analyzeLoading: true,
        isShowRight: false,
        analyzeResult: [],
        analyzeListTotalPage: 0,
        showNoneAnalyze: false,
        tfcunitId: '',
        odTfcunitId: '',
        showEchart: false,
        fieldsValue,
        analyzePageNum: 1,
        hiddenSize: '1',
        showOrHiddenPopModal: false,
      }, () => {
        this.getTripFeatureAnalyze();
      });
    } catch (e) {
      console.log('错误错误', e);
    }
  };

  //获取分析列表结果
  getTripFeatureAnalyze = () => {
    const { analyzePageNum, portFlag, fieldsValue, tfcunitIds } = this.state;
    let tArr = tfcunitIds.join(',');
    let tfcunitId = '';
    let odTfcunitId = '';
    if (fieldsValue.goOrArrive == 'go') {
      tfcunitId = tArr;
    } else {
      odTfcunitId = tArr;
    }
    const connector = portFlag === 1 ? analysisOdCntFlyLine : portFlag === 2 ? analysisAvgTrlTimeFlyLine : analysisAvgTrlDistanceFlyLine;
    connector({
      pageNum: analyzePageNum,
      // pageSize: fieldsValue.areaType === '0103' ? 16 : analyzeListSize,
      pageSize: 10,
      trlTypeNo: fieldsValue.tripMode, //通勤方式 -1全量通勤 1,2公交轨交 3出租网约 4私家车
      statMonth: fieldsValue.statMonth, //时间 格式 YYYYMM
      doeDateType: fieldsValue.travalPeriod, //全维度日期类型 -1:不区分 99：工作日，100：非工作日
      tfcunitId, //出发地ids，组合用,隔开
      odTfcunitId,
      dayPeriodNo: 5,
      // tfcunitIds: '06', //出发地ids，组合用,隔开
      subUnitTypeNo: fieldsValue.areaType,  //0101 交通小区 0102交通中区 0103交通大区
    }).then(res => {
      if (res) {
        this.setState({
          analyzeLoading: false,
        });
        if (res.code === 200) {
          let createAnalysisData = [];
          if (portFlag === 1) {
            createAnalysisData = utils.inOriginDataAddCenterArray(res.data.records, 'centerCoor', 'odCenterCoor', 'odCnt', portFlag); //按客流量排序
          } else if (portFlag === 2) {
            createAnalysisData = utils.inOriginDataAddCenterArray(res.data.records, 'centerCoor', 'odCenterCoor', 'avgTrlTime', portFlag); //按通勤距离排序
          } else {
            createAnalysisData = utils.inOriginDataAddCenterArray(res.data.records, 'centerCoor', 'odCenterCoor', 'avgTrlDistance', portFlag); //按通勤距离排序
          }
          this.setState({
            analyzeResult: createAnalysisData, //客流分析的数据
            analyzePageNum: res.data.current,
            analyzeListTotal: res.data.total,  //总页数
            showNoneAnalyze: !res.data.records.length, //是否显示缺省页
          }, () => {
            //飞线图制作
            this.flyLine();
          });
        }
      }
    }).catch(e => {
      this.setState({
        analyzeLoading: false,
      });
    });
  };


  //大，中，小区选择
  onChangeTrlAreaType = (areaType) => {
    const { flag } = this.state;
    if (flag) return;
    this.setState({
      areaType,
      flowChecked: [false, false],
      flowAnalyseTypeNo: false,
      tfcunitIds: [], //选中的区块数组
      analyzeResult: [],
      isShowRight: false,
      showNoneAnalyze: false,
      tfcunitId: '',
      odTfcunitId: '',
      showEchart: false,
      isShowSuggest: false,
      suggusetLoding: false,
      hiddenSize: '1',
    }, () => {
      this.temp.first = true;
      this.removeAllLayer();
      this.getFlowAnalyze();
      // this.fetchMapArea(areaType);
    });
  };

  //点击箭头显示或隐藏卡片
  arrowClick = value => {
    const { isShow } = this.state;
    this.setState({
      isShow: !isShow,
    });
  };

  //右边的卡片显示与隐藏
  rightArrowClick = () => {
    const { isShowRight } = this.state;
    this.setState({
      isShowRight: !isShowRight,
      hiddenSize: '0',
    });
  };

  //列表选中
  itemChoose = chooseItem => {
    const { analyzeResult, latlngData } = this.state;
    latlngData.forEach(item => {
      if (item.options.zoneId === chooseItem.tfcunitId) {
        item.setStyle({
          fillColor: config.goOutColor,
          fillOpacity: config.map_fillOpacity,
        });
      } else if (item.options.zoneId === chooseItem.odTfcunitId) {
        item.setStyle({
          fillColor: config.arriveColor,
          fillOpacity: config.map_fillOpacity,
        });
      } else {
        item.setStyle({
          fillColor: config.sameColorLike, //基本持平色、默认颜色
          fillOpacity: config.map_fillOpacity,
        });
      }
    });
    analyzeResult.forEach(item => {
      if (chooseItem.odTfcunitName == item.odTfcunitName) {
        item['flag'] = true;
      } else {
        item['flag'] = false;
      }
    });
    this.drawUnitFlyLine(chooseItem); //绘制单条飞线
    this.setState({
      isShowRight: true,
      tfcunitId: chooseItem.tfcunitId,
      odTfcunitId: chooseItem.odTfcunitId,
      chooseItem,
      showEchart: true,
      isShow: false,
      isShowSuggest: false,  //关闭研判建议
      showOrHiddenPopModal: false,
      showOrHiddenFilter: false,
    });
  };

  //通勤分析类型变化
  changeTravelAnalysis = key => {
    // console.log('key', key);
  };

  //折叠面板的打开关闭事件
  collapseChange = key => {
    this.setState({
      activeKey: key,
    });
  };

  //流入流出选择 0居住 1工作人口 2 职住对比
  flowDirection = (index) => {
    const { flowChecked, liveHeatMap, workHeatMap } = this.state;
    const arr = [...flowChecked];
    for (let i = 0; i < arr.length; i++) {
      if (i === index) {
        if (arr[i]) {
          arr[i] = false;
          this.removeHeatAndArea(); //移除居住人口的热力图
        } else {
          arr[i] = true;
          if (index === 0) {
            this.clearHeatMap();
            this.renderHeatMapData(liveHeatMap); //居住人口的热力图
          } else if (index === 1) {
            this.clearHeatMap();
            this.renderHeatMapData(workHeatMap); //工作人口的热力图
          }
        }
      } else {
        arr[i] = false;
      }
    }
    let hasTrue = arr.some(item => item === true);
    this.setState({
      flowChecked: arr,
      flowAnalyseTypeNo: hasTrue,
      flowIndex: index,
    });
  };

  //清空所有
  clearSelectArea = () => {
    const { createResMapArea } = this.state;
    this.setState({
      flowChecked: [false, false],
      flowAnalyseTypeNo: false,
      tfcunitIds: [],
      analyzeResult: [],
      isShowRight: false,
      showEchart: false,
      showNoneAnalyze: false,
      showOrHiddenPopModal: false,
    });
    utils.removeFlyDom(); //解决飞线层级bug问题
    this.removeAllLayer(1);
    this.renderMapArea(createResMapArea);  //重新渲染对比区块
  };

  //选中区域
  selectArea = () => {
    this.setState({
      selectFlag: true,
    });
  };

  //移除距离标记
  removeAreaArcMarkerInstance = () => {
    if (this.areaArcMarkerInstance) {
      this.areaArcMarkerInstance.map(item => {
        item.remove();
      });
      this.areaArcMarkerInstance = [];
    }
  };

  //渲染地图区块
  renderMapArea = (data) => {
    const { areaType } = this.state;
    const latlngData = [];
    data.map(item => {
      let boundPolys = JSON.parse(item.boundPoly).flat();//数组扁平化处理
      boundPolys.forEach(itemArr => {
        itemArr.forEach(item => {
          item.reverse();
        });
      });
      const color = areaColorByPeopleNum(Number(item.curResidenceCnt), Number(item.curWorkCnt), areaType);
      const polygon = L.polygon(boundPolys, {
        color: config.map_LineColor, //描边颜色s
        weight: config.map_weight, //描边线条大小c
        zoneId: item.tfcunitId,
        fillColor: color,
        fillOpacity: config.map_fillOpacity,
        flag: true, //自定义标识
        centerCoor: item.centerCoor,  //中心点坐标
        relationAreaId: item.adjacent,
        boundPolys: boundPolys,  //用作定位到该区域中心点
        useSaveOriginDefaultColor: color,//保存原来的颜色，取消选择以后要恢复颜色
      }).on({
        click: e => {
          let layer = e.target;
          const { selectFlag, tfcunitIds, isShow } = this.state;
          const chooseArr = [...tfcunitIds];
          if (!isShow) {
            return;
          }
          if (!selectFlag) { //没点击图标显示研判建议
            this.setState({
              isShow: false,
              isShowSuggest: true,
              suggusetLoding: true,
              isShowRight: true,
              showEchart: false,
              showOrHiddenFilter: false,
            }, () => {
              this.getWorkHomeAdvise(layer.options.zoneId);
            });
          } else {
            if (chooseArr.length > 0) {
              message.info('只能选择一个区域哦!');
              this.setState({ selectFlag: false });
              return;
            }
            chooseArr.push(layer.options.zoneId);
            this.setState({
              tfcunitIds: chooseArr,
              selectFlag: false,
            }, () => {
              this.child.setChildSelected(this.state.tfcunitIds); //调用子组件的dream方法
              // this.setSelected();
            });
            layer.setStyle({
              fillColor: config.select_From_Color, //填充颜色
              flag: false,
              fromOrTo: 'isFrom',
              fillOpacity: config.select_area_fill_opacity,
              relationAreaId: item.adjacent,
            });
          }
        },
      });
      latlngData.push(polygon);
    });
    this.setState({
      latlngData,
    });
    if (this.originArea.length === 0) {
      this.originArea = new L.layerGroup(latlngData).addTo(this.map).setZIndex(0);
    }
  };

  //获取研判建议接口
  getWorkHomeAdvise = (tfcunitId) => {
    const { travalPeriod, statMonth, areaType } = this.state;
    workHomeAdvise({
      statMonth,
      tfcunitId, //区域id
      tfcunitType: areaType, //大中小区
      doeDate: travalPeriod,  //工作日非工作日
    }).then(res => {
      if (res) {
        this.setState({ suggusetLoding: false });
        if (res.code === 200) {
          if (res.data) {
            let timeCursor = { value: res.data.travelTime.split(',')[0], position: 265, colorKey: 'four' };
            let distanceCursor = { value: res.data.distance.split(',')[0] / 1000, position: 265, colorKey: 'four' };
            let outCursor = { value: res.data.outRatio.split(',')[0], position: 265, colorKey: 'four' };
            let inCursor = { value: res.data.externalRatio.split(',')[0], position: 265, colorKey: 'four' };
            const position = [10, 86, 190];
            const colorKey = ['first', 'second', 'third'];
            //通勤时间
            const data1 = [20, 40, 60];
            for (let i = 0; i < data1.length; i++) {
              if (timeCursor.value < data1[i]) {
                timeCursor = { value: timeCursor.value, position: position[i], colorKey: colorKey[i] };
                break;
              }
            }
            //通勤距离
            const data2 = [10, 20, 30];
            for (let i = 0; i < data2.length; i++) {
              if (distanceCursor.value < data2[i]) {
                distanceCursor = { value: distanceCursor.value, position: position[i], colorKey: colorKey[i] };
                break;
              }
            }
            //外出率
            const data3 = [0.5, 1, 1.5];
            for (let i = 0; i < data3.length; i++) {
              if (outCursor.value < data3[i]) {
                outCursor = { value: outCursor.value, position: position[i], colorKey: colorKey[i] };
                break;
              }
            }
            //外来率
            for (let i = 0; i < data3.length; i++) {
              if (inCursor.value < data3[i]) {
                inCursor = { value: inCursor.value, position: position[i], colorKey: colorKey[i] };
                break;
              }
            }
            this.setState({
              timeCursor,
              distanceCursor,
              outCursor,
              inCursor,
            });
          }
        }
      }
    }).catch(e => {
      console.log(e);
    });
  };

  //选择框选择地图
  renderMapNew = (tfcunitId) => {
    const { latlngData } = this.state;
    const chooseArr = [];
    latlngData.forEach(item => {
      item.setStyle({
        fillColor: item.options.useSaveOriginDefaultColor, //填充颜色
        dashArray: '0',
        flag: false,
        fromOrTo: 'isFrom',
        fillOpacity: config.map_fillOpacity,
      });
    });
    latlngData.some(item2 => {
      if (item2.options.zoneId === tfcunitId) {
        item2.setStyle({
          fillColor: config.select_From_Color, //填充颜色
          dashArray: '0',
          flag: false,
          fromOrTo: 'isFrom',
          fillOpacity: config.select_area_fill_opacity,
        });
        chooseArr.push(item2.options.zoneId);
        this.map.fitBounds(L.polygon(item2.options.boundPolys).getBounds(), {
          paddingTopLeft: [60, 200],
          paddingBottomRight: [0, 100],
          pan: { animate: true, duration: 1.1 },
        });
        this.setState({
          tfcunitIds: chooseArr,
          latlngData,
        }, () => {
          this.child.setChildSelected(this.state.tfcunitIds); //调用子组件的dream方法
          // this.setSelected();
        });
      }
    });
  };

  setSelected = () => {
    const { createResMapArea, tfcunitIds } = this.state;
    /*    createResMapArea.forEach(item => {
          tfcunitIds.forEach(item2 => {
            if (item.tfcunitId === item2) {
              item.disabled = true;
            }
          });
        });*/
    this.child.setChildSelected(tfcunitIds); //调用子组件的dream方法
    this.setState({
      createResMapArea,
    });
  };

  //渲染热力图renderHeatMapData
  renderHeatMapData = (heatMap) => {
    const { areaType } = this.state;
    if (this.map) {
      this.heatMapData = L.heatLayer(heatMap, {
        // radius: 80,
        // blur: 17,
        radius: areaType === '0103' ? 40 : areaType === '0102' ? 19 : 12, blur: 17,
        max: areaType === '0103' ? 1000 : areaType === '0102' ? 1500 : 100,
        minOpacity: 0.4,
      }).addTo(this.map);
    }
  };

  //渲染对比区块
  setAreaName = () => {
    const { latlngData, flowAnalyzeData } = this.state;
    // this.setState({ compareArea: data });
    latlngData.forEach(item => {
      flowAnalyzeData.forEach(item2 => {
        if (item.options.zoneId === item2.tfcunitId) {
          item.setStyle({
            fillColor: item2.fillColor, //填充颜色 item2.fillColor
            fillOpacity: config.map_fillOpacity,
            flag: true,
            // fillOpacity:0.5
          });
        }
      });
    });
    this.setState({
      latlngData,
      isClearFlag: false,
    }, () => {
      if (this.map) {
        this.originArea = new L.layerGroup(this.state.latlngData).addTo(this.map);
      }
    });
  };

  //渲染区块名称
  setAreaName = createResMapArea => {
    const curZoom = this.map.getZoom();
    const { areaType } = this.state;
    let isShowMarket = (areaType === '0103' && curZoom >= 10) || (areaType !== '0103' && curZoom > 14);
    if (this.areaMarkerName.length === 0) {
      if (isShowMarket) {
        this.areaMarkerName = utils.renderMapAreaName(createResMapArea, this.map, areaType);
      }
    }
  };

  //移除热力图
  clearHeatMap = () => {
    if (this.heatMapData) {
      this.map.removeLayer(this.heatMapData); //移除热力图数据
    }
  };

  //移除区域和热力图
  removeHeatAndArea = () => {
    this.clearHeatMap();
  };

  //清空所有标记
  removeAllLayer = (type = '') => {
    this.removeAreaArcMarkerInstance(); //移除距离
    this.removeFlyLine();
    this.clearHeatMap();
    if (this.originArea) { //移除区块数据
      this.map.removeLayer(this.originArea);
      this.originArea = [];
      this.setState({
        latlngData: [],
      });
    }
    if (!type) {
      if (this.areaMarkerName) { //移除标记名称
        this.areaMarkerName.map(item => {
          item.remove();
        });
        this.areaMarkerName = [];
      }
    }
  };

  //清除飞线
  removeFlyLine = () => {
    const { tfcunitIds } = this.state;
    if (tfcunitIds.length > 0) {
      if (this.flyLineData.length > 0) {
        this.flyLineData = [];
      }
    }
    utils.removeFlyDom(); //解决飞线层级bug问题
    if (this.ODFlyLine) { //清空飞线数据
      this.ODFlyLine.setData();
      this.flyLineData = [];   //飞线数据
    }
  };

  componentWillUnmount() {
    this.setState({
      unmount: true,
    });
    this.setState = () => false;
    this.removeAllLayer();
    this.map = null;
  }

  //绘制飞线上的提示框
  getFlyToolTip = () => {
    const { analyzeResult } = this.state;
    this.removeAreaArcMarkerInstance(); //移除飞线提示框
    analyzeResult.forEach((item, index) => {
      this.areaArcMarkerInstance.push(this.renderFlyTip(item, item));
    });
  };

  //飞线图制作
  flyLine = () => {
    const { analyzeResult } = this.state;
    analyzeResult.forEach((item, index, self) => {
      this.flyLineData.push({
        from: item.addCenterCoor,
        to: item.addOdCenterCoor,
        color: utils.flyColorByNumber(item.odCnt, item.maxCnt),
      });
      // this.areaArcMarkerInstance.push(this.renderFlyTip(item, item));
    });
    utils.removeFlyDom();
    if (this.map) {
      this.ODFlyLine = new L.migrationLayer({
        map: this.map,
        data: this.flyLineData,
        pulseRadius: 20, // 圆的大小
        pulseBorderWidth: 2, // 圆边粗细
        arcWidth: 1, // 曲线粗细
        arcLabel: false, // 是否显示label
        arcLabelFont: '10px sans-serif',
      });
      this.ODFlyLine.addTo(this.map);
    }
  };

  //飞线上的提示框
  renderFlyTip = (from, to) => {
    const { statMonth, portFlag } = this.state;
    const position = utils.arcCenter(from.addCenterCoor, to.addOdCenterCoor, this.map);
    let distance = utils.getDistance(from.addCenterCoor, to.addOdCenterCoor);   //获得两地直线距离
    let arcIcon = L.divIcon({
      className: `${styles.distance_marker}`,
      html: `<p style="color: ${utils.flyColorByNumber(to.odCnt, from.maxCnt)}">${to.addSortVariableText}</p>`,
      // html: `<p >${to.addSortVariableText}</p>`,
    });
    let arcMarker = L.marker(position, {
      icon: arcIcon,
      saveItemMarketInfo: { tfcunitId: from.tfcunitId, odTfcunitId: from.odTfcunitId, statMonth: statMonth },
      position,
    }).on({
      click: (e) => {
        // this.clickTipOrListItem(item)
        this.setState({
          showOrHiddenPopModal: false,
        });
      },
      mouseover: (e) => {
        const saveItemMarketInfo = e.target.options.saveItemMarketInfo;
        this.setState({
          popLoading: true,
          showOrHiddenPopModal: !!position,
          popPosition: [position.lat, position.lng],
        });
        lineDetail(saveItemMarketInfo).then(res => {
          if (res.code === 200) {
            this.setState({
              popData: res.data,
              fromName: from.tfcunitName,
              arriveName: to.odTfcunitName,
              popLoading: false,
              distance,
              peopleNum: from.odCnt,
            });
          }
        });
      },
      mouseout: (e) => {
        this.setState({
          popLoading: false,
          // showOrHiddenPopModal: false,
        });
      },
    });
    return arcMarker.addTo(this.map);
  };

  //点击单条飞线时调用的函数
  clickTipOrListItem = (from, to) => {
    this.setState({
      isShowRight: true,
      tfcunitId: from.tfcunitId,
      odTfcunitId: to.odTfcunitId,
      showEchart: true,
      isShow: false,
    });
    this.drawUnitFlyLine(from); //绘制单条飞线
  };

  //绘制单条飞线
  drawUnitFlyLine = (unitLine) => {
    if (this.ODFlyLine) { //清空飞线数据
      this.ODFlyLine.setData();
      this.flyLineData = [];   //飞线数据
    }
    this.removeAreaArcMarkerInstance(); //移除距离
    const position = utils.arcCenter(unitLine.addCenterCoor, unitLine.addOdCenterCoor, this.map); //获得飞线弧形中心点
    //设置动画效果
    const data1 = [...unitLine.addCenterCoor];
    const data2 = [...unitLine.addOdCenterCoor];
    const lnglats = [data1.reverse(), data2.reverse()];
    this.map.fitBounds(lnglats, {
      paddingTopLeft: [150, 150],
      paddingBottomRight: [450, 150],
    });
    this.flyLineData.push({
      from: unitLine.addCenterCoor,
      to: unitLine.addOdCenterCoor,
      color: utils.flyColorByNumber(unitLine.odCnt, unitLine.maxCnt),
    });
    this.areaArcMarkerInstance.push(this.renderFlyTip(unitLine, unitLine));
    utils.removeFlyDom();
    if (this.map) {
      this.ODFlyLine = new L.migrationLayer({
        map: this.map,
        data: this.flyLineData,
        pulseRadius: 20, // 圆的大小
        pulseBorderWidth: 2, // 圆边粗细
        arcWidth: 1, // 曲线粗细
        arcLabel: false, // 是否显示label
        arcLabelFont: '10px sans-serif',
      });
      this.ODFlyLine.addTo(this.map);
    }
  };

  //绘制公交路线数据
  drawBusLine = () => {
    this.props.dispatch({
      type: 'global/getBusLine',
      callback: (busLine) => {
        let labels = this.map.createPane('labels');
        this.map.getPane('labels').style.zIndex = 650;
        for (let item of busLine) {
          let polyline = L.polyline(item.latlngArr, {
            color: item.color,
            weight: 3,
            opacity: 1,
            pane: labels,
          }).addTo(this.map);
          busLineArr.push(polyline);
          this.map.fitBounds(polyline.getBounds());
          const _this = this;
          polyline.on('mouseover', function(e) {
            this.setStyle({ weight: 6 });
          });
          polyline.on('click', function(e) {
            _this.drawBusStop(item);
          });
          polyline.on('mouseout', function() {
            this.setStyle({ weight: 3 });
          });
          this.drawBusStartEnd(item, 'start');
          this.drawBusStartEnd(item, 'end');
        }
      },
    });
  };

  // 绘制公交的起点和终点
  drawBusStartEnd = (data, type) => {
    const latlng =
      type === 'start'
        ? data.latlngArr[0]
        : data.latlngArr[data.latlngArr.length - 1];
    const html = `<div class="BusStartEnd" style="background:${data.color};text-align:center;line-height: 18px;font-size: 12px; color: #fff;">${data.routeId}</div>`;
    let startOrEndStop = this.drawDivIcon(latlng, html, [42, 18], 5);
    let _this = this;
    startOrEndStop.on('click', function(e) {
      _this.drawBusStop(data);
    });
  };

  //绘制公交站点
  drawBusStop = (data) => {
    for (let item of busStopMarkerArr) {
      item.remove();
    }
    for (let item of data.stopMsgItems) {
      item.routeId = data.routeId;
      item.isUpDown = data.isUpDown;
      busStopMarkerArr.push(
        this.drawStation(item, busStationIcon[data.color]),
      ); // 绘制站点
    }
  };

  // 绘制站点
  drawStation = (data, iconSrc) => {
    const html = `<img class="stationIcon" src="${iconSrc}"/>`;
    let stationMarker = this.drawDivIcon(
      [data.lat, data.lng],
      html,
      [17, 21],
      5,
      [8.5, 21],
    );
    return stationMarker;
  };

  // 底层marker
  drawDivIcon = (latlng, html, size, zIndex = 1, iconAnchor = null) => {
    let marker = L.marker(latlng, {
      icon: L.divIcon({
        html: html,
        className: '',
        iconSize: size,
        iconAnchor: iconAnchor ? iconAnchor : [size[0] / 2, size[1] / 2],
      }),
      opacity: 1,
      zIndexOffset: zIndex,
      riseOnHover: true,
      pane: this.labels2,
    }).addTo(this.map);
    markerArr.push(marker);
    return marker;
  };


  //清空公交路线
  clearBusLine = () => {
    for (let item of markerArr) {
      item.remove();
    }
    for (let item of busLineArr) {
      item.remove();
    }
  };

  //设置日期
  setStatMonth = (statMonth) => {
    this.setState({
      statMonth,
      flowChecked: [false, false],
      flowAnalyseTypeNo: false,
      tfcunitIds: [], //选中的区块数组
      analyzeResult: [],
      isShowRight: false,
      showNoneAnalyze: false,
      tfcunitId: '',
      odTfcunitId: '',
      showEchart: false,
      isClearFlag: true,
      isShowSuggest: false,
      suggusetLoding: false,
      hiddenSize: '1',
    }, () => {
      this.temp.first = true;
      this.removeAreaArcMarkerInstance(); //移除距离
      this.removeAllLayer(1);
      this.clearBusLine();
      this.getFlowAnalyze();
    });

  };

  //切换分析列表
  onChangePage = (page) => {
    this.setState({
      analyzePageNum: page,
      analyzeLoading: true,
    }, () => {
      this.removeFlyLine();
      this.removeAreaArcMarkerInstance(); //移除距离
      this.getTripFeatureAnalyze();
    });
  };


  /**
   * 用作切换图层时候，清空部分效果
   * */
  whenChangeAreaTypeClear = () => {
    const { createResMapArea } = this.state;
    if (this.originArea) { //移除区块数据
      this.map.removeLayer(this.originArea);
      this.originArea = [];
    }
    this.setState({
      flowChecked: [false, false],
      flowAnalyseTypeNo: false,
      showNoneAnalyze: false,
      isClearFlag: true,
    });
    if (this.flyLineData.length === 0) {  //没有飞线效果时候清空选项框的值、
      this.child.formRef.current.resetFields(['exitOption']);
      this.setState({
        tfcunitIds: [],
        analyzeResult: [],
      });
    }
  };

  setLiveOrWorkTypeDefault = () => {
    this.setState({
      liveOrWorkType: 'liveAndWork',
    });
  };

  /**
   * 生成右下角卡片对着信息
   * */
  renderToolTag = (lineToolTipInfo, lineToolTipColor) => {
    return lineToolTipColor.map((item, index) => {
      return <p key={item}>
        <span style={{ background: item, height: 2, width: 13, position: 'relative', bottom: 3 }}/>
        {lineToolTipInfo[index]}
      </p>;
    });
  };

  showFilterComp = () => {
    this.setState({
      showOrHiddenFilter: !this.state.showOrHiddenFilter,
    });
  };
  //列表排序方式选择
  onSortChange = (e) => {
    const port = e.target.value;
    this.removeAreaArcMarkerInstance(); //移除距离
    this.removeFlyLine();
    this.setState({
      analyzeLoading: true,
      isShowRight: false,
      analyzeResult: [],
      analyzeListTotalPage: 0,
      showNoneAnalyze: false,
      showEchart: false,
      analyzePageNum: 1,
      hiddenSize: '1',
      showOrHiddenPopModal: false,
      showOrHiddenFilter: false,
      portFlag: port,
    }, () => {
      this.getTripFeatureAnalyze();  //按客流量排行
    });
  };

  //关闭pup弹窗
  closePopupClick = () => {
    this.setState({
      showOrHiddenPopModal: false,
    });
  };

  //显示左侧弹窗
  closeLeftCard = () => {
    const { analyzeResult, latlngData, tfcunitIds } = this.state;
    latlngData.forEach(item => {
      if (item.options.zoneId === tfcunitIds[0]) {
        item.setStyle({
          fillColor: config.goOutColor,
          fillOpacity: config.select_area_fill_opacity,
        });
      } else {
        item.setStyle({
          fillColor: item.options.useSaveOriginDefaultColor, //恢复原来的对比颜色
        });
      }
    });
    analyzeResult.forEach(item => {
      item['flag'] = false;
    });
    this.setState({
      isShow: !this.state.isShow,
      analyzeResult,
      isShowRight: false,
      hiddenSize: '1',
      tfcunitId: '',
      odTfcunitId: '',
      showEchart: false,
      showOrHiddenPopModal: false,
    });
    //清空单条飞线
    if (this.ODFlyLine) { //清空飞线数据
      this.ODFlyLine.setData();
      this.flyLineData = [];   //飞线数据
    }
    this.removeAreaArcMarkerInstance(); //移除距离
    this.mapAnimator();
    //恢复全部飞线
    this.flyLine();
  };

  setTravalPeriod = (travalPeriod) => {
    this.setState({
      travalPeriod,
    });
  };


  render() {
    const { mapThemeUrlObj, mapAreaLoading, lineToolTipInfo, lineToolTipColor } = this.props;
    const {
      isShow,
      analyzeResult,
      isShowRight,
      flowAnalyseTypeNo,
      hiddenSize,
      flowAnalyzeData,
      activeKey,
      analyzeListSize, areaType,
      tfcunitId, showOrHiddenFilter,
      analyzeLoading,
      showNoneAnalyze,
      flowLoading,
      showEchart,
      fieldsValue,
      analyzePageNum,
      analyzeListTotal,
      regionsBySize, defaultCenter, liveOrWorkType,
      unitType,
      analyzeContainTop,
      showOrHiddenPopModal,
      popPosition,
      fromName,
      arriveName,
      popData,
      portFlag,
      popLoading,
      distance,
      peopleNum,
      unit,
      unitTip,
      isShowSuggest,
      odTfcunitId,
      suggusetLoding,
      timeCursor,
      distanceCursor,
      outCursor,
      inCursor,
      trlTypeNo,
    } = this.state;
    const popInfo = { ...popData };
    return (
      <div className={styles.wrap_index}>
        {/*spinning={mapAreaLoading}*/}
        {/*折叠面板*/}
        <div
          className={
            flowAnalyseTypeNo
              ? styles.collapse
              : styles.hiddenCollapse
          }
        >
          <Collapse activeKey={activeKey} onChange={this.collapseChange}>
            <Panel
              key="1"
              showArrow={false}
              header={<ChartTitle title='客流分析结果'/>}
            >
              <List
                loading={flowLoading}
                dataSource={flowAnalyzeData}
                renderItem={(item, index) => (
                  <List.Item className={styles.pItem}>
                    <List.Item.Meta
                      avatar={
                        <div className={styles.pItemIndex}>
                          {index + 1}
                        </div>
                      }
                      title={<div className={styles.flowTitle}>
                        <span className={styles.tfcunit_name}>{item.tfcunitName}</span>
                        {liveOrWorkType === 'live' ?
                          <div className={styles.growth_tip}>
                            {item.liveArrow === 'up' ? <img src={up} alt=""/> : <img src={down} alt=""/>}
                            <span className={styles.growth}>{item.liveGrowth}</span>
                          </div> : liveOrWorkType === 'work' ?
                            <div>
                              {item.workArrow === 'up' ? <img src={up} alt=""/> : <img src={down} alt=""/>}
                              <span className={styles.growth}>{item.workGrowth}</span>
                            </div> : ''}
                      </div>}
                      description={
                        <div>
                          {liveOrWorkType === 'live' ?
                            <div className={styles.description}>
                              <div className={styles.peopleAmount} title={item.curResidenceCnt || 0}>
                                {`居住人口:${item.curResidenceCnt || 0}`}
                              </div>
                              <div className={styles.peopleDensity} title={item.liveDensity}>
                                人口密度: {item.liveDensity}
                              </div>
                            </div> : liveOrWorkType === 'work' ?
                              <div className={styles.description}>
                                <div className={styles.peopleAmount} title={item.curWorkCnt || 0}>
                                  {`工作人口：${item.curWorkCnt || 0}`}
                                </div>
                                <div className={styles.peopleDensity} title={item.workDensity}>
                                  人口密度:{item.workDensity}
                                </div>
                              </div> : ''
                          }
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Panel>
          </Collapse>
        </div>
        {/*spinning={(mapAreaLoading || flowLoading || analyzeLoading)}*/}
        <Spin size="large" spinning={(mapAreaLoading || flowLoading)}>
          <Map
            ref="map"
            zoomControl={false}
            className={styles.map_style}
            center={defaultCenter}
            minZoom={6}
            maxZoom={18}
            zoom={9}
          >
            <TileLayer url={mapThemeUrlObj.mapImg} subdomains={[]}/>
            <TileLayer url={mapThemeUrlObj.mapPoi} subdomains={[]}/>
            <PopModal visible={showOrHiddenPopModal}
                      position={popPosition}
                      popInfo={popInfo}
                      closePopup={this.closePopupClick}
                      popLoading={popLoading}
                      distance={distance}
                      peopleNum={peopleNum}
                      fromName={fromName}
                      arriveName={arriveName}
            />
          </Map>
          {/*左边的卡片 isShow*/}
          <div className={`${isShow ? styles.optionContain : styles.hiddenContain}`}>
            {/*居住地 工作地单选按钮*/}
            {/*          <div className={styles.flexibleContain}>
              <div className={styles.iconContain} onClick={this.arrowClick}>
                {isShow ? <LeftOutlined/> : <RightOutlined/>}
              </div>
              <div className={styles.addressRadio}>
                <Radio.Group onChange={this.onChangeLiveWorkDiffrance} value={liveOrWorkType}>
                  <Radio value={'live'}>居住地</Radio>
                  <Radio value={'work'}>工作地</Radio>
                  <Radio value={'liveAndWork'}>职住对比</Radio>
                </Radio.Group>
              </div>
            </div>*/}
            {!isShow ?
              <ReturnListButton onClick={this.closeLeftCard} constructStyle={{ top: '64px', marginLeft: 20 }}/> : null}
            <Corner classNL='relativeContainBgL'/>
            <div className={styles.leftContain}>
              {/*选项卡片*/}
              <div className={styles.relativeContain} ref={(ref) => {
                this.relativeContain = ref;
              }}>
                {/*表单*/}
                <CardForm
                  onFinish={this.onFinish}
                  onChangeTrlAreaType={this.onChangeTrlAreaType}
                  onRenderMapNew={this.renderMapNew}
                  onclearSelectArea={this.clearSelectArea}
                  onSelectArea={this.selectArea}
                  chooseAreaArry={this.state.tfcunitIds}  //已经选择的id数组，用来判断清空按钮置灰
                  selectOptionArea={this.state.createResMapArea}  //区块信息，用来做select组件下拉框的数值
                  onSetStatMonth={this.setStatMonth}
                  regionsBySize={regionsBySize}
                  onRef={this.onRef}
                  mapResetView={this.mapAnimator}
                  flyData={this.flyLineData}
                  onSetTravalPeriod={this.setTravalPeriod}
                  analyzeResult={analyzeResult}
                />
              </div>
              {/*分析列表*/}
              <div
                className={styles.analyzeContain2} style={{ top: analyzeContainTop }}>
                {/*==============旧 analyzeLoading ==================*/}
                <Spin size="large" spinning={analyzeLoading}>
                  {analyzeResult.length ? (
                    <div className={styles.listContent}>
                      <div className={styles.listSort}>
                        <div onClick={this.showFilterComp} className={styles.sort_button}>
                          <img src={filterIcon} alt="筛选"/>筛选
                        </div>
                      </div>
                      <FilterComp className={styles.filter_style}
                                  data={sortOptions}
                                  visible={showOrHiddenFilter}
                                  value={portFlag}
                                  style={{ backgroundSize: '143px 134px' }}
                                  onChangeRadio={this.onSortChange}/>
                      {/*                      <div className={styles.listSort}>
                        <Radio.Group options={sortOptions} defaultValue={portFlag} onChange={this.onSortChange}/>
                      </div>*/}
                      <div className={styles.list_wrap}>
                        <List
                          // loading={analyzeLoading}
                          dataSource={analyzeResult}
                          renderItem={(item, index) => (
                            <List.Item
                              // className={item['flag'] ? styles.showBar : styles.listItem}
                              className={styles.listItem}
                              onClick={() => this.itemChoose(item)}
                            >
                              <List.Item.Meta
                                avatar={<div className={styles.itemIndex}>{index + 1}</div>}
                                // title={<div className={styles.list_name} title={item.tfcunitName}>{item.tfcunitName}</div>}
                                title={
                                  <div className={styles.list_title_content}>
                                    <div className={styles.list_name} title={item.tfcunitName}>{item.tfcunitName}</div>
                                    <span className={styles.arrow}>&gt;</span>
                                    <div className={styles.list_name}
                                         title={item.odTfcunitName}>{item.odTfcunitName}</div>
                                  </div>
                                }
                                description={portFlag === 1 ? `通勤客流量：${item.addSortVariableText}` : portFlag === 2 ? `通勤时间：${item.addSortVariableText}` : `通勤距离${item.addSortVariableText}`}
                              />
                            </List.Item>
                          )}
                        />
                      </div>
                    </div>
                  ) : <div>
                    {showNoneAnalyze && (
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                    )}
                  </div>
                  }
                </Spin>
              </div>
              {
                analyzeResult.length ?
                  <div className={styles.wrap_page}>
                    <Pagination
                      current={analyzePageNum}
                      pageSize={10}
                      onChange={this.onChangePage}
                      total={analyzeListTotal}
                      showLessItems={true}
                      showSizeChanger={false}
                      size='small'
                    />
                  </div> : ''
              }
            </div>
          </div>
          {/*右下角的图标*/}
          <Card className={`${styles.tool_card} `} style={{ right: isShowRight ? 350 : 15, transition: 0.4 }}>
            {/*   <div className={styles.item_line_content}>
              {tipConfig.map(({ number, color }) => {
                return (<p key={color}>
                  <span style={{ background: color }}/>
                  {number}
                </p>);
              })}
            </div>*/}
            <div className={styles.item_line_point}>
              <div className={styles.colorTip}>
                <div className={styles.unitline}>
                  <div className={styles.liveColor} style={{ background: config.goOutColor }}/>
                  <div className={styles.tipWord}>居住居多</div>
                </div>
                <div className={styles.unitline}>
                  <div className={styles.workColor} style={{ background: config.arriveColor }}/>
                  <div className={styles.tipWord}>工作居多</div>
                </div>
                <div className={styles.unitline}>
                  <div className={styles.holdLine} style={{ background: config.sameColorLike }}/>
                  <div className={styles.tipWord}>基本持平</div>
                </div>
              </div>
              <p
                className={styles.peopleTip}>{liveOrWorkType === 'live' ? '居住人口' : liveOrWorkType === 'work' ? '工作人口' : null}</p>
              {this.renderToolTag(lineToolTipInfo, lineToolTipColor)}
            </div>
          </Card>
          {/*  右边的卡片---人群通勤分析和交通通勤分析 isShowRight showEchart*/}
          <div
            className={
              isShowRight
                ? styles.rightCard
                : hiddenSize === '0'
                ? styles.hiddenRelativeContain
                : styles.hiddenRightCard
            }
          >
            <Corner classNR='relativeContainBgR'/>
            <div className={styles.rightRelativeContain}>
              {/*居住地 工作地单选按钮*/}
              <div className={styles.rightflexibleContain}>
                <div
                  className={styles.iconContain}
                  onClick={this.rightArrowClick}
                >
                  {isShowRight ? <RightOutlined/> : <LeftOutlined/>}
                </div>
              </div>
              {isShowSuggest && (
                <Tabs
                  centered
                  className={`${styles.analyzeTab2}  ${styles.suggestTab}`}
                  defaultActiveKey="0"
                  onChange={this.changeTravelAnalysis}
                  type="card"
                >
                  <TabPane
                    className={styles.judgeSuggest}
                    tab="研判建议"
                    key="0"
                  >
                    <Spin spinning={suggusetLoding} className={styles.suggest_loading}>
                      <JudgeSuggest
                        timeCursor={timeCursor}
                        distanceCursor={distanceCursor}
                        outCursor={outCursor}
                        inCursor={inCursor}
                      />
                    </Spin>
                  </TabPane>
                </Tabs>
              )}
              {
                showEchart && (
                  <Tabs
                    centered
                    className={styles.analyzeTab2}
                    defaultActiveKey="1"
                    onChange={this.changeTravelAnalysis}
                    type="card"
                  >
                    <TabPane tab="人群通勤分析" key="1">
                      <CrowdGraph
                        odTfcunitId={odTfcunitId}
                        tfcunitId={tfcunitId}
                        fieldsValue={fieldsValue}
                      />
                    </TabPane>
                    <TabPane tab="交通通勤分析" key="2">
                      <TrafficGraph
                        odTfcunitId={odTfcunitId}
                        tfcunitId={tfcunitId}
                        fieldsValue={fieldsValue}
                      />
                    </TabPane>
                  </Tabs>
                )
              }
            </div>
          </div>
        </Spin>
      </div>
    );
  }
}

export default AnalysisOfWork;
