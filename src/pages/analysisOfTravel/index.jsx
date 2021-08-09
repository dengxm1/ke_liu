import React, { Component } from 'react';
import styles from './index.less';
import { api } from '../../utils/url';
import {
  Form,
  Pagination,
  Button,
  Tooltip,
  Card,
  Radio,
  DatePicker,
  Row,
  Col,
  message,
  List,
  Spin,
  Select, Tabs,
} from 'antd';
import { CloseCircleFilled, LeftOutlined, RightOutlined } from '@ant-design/icons';
import utils from '../../utils/utils';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import '../../components/LeafletMap/leaflet.curve.arrow';
import Corner from '../../components/Corner';
import PeopleGoAnalysis from './peopleGoAnalysis/index';
import ReturnListButton from '../../components/ReturnListButton/index';
import PopModal from '../../components/PopModal/index';
// import TrlSuggestCard from './TrlSuggest/index';
import FilterComp from '../../components/FiterComp/index';
import {
  getTrlType,
  analysisTrl, getIsAdjacent,
  getTrlNeedTime, trlTimePercent,
  getRegionsCnt,
  getLineDetail, analysisFlyLine, areaAnalysis, fetchSuggest, roadAnalysis,
} from '../../services/travelFetch';
import { connect } from 'dva';
import from from '../../static/出发icon.png';
import to from '../../static/到达icon.png';
import flow from '../../static/客流量icon.png';
import filterIcon from '../../static/filter_icon.png';
import exchangeIcon from '../../static/exchange.png';
import moment from 'moment';
import 'moment/locale/zh-cn';
import config from '../../utils/config';

moment.locale('zh-cn');
const { Option } = Select;
const { TabPane } = Tabs;
const TrlSuggestCardLazy = React.lazy(() => Promise.resolve(import('./TrlSuggest/index')));


const optionsAreaType = [
  { label: '交通大区', value: '0103' },
  { label: '交通中区', value: '0102' },
  { label: '交通小区', value: '0101' },
];
const optionsTripMode = [   //出行方式 -1全量出行 1公交 2轨交 3出租网约 4私家车
  { label: '全量出行', value: '-1' },
  { label: '公交出行', value: '1' },
  { label: '轨交出行', value: '2' },
  { label: '巡游车', value: '3' },
  { label: '网约车', value: '4' },
];
const optionsTravalPeriod = [
  { label: '全部', value: -1 },
  { label: '工作日', value: 99 },
  { label: '非工作日', value: 100 },
];
const optionsTravalTime = [   //时间段：1:早高峰 2：日间平峰 3：晚高峰 4：晚间平峰 5全天
  { label: '全天', value: 5 },
  { label: '早高峰', value: 1 },
  { label: '晚高峰', value: 3 },
];

const tipConfig = [
  { number: '20万人以上', color: '#FF0200' },
  { number: '10-20万人', color: '#FFAC00' },
  { number: '5-10万人', color: '#0B80EF' },
  { number: '1-5万人', color: '#00C1DE' },
  { number: '1万人以下', color: '#10E251' },
];

const setMonth = moment(moment().subtract(1, 'months')).format('YYYYMM');

@connect(({ global, loading }) => {
  return { ...global, mapAreaLoading: loading.effects['global/fetchMapArea'] };
})

class Index extends Component {
  formRef = React.createRef();
  map = null; //地图
  originArea = null; //区域分块数组
  areaMarkerName = []; //区域名称数组
  areaArcMarkerInstance = []; //两点之间的距离标记
  flyLineData = [];   //飞线数据
  ODFlyLine = null; //飞线
  useFitBounds = [];
  state = {
    showNoneAnalyze: false,
    clickLoading: false,
    closeLeftCard: false,
    closeRightCard: false,
    selectItem: null,
    defaultCenter: config.map_default_center,  //地图默认中心位置
    trlTypeData: {},
    trlNeedTimeData: {},
    trlTimePercentData: {},
    mothData: [],
    mothXdata: [],
    dayData: [],
    dataXdata: [],
    flowDataBar: {},
    flowDataLine: {},
    analyzeResult: [],
    saveAnalysisData: null,
    memoryCurrentValue: null,
    selectFromArea: [],
    selectToArea: [],
    isGroup: false,
    curSelectFromOrToValue: '',
    pageSize: 1500,
    subUnitTypeNo: '0103', //0101 交通小区 0102交通中区 0103交通大区
    analysisPageNum: 1,
    analysisPageSizeIsFlyLine: 10,
    analysisPageSizeArea: 1500,
    flyLoading: false,
    listLoading: false,
    mapAreaLoading: false,
    trlTimePercentLoading: false,
    trlNeedTimeLoading: false,
    trlTypeLoading: false,
    unmount: false,
    odType: 'isOD',
    odDescValue: 1,
    selectFromOptionValue: null,
    selectArriveOptionValue: null,
    selectOptions: [],
    popData: {},
    popPosition: null,
    saveMonthStr: setMonth,
    showOrHiddenPopModal: false,
    popLoading: false,
    fromName: '',
    arriveName: '',
    useOnlyId: '',
    isCombination: 0,
    dayPeriodNo: 5,
    trlTypeNos: '-1',
    doeDateType: -1,
    suggestData: null,
    SuggestLoading: false,
    showOrHiddenFilter: false,
  };
  temp = {
    curMonth: '',
    tfcunitIds: '',
    odTfcunitIds: '',
    subUnitTypeNo: '',
    isCombination: '',
  };


  componentDidMount() {
    this.map = this.refs.map.contextValue.map;
    const tripMode = utils.getUrlParam('tripMode');//出行方式
    const tripMonth = utils.getUrlParam('tripMonth');//月份
    const tripFrom = utils.getUrlParam('tripFrom');//出发地
    const tripArrive = utils.getUrlParam('tripArrive');//到达地
    if (tripMode && tripMonth) {
      this.setState({
        trlTypeNos: tripMode,
        selectFromOptionValue: tripFrom ? tripFrom : null,
        selectArriveOptionValue: tripArrive ? tripArrive : null,
        saveMonthStr: tripMonth,
      }, () => {
        this.fetchAreaAnalysisSaveOrigin();
        this.didMountFetchFlyLine();
      });
    } else {
      this.fetchAreaAnalysisSaveOrigin(); //进入页面，默认渲染od差特征图层
      this.didMountFetchFlyLine();
    }
    this.map.on('click', this.onMapClick);
  }
  onMapClick = e => {
    console.log(`[${e.latlng.lat},${e.latlng.lng}]`);
    // this.map.setView([e.latlng.lat,e.latlng.lng])
  };

  // 进入页面分析飞线
  didMountFetchFlyLine = () => {
    const { saveMonthStr, trlTypeNos, doeDateType, dayPeriodNo, selectArriveOptionValue, selectFromOptionValue } = this.state;
    const value = {
      statMonth: saveMonthStr,
      trlTypeNos: trlTypeNos,  //出行方式 -1全量出行 1公交 2轨交 3出租网约 4私家车
      doeDateType: doeDateType,
      dayPeriodNo: dayPeriodNo,
    };
    if (!selectArriveOptionValue && !selectFromOptionValue) {
      this.fetchFlyLineInfo(value);
    } else {
      this.analysisODFlyLine(value);
    }
  };

  /**
   * 区块图层差，并且保存地图的不同区块
   */
  fetchAreaAnalysisSaveOrigin = () => {
    this.removeArea();
    this.closePopupClick();
    const { pageSize, trlTypeNos, doeDateType, dayPeriodNo, isCombination, saveMonthStr, subUnitTypeNo } = this.state;
    this.setState({
      mapAreaLoading: true,
    });
    const params = {
      pageNum: 1,  //页码
      pageSize,  //页数大小
      trlTypeNos,  //出行方式
      subUnitTypeNo, //区块类型
      doeDateType,  //出行周期
      dayPeriodNo,   //时间段
      isCombination,  //组合
      statMonth: saveMonthStr,  //月份
    };
    areaAnalysis(params).then(res => {
      if (res.code === 200) {
        console.log('数据加载到！', res);
        const options = [];
        res.data.records.forEach(item => {
          options.push({ value: item.tfcunitId, label: item.tfcunitName });
        });
        this.setState({
          mapAreaLoading: false,
          selectOptions: options,
        });
        if (this.map) {
          //渲染图层、文字
          this.renderMapArea(res.data.records);
          this.map.flyTo(this.state.defaultCenter, 10);  //设置地图缩放为8，这里设置为9，作用显示动画
        }
      }
    });
  };

  //获取当月-上月人群出行方式对比
  fetchTrlTypePercent = () => {
    const { selectItem, memoryCurrentValue, selectFromArea, selectFromOptionValue } = this.state;
    const params = {
      tfcunitId: selectItem.tfcunitId,
      odTfcunitId: selectItem.odTfcunitId,
      statMonth: memoryCurrentValue.statMonth,
    };
    this.setState({ trlTypeLoading: true });
    getTrlType(params).then(res => {
      if (res.code === 200) {
        this.setState({
          trlTypeData: res.data,
          trlTypeLoading: false,
        });
      }
    });
  };
  //出行时间特征分布
  fetchTrlNeedTime = () => {
    const { selectItem, memoryCurrentValue, trlTypeNos } = this.state;
    console.log('trlTypeNos', trlTypeNos);
    const params = {
      tfcunitId: selectItem.tfcunitId,
      odTfcunitId: selectItem.odTfcunitId,
      trlTypeNos: memoryCurrentValue.trlTypeNos,
      statMonth: memoryCurrentValue.statMonth,
    };
    this.setState({ trlNeedTimeLoading: true });
    getTrlNeedTime(params).then(res => {
      if (res.code === 200) {
        this.setState({
          trlNeedTimeData: res.data,
          trlNeedTimeLoading: false,
        });
      }
    });
  };
  //获取当月-上月出行时间段占比
  fetchTrlTimePercent = () => {
    const { selectItem, memoryCurrentValue, selectFromArea } = this.state;
    const params = {
      tfcunitId: selectItem.tfcunitId,
      odTfcunitId: selectItem.odTfcunitId,
      statMonth: memoryCurrentValue.statMonth,
    };
    this.setState({ trlTimePercentLoading: true });
    trlTimePercent(params).then(res => {
      if (res.code === 200) {
        this.setState({
          trlTimePercentData: res.data,
          trlTimePercentLoading: false,
        });
      }
    });
  };

  /**
   *渲染地图区块图层
   * @param data   图层数据
   */
  renderMapArea = (data) => {
    const { subUnitTypeNo, selectFromOptionValue, selectArriveOptionValue } = this.state;
    const latlngData = [];
    data.map(item => {
      let boundPolys = JSON.parse(item.boundPoly).flat();//数组扁平化处理
      boundPolys.forEach(itemArr => {
        itemArr.forEach(item => {
          item.reverse();
        });
      });
      const colorIs = utils.areaColorByNumber(item.setOutCnt, item.arriveCnt, subUnitTypeNo);//填充颜色
      const polygon = L.polygon(boundPolys, {
        color: config.map_LineColor,
        weight: config.map_weight,
        zoneId: item.tfcunitId,
        fillOpacity: config.map_fillOpacity,
        flag: true, //自定义标识
        fromOrTo: '',
        fillColor: colorIs,
        useSaveOriginDefaultColor: colorIs,//保存原来的颜色，取消选择以后要恢复颜色
        useSaveOriginDefaultOpacity: config.map_fillOpacity,  //原来的透明度
        boundPolys: boundPolys,  //用作定位到该区域中心点
      }).on({
        click: e => {
          const { analyzeResult, curSelectFromOrToValue, selectFromOptionValue, selectArriveOptionValue } = this.state;
          if (analyzeResult.records) {
            return;
          }
          let layer = e.target;
          const curZoneId = layer.options.zoneId;
          if (layer.options.flag) {
            //-----------------------选择出发---------------------------
            if (curSelectFromOrToValue === 'from') {
              if (selectFromOptionValue) {
                message.info('出发选择：只能选择一个区域');
                return;
              }
              layer.setStyle({
                fillColor: config.select_From_Color, //填充颜色
                selfColor: config.select_From_Color,
                flag: false,
                fromOrTo: 'isFrom',
                fillOpacity: config.select_area_fill_opacity,
              });
              this.setState({
                selectFromOptionValue: curZoneId,
              });
            }
            //-----------------------选择到达---------------------------
            if (curSelectFromOrToValue === 'to') {
              if (selectArriveOptionValue) {
                message.info('到达选择：只能选择一个区域');
                return;
              }
              layer.setStyle({
                fillColor: config.select_TO_Color, //填充颜色
                selfColor: config.select_TO_Color,
                fromOrTo: 'isTo',
                flag: false,
                fillOpacity: config.select_area_fill_opacity,
              });
              this.setState({
                selectArriveOptionValue: curZoneId,
              });
            }
          } else {//==================取消======================
            if (layer.options.fromOrTo === 'isFrom' && curSelectFromOrToValue === 'from') {
              layer.setStyle({
                fillColor: layer.options.useSaveOriginDefaultColor, //恢复原来的对比颜色
                selfColor: null,
                flag: true,
                fromOrTo: '',
                fillOpacity: config.map_fillOpacity,
              });
              this.setState({
                selectFromOptionValue: null,  //清空select里面组件的值
              });
            }
            if (layer.options.fromOrTo === 'isTo' && curSelectFromOrToValue === 'to') {
              layer.setStyle({
                fillColor: layer.options.useSaveOriginDefaultColor, //恢复原来的对比颜色
                selfColor: null,
                flag: true,
                fromOrTo: '',
                fillOpacity: config.map_fillOpacity,
              });
              this.setState({
                selectArriveOptionValue: null,  //清空select里面组件的值
              });
            }
          }
        },
      });
      latlngData.push(polygon);
    });
    this.setState({
      saveAreaStateData: latlngData,
    });
    if (!this.originArea) {
      this.originArea = new L.layerGroup(latlngData).addTo(this.map);
    }
  };

  /**
   *  点选已选择的区块时将它删除
   * @param clickZoneId
   * @param fromOrToFlag
   */
  removeSelectArea = (clickZoneId, fromOrToFlag) => {
    const { selectFromArea, selectToArea } = this.state;
    const fromData = [...selectFromArea];
    const toData = [...selectToArea];
    if (fromOrToFlag === 'from') {
      fromData.forEach((item, index) => {
        if (clickZoneId === item) {
          fromData.splice(index, 1);
        }
      });
      this.setState({
        selectFromArea: fromData,
      });
    } else {
      toData.forEach((item, index) => {
        if (clickZoneId === item) {
          toData.splice(index, 1);
        }
      });
      this.setState({
        selectToArea: toData,
      });
    }
  };

  /**
   * 渲染区块名称
   * @param originMapArea  生成需要的数据格式
   */
  setAreaMarkerName = originMapArea => {
    return;
    if (this.map) {
      const curZoom = this.map.getZoom();
      const { subUnitTypeNo } = this.state;
      if (this.areaMarkerName.length === 0) {
        if (utils.isShowMarkerByZoom(subUnitTypeNo, curZoom)) {
          this.areaMarkerName = utils.renderMapAreaName(originMapArea, this.map, subUnitTypeNo);
        }
      }
    }
  };


  componentWillUnmount() {
    this.setState({
      unmount: true,
    });
    this.setState = () => false;
    this.removeFlyAndDistance();
    this.removeArea();
    this.removeAreaMarker();
    this.map = null;
  }

  /**
   * 点击列表的每一项
   * @param item
   */
  onClickItem = item => {
    this.clickTipOrListItem(item);
  };

  //左侧卡片开关
  closeLeftCard = () => {
    this.setState({
      closeLeftCard: !this.state.closeLeftCard,
    });
  };

  //右侧卡片开关
  closeRightCard = () => {
    this.setState({
      closeRightCard: !this.state.closeRightCard,
    });
  };

  /**
   * 点击返回结果列表按钮
   */
  onClickReturnButton = () => {
    const { analyzeResult, listReturnOriginData, saveAreaStateData } = this.state;
    saveAreaStateData.forEach(item => {
      item.setStyle({
        fillColor: item.options.selfColor ? item.options.selfColor : item.options.useSaveOriginDefaultColor, //恢复原来的对比颜色
      });
    });
    //移除全部飞线以及飞线的tip标注
    this.removeFlyAndDistance();
    this.closeLeftCard();
    this.closeRightCard();
    this.closePopupClick();
    this.renderFlyMethod(analyzeResult.records);
    this.setState({
      selectItem: null,
      useOnlyId: '',
    });
    utils.mapFitMove(listReturnOriginData, this.map);
  };

  mapAnimator = (zoom = 10) => {
    // 设置动画效果
    this.map.setView(this.state.defaultCenter, zoom, {
      pan: { animate: true, duration: 1 },
      zoom: { animate: true },
      animate: true,
    });
  };

  //点击清空出发地按钮事件
  clickClearIconFrom = () => {
    this.selectFromAddr();  //调用出发选择
    this.removeAreaMarker();
    this.mapAnimator();
    this.setState({
      odDescValue: 1,
      analysisPageNum: 1,
    });
  };

  //点击清空到达地按钮事件
  clickClearIconArrive = () => {
    this.selectToAddr();  //调用到达选择
    this.removeAreaMarker();
    this.mapAnimator();
    this.closePopupClick();
    this.removeFlyAndDistance();
    this.setState({
      odDescValue: 1,
      analysisPageNum: 1,
    });
  };

  /**
   * 出发选择
   */
  selectFromAddr = () => {
    this.closePopupClick();
    this.removeFlyAndDistance();
    const { originMapArea, selectFromOptionValue, saveAreaStateData } = this.state;
    //每次点击前先清空图层，并且清空数据已选择数据，重新设置默认标记、区块
    saveAreaStateData.forEach(item => {
      if (selectFromOptionValue && !item.options.flag && item.options.fromOrTo !== 'isTo') {
        item.setStyle({
          fillColor: item.options.useSaveOriginDefaultColor, //恢复原来的对比颜色
          flag: true,
          fromOrTo: '',
          fillOpacity: config.map_fillOpacity,
          selfColor: null,
        });
      }
    });
    this.setState({
      curSelectFromOrToValue: 'from',
      closeRightCard: false,
      selectFromOptionValue: null,
      //FIXME: 清空所有结果并且关闭右侧卡片
      analyzeResult: [],
      trlTypeData: {},
      trlNeedTimeData: {},
      trlTimePercentData: {},
      selectItem: null,
      useOnlyId: '',
      analysisPageNum: 1,
      clickLoading: false,
      listLoading: false,
      showOrHiddenFilter: false,
    });
  };

  /**
   * 选择到达
   */
  selectToAddr = () => {
    this.closePopupClick();
    this.removeFlyAndDistance();
    const { selectArriveOptionValue, saveAreaStateData } = this.state;
    //每次点击前先清空图层，并且清空数据已选择数据，重新设置默认标记、区块
    saveAreaStateData.forEach(item => {
      if (selectArriveOptionValue && !item.options.flag && item.options.fromOrTo !== 'isFrom') {
        item.setStyle({
          fillColor: item.options.useSaveOriginDefaultColor, //恢复原来的对比颜色
          flag: true,
          fromOrTo: '',
          fillOpacity: config.map_fillOpacity,
          selfColor: null,
        });
      }
    });
    this.setState({
      selectArriveOptionValue: null,
      curSelectFromOrToValue: 'to',
      closeRightCard: false,
      //FIXME: 清空所有结果并且关闭右侧卡片
      analyzeResult: [],
      trlTypeData: {},
      trlNeedTimeData: {},
      trlTimePercentData: {},
      selectItem: null,
      useOnlyId: '',
      analysisPageNum: 1,
      clickLoading: false,
      listLoading: false,
      showOrHiddenFilter: false,
    });
  };

  /**
   * 出发选择框点击每一个选项触发事件
   * @param value
   */
  selectFromItemOption = (value) => {
    this.removeFlyAndDistance();
    this.closePopupClick();
    const { saveAreaStateData, selectFromOptionValue } = this.state;
    saveAreaStateData.forEach(item => {
      //出发=>重置区块颜色状态：1、没有选中的 2、为到达地的不变
      if (selectFromOptionValue && !item.options.flag && item.options.fromOrTo !== 'isTo') {
        item.setStyle({
          fillColor: item.options.useSaveOriginDefaultColor, //恢复原来的对比颜色
          selfColor: null,
          flag: true,
          fromOrTo: '',
          fillOpacity: config.map_fillOpacity,
        });
      }
      if (item.options.zoneId === value && item.options.fromOrTo !== 'isTo') {
        item.setStyle({
          fillColor: config.select_From_Color,
          selfColor: config.select_From_Color,
          flag: false,
          fromOrTo: 'isFrom',
          fillOpacity: config.select_area_fill_opacity,
        });
        //定位居中到该区域描边中心 =polygon是改区域的数组
        this.map.fitBounds(L.polygon(item.options.boundPolys).getBounds(), {
          paddingTopLeft: [60, 200],
          paddingBottomRight: [0, 100],
          pan: { animate: true, duration: 1.1 },
        });
      }
    });
    this.setState({
      selectFromOptionValue: value,
      curSelectFromOrToValue: 'from',
      useOnlyId: '',
      clickLoading: false,
      listLoading: false,
      showOrHiddenFilter: false,
    });
  };

  /**
   * 到达选择框点击每一个选项触发事件
   * @param value
   */
  selectArriveItemOption = (value) => {
    this.closePopupClick();
    this.removeFlyAndDistance();
    const { saveAreaStateData, selectArriveOptionValue } = this.state;
    saveAreaStateData.forEach(item => {
      if (selectArriveOptionValue && item.options.fromOrTo !== 'isFrom') {
        item.setStyle({
          fillColor: item.options.useSaveOriginDefaultColor, //恢复原来的对比颜色
          selfColor: null,
          flag: true,
          fromOrTo: '',
          fillOpacity: config.map_fillOpacity,
        });
      }
      if (item.options.zoneId === value && item.options.fromOrTo !== 'isFrom') {
        item.setStyle({
          fillColor: config.select_TO_Color,
          selfColor: config.select_TO_Color,
          flag: false,
          fromOrTo: 'isTo',
          fillOpacity: config.select_area_fill_opacity,
        });
        this.map.fitBounds(L.polygon(item.options.boundPolys).getBounds(), {
          paddingTopLeft: [60, 200],
          paddingBottomRight: [0, 100],
          pan: { animate: true, duration: 1.1 },
        });
      }
    });
    this.setState({
      selectArriveOptionValue: value,
      curSelectFromOrToValue: 'to',
      useOnlyId: '',
      clickLoading: false,
      listLoading: false,
      showOrHiddenFilter: false,
    });
  };

  //移除地点名称
  removeAreaMarker = () => {
    if (this.areaMarkerName) {
      this.areaMarkerName.map(item => {
        item.remove();
      });
      this.areaMarkerName = [];
    }
  };
  //移除区块
  removeArea = () => {
    if (this.originArea) {
      this.map.removeLayer(this.originArea);
      this.originArea = null;
    }
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
  //清空飞线以及飞线tip标记
  removeFlyAndDistance = () => {
    this.removeAreaArcMarkerInstance(); //移除距离标记块
    if (this.ODFlyLine) { //清空飞线
      this.ODFlyLine.setData();
      this.ODFlyLine = null;
      this.flyLineData = [];
    }
    utils.removeFlyDom();
  };

  /**
   *  0101 交通小区 0102交通中区 0103交通大区
   * */
  onChangeTrlAreaType = e => {
    const subUnitTypeNo = e.target.value;
    this.mapAnimator();
    this.removeFlyAndDistance();
    this.removeArea();
    this.removeAreaMarker();
    this.setState({
      mapAreaLoading: true,
      subUnitTypeNo,
      selectFromOptionValue: null,
      selectArriveOptionValue: null,
      isGroup: false,
      curSelectFromOrToValue: '',
      //FIXME:  以下参数在切换大中小区时候重置所有状态
      analyzeResult: [],
      closeRightCard: false,
      selectItem: null,
      odType: 'isOD',
      analysisPageNum: 1,
      listReturnOriginData: [],
    }, this.fetchAreaAnalysisSaveOrigin);
  };

  createEChartsImg = () => {
    const { saveMonthStr, selectArriveOptionValue, subUnitTypeNo, isGroup, selectFromOptionValue, selectItem } = this.state;
    this.temp.curMonth = saveMonthStr;
    this.temp.tfcunitIds = selectItem.tfcunitId;
    this.temp.odTfcunitIds = selectItem.odTfcunitId;
    this.temp.subUnitTypeNo = subUnitTypeNo;
    this.temp.isCombination = isGroup ? 1 : 0;
    const cntParams = {
      curMonth: saveMonthStr,//时间 格式 YYYYMM
      tfcunitIds: selectItem.tfcunitId, //出发地ids，组合用,隔开
      odTfcunitIds: selectItem.odTfcunitId, //到达地id，组合用,隔开(组合状态才允许多选)
      subUnitTypeNo, // 0101 交通小区 0102交通中区 0103交通大区
      isCombination: isGroup ? 1 : 0, //是否组合 1：是 ｜0：否
    };
    //获取两地客流-图标数据
    let mothData = [];
    let mothXdata = [];
    let dayData = [];
    let dataXdata = [];
    getRegionsCnt(cntParams).then(res => {
      if (res.code === 200) {
        let monthCnt = res.data.monthCnt; //柱状图的数据
        let dayCnt = res.data.dayCnt;  //折线图的数据
        monthCnt.forEach(item => {
          mothData.push(item.cnt);
          mothXdata.push(item.odayTime);
        });
        dayCnt.forEach(item => {
          dayData.push(item.cnt);
          dataXdata.push(item.odayTime);
        });
        this.setState({
          mothData,
          mothXdata,
          dayData,
          dataXdata,
        });
      }
    });
  };


  /**
   * 在飞线的中间标注提示文字，用途：可供鼠标hover、click事件
   * @param item
   * @returns {*}  返回生成的标注信息数据,删除标注信息时候用到
   */
  renderFlyTip = (item) => {
    const { saveMonthStr } = this.state;
    const position = utils.arcCenter(item.addCenterCoor, item.addOdCenterCoor, this.map); //获得飞线弧形中心点
    let distance = utils.getDistance(item.addCenterCoor, item.addOdCenterCoor);   //获得两地直线距离
    let tip = utils.transform(item.odCnt, 2);
    this.useFitBounds.push([position.lat, position.lng]);
    let arcIcon = L.divIcon({
      className: `${styles.distance_marker}`,
      html: `<p style="color: ${utils.flyColorByNumber(item.odCnt, item.maxCnt)}">${tip}</p>`,
    });
    let arcMarker = L.marker(position, {
      icon: arcIcon,
      saveItemMarketInfo: { tfcunitId: item.tfcunitId, odTfcunitId: item.odTfcunitId, statMonth: saveMonthStr },
      position,
    }).on({
      click: (e) => {
        // this.clickTipOrListItem(item)
        console.log('总体出行特征分析');
      },
      mouseover: (e) => {
        const saveItemMarketInfo = e.target.options.saveItemMarketInfo;
        this.setState({
          showOrHiddenPopModal: !!position,
          popPosition: [position.lat, position.lng],
          popLoading: true,
        });
        getLineDetail(saveItemMarketInfo).then(res => {
          if (res.code === 200) {
            this.setState({
              popData: res.data,
              fromName: item.tfcunitName,
              arriveName: item.odTfcunitName,
              popLoading: false,
              distance,
              peopleNum: item.odCnt,
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

  /**
   * 点击飞线的tip文字或者列表每一项时候出发
   * @param item
   */
  clickTipOrListItem = (item) => {
    const { saveAreaStateData, saveMonthStr, memoryCurrentValue, analyzeResult } = this.state;
    saveAreaStateData.forEach(item2 => {
      if (item2.options.zoneId === item.tfcunitId) {
        item2.setStyle({
          fillColor: config.goOutColor,
          fillOpacity: config.map_fillOpacity,
        });
      } else if (item2.options.zoneId === item.odTfcunitId) {
        item2.setStyle({
          fillColor: config.arriveColor,
          fillOpacity: config.map_fillOpacity,
        });
      } else {
        item2.setStyle({
          fillColor: config.sameColorLike, //基本持平色、默认颜色
          fillOpacity: config.map_fillOpacity,
        });
      }
    });
    const data = {
      oTfcunitId: item.tfcunitId,
      dTfcunitId: item.odTfcunitId,
      doeDateType: memoryCurrentValue.doeDateType, // -1:不区分 99：工作日，100：非工作日
      dayPeriodNo: memoryCurrentValue.dayPeriodNo,  //时间段：1:早高峰 3：晚高峰 5全天
      statMonth: saveMonthStr,
    };
    this.setState({
      SuggestLoading: true,
      showOrHiddenFilter: false,
    });
    fetchSuggest(data).then(res => {
      if (res.code === 200) {
        this.setState({
          suggestData: res.data,
          SuggestLoading: false,
        });
      }
    });
    this.closePopupClick();
    this.removeFlyAndDistance();  //移除全部飞线以及飞线的tip标注
    this.areaArcMarkerInstance.push(this.renderFlyTip(item));
    this.renderFlyMethod([item]);
    //设置动画效果
    utils.mapFitMove([{
      addCenterCoor: item.addCenterCoor,
      addOdCenterCoor: item.addOdCenterCoor,
    }], this.map, [200, 200], [500, 200]);
    this.setState({
        closeLeftCard: true,
        selectItem: { tfcunitId: item.tfcunitId, odTfcunitId: item.odTfcunitId },
        closeRightCard: true,
        useOnlyId: item.tfcunitId + item.odTfcunitId,
      }, () => {
        this.createEChartsImg();   //获取需要的图表数据
        this.fetchTrlTypePercent();
        this.fetchTrlNeedTime();
        this.fetchTrlTimePercent();
      },
    );
  };


  //分析请求飞线数据
  analysisODFlyLine = (value) => {
    this.setState({
      listLoading: true,
      closeRightCard: false,
    });
    const {
      analysisPageNum, analysisPageSizeIsFlyLine,
      subUnitTypeNo, isGroup, originMapArea, selectArriveOptionValue, selectFromOptionValue,
    } = this.state;
    //判断是否为正常年月数据，否正转换下
    value['statMonth'] = typeof value.statMonth === 'string' ? value.statMonth : moment(value.statMonth).format('YYYYMM');
    const params = {
      statMonth: value.statMonth,
      pageNum: analysisPageNum,
      pageSize: analysisPageSizeIsFlyLine,
      trlTypeNos: value.trlTypeNos,  //出行方式 -1全量出行 1公交 2轨交 3出租网约 4私家车
      doeDateType: value.doeDateType,
      dayPeriodNo: value.dayPeriodNo,
      subUnitTypeNo,
      isCombination: isGroup ? 1 : 0,
    };
    if (selectFromOptionValue) {
      params['tfcunitIds'] = selectFromOptionValue;
    }
    if (selectArriveOptionValue) {
      params['odTfcunitIds'] = selectArriveOptionValue;
    }
    analysisTrl(params).then(res => {
      if (res.code === 200 && this.map) {
        const listReturnOriginData = utils.inOriginDataAddCenterArray(res.data.records, 'centerCoor', 'odCenterCoor');//返回的列表数据
        if (listReturnOriginData.length === 0) {
          // message.warning('暂无数据！');
        }
        utils.mapFitMove(listReturnOriginData, this.map);
        this.setState({
          curSelectFromOrToValue: '',
          listLoading: false,
          analyzeResult: (selectArriveOptionValue || selectFromOptionValue) ? res.data : [],
          memoryCurrentValue: value,
          showNoneAnalyze: !res.data.records.length, //是否显示缺省页
          listReturnOriginData: listReturnOriginData,
        }, () => this.renderFlyMethod(listReturnOriginData));
      }
    });
  };

  /**
   * 渲染飞线，flyLineData 是飞线数据
   */
  renderFlyMethod = (listReturnOriginData) => {
    const { analysisPageSizeIsFlyLine } = this.state;
    if (this.flyLineData.length !== 0 && this.ODFlyLine) {
      return;
    }
    //先添加飞线数据
    listReturnOriginData.forEach((item) => {
      this.flyLineData.push({
        from: item.addCenterCoor,
        to: item.addOdCenterCoor,
        color: utils.flyColorByNumber(item.odCnt, item.maxCnt),
      });
    });
    this.flyLineData.length = analysisPageSizeIsFlyLine;
    this.ODFlyLine = new L.migrationLayer({
      map: this.map,
      data: this.flyLineData,
      pulseRadius: 20, // 圆的大小
      pulseBorderWidth: 2, // 圆边粗细
      arcWidth: 1, // 曲线粗细
      arcLabel: true, // 是否显示label
      arcLabelFont: '10px sans-serif',
    });
    if (this.map) {
      this.ODFlyLine.addTo(this.map);
    }
  };

  /**
   * 获取出发、到达两个都不选的飞线数据
   * @param value
   */
  fetchFlyLineInfo = (value) => {
    const { analysisPageSizeIsFlyLine, analysisPageNum, subUnitTypeNo, saveMonthStr } = this.state;
    this.setState({
      clickLoading: true,
      listLoading: true,
    });
    const params = {
      statMonth: saveMonthStr,
      pageNum: analysisPageNum,
      pageSize: analysisPageSizeIsFlyLine,
      trlTypeNos: value.trlTypeNos,  //出行方式 -1全量出行 1公交 2轨交 3出租 4网约 7公交轨交 8出租网约
      doeDateType: value.doeDateType,
      dayPeriodNo: value.dayPeriodNo,
      subUnitTypeNo,
    };
    analysisFlyLine(params).then(res => {
      if (res.code === 200 && this.map) {
        const createData = utils.inOriginDataAddCenterArray(res.data.records, 'centerCoor', 'odCenterCoor');
        createData.forEach(item => {
          item['arriveCnt'] = item.odCnt;
        });
        if (createData.length === 0) {
          // message.warning('暂无数据！');
        }
        const response = res.data;
        response['records'] = createData;
        utils.mapFitMove(createData, this.map);
        this.setState({
          analyzeResult: response,
          listReturnOriginData: createData,
          clickLoading: false,
          listLoading: false,
          memoryCurrentValue: { ...params, statMonth: saveMonthStr },
        }, () => this.renderFlyMethod(createData));
      }
    });
  };

  //开始分析
  onFinish = value => {
    const { selectArriveOptionValue, selectFromOptionValue, odDescValue, memoryCurrentValue } = this.state;
    if (odDescValue === 2) {
      this.roadAnalysis(value);
    } else {
      this.removeFlyAndDistance();  //移除全部飞线以及飞线的tip标注
      this.closePopupClick();
      /**
       *  如果两个都没选调用这个接口的飞线
       */
      if (!selectArriveOptionValue && !selectFromOptionValue) {
        this.setState({
          analysisPageNum: 1,
        }, () => this.fetchFlyLineInfo(value));
      } else {
        /**
         *  有选，用之前的分析接口
         */
        this.setState({
          analysisPageNum: 1,
        }, () => this.analysisODFlyLine(value));
      }
    }
  };

  /**
   * 切换分页，只做飞线的分页切换
   * */
  onChangePage = page => {
    const dom = document.getElementById('analyzeContain2');
    dom.scrollTop = 0;  //设置滚动到顶部
    this.removeFlyAndDistance();
    const { selectArriveOptionValue, selectFromOptionValue, memoryCurrentValue, odDescValue } = this.state;
    if (odDescValue === 2) {  //请求道路拥挤程度
      this.setState({
        analysisPageNum: page,
      }, () => this.roadAnalysis(memoryCurrentValue));
    } else { //请求客流强度
      if (!selectArriveOptionValue && !selectFromOptionValue) {
        this.setState({
          analysisPageNum: page,
        }, () => this.fetchFlyLineInfo(memoryCurrentValue));
      } else {
        this.closePopupClick();
        this.setState({
          analysisPageNum: page,
          // useOnlyId: '',
        }, () => this.analysisODFlyLine(memoryCurrentValue));
      }
    }
  };

  //下载报告
  downLoadReport = (reportImages) => {
    const { curMonth, tfcunitIds, odTfcunitIds, subUnitTypeNo, isCombination } = this.temp;
    const { selectItem } = this.state;
    const params = {
      reportImages,
      curMonth,
      odTfcunitIds: selectItem.odTfcunitId,
      tfcunitIds: selectItem.tfcunitId,
      subUnitTypeNo,
      isCombination,
    };
    fetch(api + '/images/regionalPdf', {
      method: 'POST',
      headers: {
        id_token: localStorage.getItem('id_token'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    }).then(res => res.blob()).then(data => {
      let blobUrl = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.download = '区域分析报告.pdf';
      a.href = blobUrl;
      a.click();
      document.body.removeChild(a);
    }).catch(e => {
      console.log(e);
    });
  };

  /**
   * 道路拥挤程度、客流强度按钮切换事件
   */
  onAnalysis = (e) => {
    // this.setState({
    //   odDescValue: e.target.value,
    // });
    // return;
    this.setState({
      odDescValue: e.target.value,
      listReturnOriginData: [],
      analyzeResult: [],
      analysisPageNum: 1,
      showOrHiddenFilter: false,
    }, () => {
      const { memoryCurrentValue, odDescValue } = this.state;
      if (odDescValue === 2) {
        this.roadAnalysis(memoryCurrentValue);
      } else {
        this.onFinish(memoryCurrentValue);
      }
    });
  };

  /**
   * 请求道路拥挤程度
   */
  roadAnalysis = (value) => {
    // this.mapAnimator();
    this.closePopupClick();
    this.removeFlyAndDistance();
    const { analysisPageSizeIsFlyLine, selectFromOptionValue, selectArriveOptionValue, analysisPageNum } = this.state;
    const params = { ...value };
    if (selectFromOptionValue) {
      params['tfcunitId'] = selectFromOptionValue;
    }
    if (selectArriveOptionValue) {
      params['odTfcunitId'] = selectArriveOptionValue;
    }
    delete params.trlTypeNos;
    params['pageSize'] = analysisPageSizeIsFlyLine;
    params['pageNum'] = analysisPageNum;
    params['trlTypeNo'] = value['trlTypeNos'];//出行方式
    params['statMonth'] = typeof value.statMonth === 'string' ? value.statMonth : moment(value.statMonth).format('YYYYMM');
    this.setState({
      listLoading: true,
    });
    roadAnalysis(params).then(res => {
      if (res.code === 200 && this.map) {
        const listReturnOriginData = utils.inOriginDataAddCenterArray(res.data.records, 'centerCoor', 'odCenterCoor');
        if (listReturnOriginData.length === 0) {
          // message.warning('暂无数据！');
        }
        listReturnOriginData.forEach(item => {
          item['arriveCnt'] = item.roadCongestion;
        });
        const response = res.data;
        response['records'] = listReturnOriginData;
        utils.mapFitMove(listReturnOriginData, this.map);
        const sameData = { ...params };//保存相同的格式
        sameData['trlTypeNos'] = value['trlTypeNos'];
        this.setState({
          memoryCurrentValue: sameData,
          listReturnOriginData,
          analyzeResult: response,
          clickLoading: false,
          listLoading: false,
        }, () => this.renderFlyMethod(listReturnOriginData));
      }
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

  //关闭pup弹窗
  closePopupClick = () => {
    this.setState({
      showOrHiddenPopModal: false,
    });
  };

  onChangeMonth = (value) => {
    this.mapAnimator();
    this.removeFlyAndDistance();
    this.removeArea();
    this.removeAreaMarker();
    this.setState({
      selectFromOptionValue: null,
      selectArriveOptionValue: null,
      listReturnOriginData: [],
      analyzeResult: [],
      saveMonthStr: moment(value).format('YYYYMM'),
    }, this.fetchAreaAnalysisSaveOrigin);
  };

  showFilterComp = () => {
    this.setState({
      showOrHiddenFilter: !this.state.showOrHiddenFilter,
    });
  };
  cancelFilter = () => {
    this.setState({
      showOrHiddenFilter: false,
    });
  };


  render() {
    const {
      closeLeftCard,
      trlNeedTimeData,
      trlTypeData,
      analyzeResult,
      subUnitTypeNo,
      curSelectFromOrToValue,
      closeRightCard,
      selectItem, suggestData, odDescValue, useOnlyId, SuggestLoading,
      trlTimePercentData,
      flyLoading,
      listLoading, trlTimePercentLoading,
      trlNeedTimeLoading,
      trlTypeLoading, defaultCenter,
      analysisPageSizeIsFlyLine, analysisPageNum, saveMonthStr,
      mothData,
      mothXdata, odType,
      dayData, popPosition, showOrHiddenPopModal,
      dataXdata, mapAreaLoading, trlTypeNos, doeDateType,
      showOrHiddenFilter, popData, popLoading, dayPeriodNo,
      selectOptions, selectFromOptionValue, selectArriveOptionValue,
      fromName, arriveName, clickLoading, distance, peopleNum,
    } = this.state;
    const { mapThemeUrlObj, lineToolTipInfo, lineToolTipColor } = this.props;
    const chartProps = {
      trlNeedTimeData,
      trlTypeData,
      trlTimePercentData,
      trlTimePercentLoading,
      trlNeedTimeLoading,
      trlTypeLoading,
      mothData,
      mothXdata,
      dayData,
      dataXdata,
      selectFromArea: selectItem && selectItem.tfcunitIds,
      selectToArea: selectItem && selectItem.odTfcunitIds,
      downLoadReport: this.downLoadReport,
    };

    return (
      <div className={styles.wrap_travel}>
        <Spin size="large" spinning={mapAreaLoading}>
          <Map
            ref="map"
            zoomControl={false}
            className={styles.map_style}
            center={defaultCenter}
            minZoom={6}
            maxZoom={18}
            zoom={9}
            closePopupOnClick={false}
          >
            <TileLayer url={mapThemeUrlObj.mapImg}/>
            <TileLayer url={mapThemeUrlObj.mapPoi}/>
            <PopModal visible={showOrHiddenPopModal}
                      position={popPosition}
                      popInfo={popData}
                      popLoading={popLoading}
                      distance={distance}
                      peopleNum={peopleNum}
                      closePopup={this.closePopupClick}
                      fromName={fromName}
                      arriveName={arriveName}/>
          </Map>
          <Card className={`${closeLeftCard ? styles.left_card_hidden : ''} ${styles.travel_left_card}`}>
            <Corner classNL='boxBgLeft'/>
            {closeLeftCard ? <ReturnListButton onClick={this.onClickReturnButton}/> : null}
            <div className={styles.leftContain}>
              <Form
                ref={this.formRef}
                name="control-ref"
                onFinish={this.onFinish}
                initialValues={{
                  // statMonth: utils.getUrlParam('tripMonth'), //往前一个月
                  statMonth: utils.getUrlParam('tripMonth') ? moment(utils.getUrlParam('tripMonth'), 'YYYYMM') : moment(saveMonthStr, 'YYYYMM'),
                  subUnitTypeNo: subUnitTypeNo,
                  trlTypeNos: utils.getUrlParam('tripMode') ? utils.getUrlParam('tripMode') : trlTypeNos,
                  doeDateType: doeDateType,
                  dayPeriodNo: dayPeriodNo,
                }}
              >
                {/*选择日期*/}
                <Form.Item name="statMonth">
                  <DatePicker picker="month" style={{ width: '100%' }}
                              disabledDate={utils.returnDisabledMonth}
                              allowClear={false} onChange={this.onChangeMonth}/>
                </Form.Item>
                {/*出行方式*/}
                <Form.Item name="trlTypeNos" className={styles.select_height}>
                  <Select options={optionsTripMode} style={{ width: '100%' }}> </Select>
                </Form.Item>
                {/*区域类型*/}
                <Form.Item name="subUnitTypeNo">
                  <Radio.Group
                    options={optionsAreaType}
                    optionType="button"
                    // buttonStyle="solid"
                    onChange={this.onChangeTrlAreaType}
                  />
                </Form.Item>
                {/*出行周期*/}
                <Form.Item name="doeDateType">
                  <Radio.Group
                    options={optionsTravalPeriod}
                    optionType="button"
                    // buttonStyle="solid"
                    onChange={() => this.setState({ analysisPageNum: 1 })}
                  />
                </Form.Item>
                {/*出行时间段*/}
                <Form.Item name="dayPeriodNo">
                  <Radio.Group
                    options={optionsTravalTime}
                    optionType="button"
                    // buttonStyle="solid"
                    onChange={() => this.setState({ analysisPageNum: 1 })}
                  />
                </Form.Item>
                {/*出发选择*/}
                <Row className={styles.select_wrap_row}>
                  <Select placeholder="出发选择"
                          onSelect={this.selectFromItemOption}
                          showSearch
                          value={selectFromOptionValue}
                          suffixIcon={
                            <div>
                              {selectFromOptionValue ?
                                <span onClick={this.clickClearIconFrom}><CloseCircleFilled/></span>
                                : <Tooltip title={'地图上点选出发地'}>
                                  <span onClick={this.selectFromAddr}><img src={from} alt=""/></span>
                                </Tooltip>
                              }
                            </div>
                          }
                          filterOption={(input, option) => option.children.indexOf(input) >= 0}
                  >
                    {selectOptions.map(({ label, value }) => {
                      return <Option key={value} value={value} disabled={value === selectArriveOptionValue}>
                        {label}</Option>;
                    })}
                  </Select>
                  <div className={styles.exchange}>
                    <img onClick={()=>this.setState({selectFromOptionValue: selectArriveOptionValue,selectArriveOptionValue: selectFromOptionValue})} src={exchangeIcon} alt=""/>
                  </div>
                </Row>

                <Row className={styles.select_wrap_row}>
                  <Select placeholder="到达选择"
                          showSearch
                          value={selectArriveOptionValue}
                          onSelect={this.selectArriveItemOption}
                          suffixIcon={<div>
                            {selectArriveOptionValue ?
                              <span onClick={this.clickClearIconArrive}><CloseCircleFilled/></span>
                              : <Tooltip title={'地图上点选到达地'}>
                                <span onClick={this.selectToAddr}><img src={to} alt=""/></span>
                              </Tooltip>
                            }
                          </div>}
                          filterOption={(input, option) => option.children.indexOf(input) >= 0}>
                    {selectOptions.map(({ label, value }) => {
                      return <Option key={value} value={value} disabled={value === selectFromOptionValue}>
                        {label}</Option>;
                    })}
                  </Select>
                  <div className={styles.exchange}></div>
                </Row>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ width: '100%' }}
                    loading={clickLoading || listLoading}
                    // disabled={mapAreaLoading}
                  >
                    开始分析
                  </Button>
                </Form.Item>
              </Form>

              {/*              {analyzeResult.records && analyzeResult.records.length > 0 ?
                <div className={styles.od_desc_wrap} onClick={this.showFilterComp}>
                  <img src={filterIcon} alt="筛选"/>筛选
                </div> : null}*/}
              <div className={styles.od_desc_wrap} onClick={this.showFilterComp}>
                <img src={filterIcon} alt="筛选"/>筛选
              </div>

              <FilterComp className={styles.filter_style}
                          data={[{ value: 1, label: '客流强度排行' }, { value: 2, label: '道路拥挤程度' }]}
                          visible={showOrHiddenFilter}
                          style={{ backgroundSize: '152px 106px' }}
                          value={odDescValue}
                          onChangeRadio={this.onAnalysis}
                          onCancel={this.cancelFilter}/>

              {/* 分析列表*/}
              {/*<div className={styles.analyzeContain2} style={{ top: analyzeResult.records ? 345 : 327 }}*/}
              <div className={styles.analyzeContain2} style={{ top: 345 }} id={'analyzeContain2'}>
                {listLoading && <Spin spinning={true} className={styles.loading_style}/>}
                {analyzeResult.records &&
                <List dataSource={analyzeResult.records ? analyzeResult.records : []}
                  // loading={listLoading}
                      renderItem={(item, index) => {
                        const select = item['tfcunitId'] + item['odTfcunitId'];
                        return (
                          <List.Item
                            className={styles.showSelectColor}
                            onClick={() => this.onClickItem(item)}>
                            <List.Item.Meta
                              avatar={<div className={`${styles.itemIndex} ${styles.itemIndex_bc}`}>{index + 1}</div>}
                              title={<div className={styles.list_name}>
                                {item.tfcunitName}
                                <RightOutlined style={{ margin: '0 3px' }}/>
                                {item.odTfcunitName}
                              </div>}
                              description={<div className={styles.od_num}>
                                {selectFromOptionValue ?
                                  <span className={`${styles.go_img} ${styles.span_img}`}/> : selectArriveOptionValue ?
                                    <span className={`${styles.arrive_img} ${styles.span_img}`}/>
                                    : (!selectArriveOptionValue && !selectFromOptionValue) ?
                                      <img style={{ marginRight: 3 }} src={flow} alt=""/> : null
                                }
                                {odDescValue === 2 ? '道路拥挤程度：' + utils.numberTranFormPercent(item.roadCongestion) :
                                  <>客流量：{utils.transform(item.arriveCnt, 2)}人</>
                                }
                              </div>}/>
                          </List.Item>
                        );
                      }}/>}
              </div>
              <div className={styles.wrap_page}>
                <Pagination
                  current={analyzeResult.current}
                  pageSize={analysisPageSizeIsFlyLine}
                  onChange={this.onChangePage}
                  total={analyzeResult.total}
                  showLessItems={true}
                  showSizeChanger={false}
                  size='small'
                />
              </div>
            </div>
          </Card>
          {selectItem ? (
            // {true ? (
            <React.Fragment>
              <div className={styles.right_out} style={{ right: closeRightCard ? 335 : 0, transition: 0.1 }}
                   onClick={this.closeRightCard}>
                {closeRightCard ? <RightOutlined/> : <LeftOutlined/>}
              </div>
              <div className={`${styles.right_chart_card} ${closeRightCard ? styles.right_chart_card_visible : ''}`}>
                <Corner classNR='relativeContainBgR'/>
                <div className={styles.right_card_content}>
                  <Tabs
                    centered
                    className={styles.wrap_tab}
                    defaultActiveKey="0"
                    // onChange={this.changeTravelAnalysis}
                    type="card"
                  >
                    <TabPane tab="研判建议" key="0">
                      <React.Suspense fallback={<div style={{ zIndex: 800, fontSize: 28 }}>加载中</div>}>
                        <TrlSuggestCardLazy suggestData={suggestData} loading={SuggestLoading}/>
                      </React.Suspense>
                    </TabPane>
                    <TabPane tab="人群出行分析" key="1">
                      <PeopleGoAnalysis  {...chartProps} />
                    </TabPane>
                  </Tabs>
                </div>
              </div>
            </React.Fragment>
          ) : ''}

          <Card className={`${styles.tool_card}`} style={{ right: closeRightCard ? 350 : 15, transition: 0.4 }}>
            <div className={styles.item_line_point}>
              <p><span style={{ background: config.goOutColor }}/>出发居多</p>
              <p><span style={{ background: config.arriveColor }}/>到达居多</p>
              <Tooltip
                title={subUnitTypeNo === '0103' ? '数值:相差10万之内' : subUnitTypeNo === '0102' ? '数值:相差3万之内' : '数值:相差1万之内'}
                color={config.sameColorLike} placement="leftTop">
                <p style={{ cursor: 'pointer' }}><span style={{ background: config.sameColorLike }}/> 基本持平</p>
              </Tooltip>
              {this.renderToolTag(lineToolTipInfo, lineToolTipColor)}
            </div>
          </Card>
        </Spin>
      </div>
    );
  }
}

export default Index;
