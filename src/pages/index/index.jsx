import React, { Component } from 'react';
import styles from './index.less';
import { Card, Button, Col, Row, Divider, Progress, Radio, Select, Spin, DatePicker, message } from 'antd';
import TypeAnalysis from './goTypeAnalys/index';
import TimeAnalysis from './goTimeAnalys/index';
import PayTimeSpecial from './goPayTimeSpecail/index';
import config from '../../utils/config';
import utils from '../../utils/utils';
import chuzu from '../../static/chuzukeliuliang.png';
import guidao from '../../static/guidaokeliuliang.png';
import changtu from '../../static/changtukeliuliang.png';
import gongjiao from '../../static/gongjiaokeliuliang.png';
import icon_up from '../../static/up.png';
import icon_down from '../../static/down.png';
import fly_no_select_icon from '../../static/icon-客流出行走向-未选中.png';
import fly_select_icon from '../../static/icon-客流出行走向-选中.png';
import heat_select_icon from '../../static/icon-客流分析热力-选中.png';
import heat_no_select_icon from '../../static/icon-客流分析热力-未选中.png';
import TipComp from '../../components/TipComp/index';

import { Map, TileLayer } from 'react-leaflet';
import '../../components/LeafletMap/leaflet-heat';
import TrafficCard from '../../components/TrafficCard';
import { connect } from 'dva';
import { history } from 'umi';
import {
  getCurMonthTrlType,
  getODtOP,
  getTrlDurCompareWithLastMonth,
  getPassengerFlow, getGoTypeSpecialAnalysis, analysisTrl, getMonth, getCenterAreaFlyData, getBasisInfo,
} from '../../services/travelFetch';
import { number } from 'echarts/src/export';
import moment from 'moment';
import ChartTitle from '../../components/ChartTitle';
import Corner from '../../components/Corner';

@connect(({ global, loading }) => {
  return { ...global, mapAreaLoading: loading.effects['global/fetchMapArea'] };
})
class Index extends Component {
  map = null;
  trlTopFlyFlyLine = null;  //飞线图的类
  heatMapData = null;  //热力图的类
  originArea = null; //区域的类
  areaMarkerName = [];
  areaArcMarkerInstance = [];
  state = {
    monthTrlTypeData: null,
    subUnitTypeNo: '',
    bigOdData: [],
    smallOdData: [],
    heatMapData: [],
    listReturnOriginData: [],
    goTimeHowLongSpecail: null,
    typeLoading: false,
    timeLoading: false,
    odLoading: false,
    odAllAreaTotalLoading: false,
    goTypeSpecialAnalysisLoading: false,
    heatMapLoading: false,
    passengerFlowALL: { cur: 0, last: 0 },
    passengerFlowGUIJIAO: { cur: 0, last: 0 },
    passengerFlowXUNYOU: { cur: 0, last: 0 },
    passengerFlowGONGJIAO: { cur: 0, last: 0 },
    passengerFlowWANGYUE: { cur: 0, last: 0 },
    goTypeSpecialAnalysisData: null,
    statMonth: moment(moment().subtract(1, 'months')).format('YYYYMM'),//默认前一个月
    pageNum: 1,
    pageSize: 10,
    doeDateType: '99',
    createResMapArea: [],
    trlTopFlyFlyLineData: [],  //top10飞线数组
    currentArea: 'heat',
    BasisInfo: {},
    orderBy: '1',
    trlTypeNos: '-1',
    size: 30,
  };

  getType = () => {
    this.setState({
      typeLoading: true,
    });
    const { statMonth } = this.state;
    getCurMonthTrlType({ statMonth }).then(res => {
      if (res.code === 200) {
        this.setState({
          monthTrlTypeData: res.data,
          typeLoading: false,
        });
      }
    });
  };
  //查询前中区前30出发人数，展示飞线
  fetchCenterAreaFlyData = () => {
    const { statMonth, trlTypeNos, size } = this.state;
    this.setState({ topFlyLoading: true });
    getCenterAreaFlyData({ statMonth, trlTypeNo: trlTypeNos, size, subUnitTypeNo: '0103' }).then(res => {
      if (res.code === 200 && this.map) {
        const listReturnOriginData = utils.inOriginDataAddCenterArray(res.data, 'centerCoor', 'odCenterCoor');//返回的列表数据
        const data = [];
        const curZoom = this.map.getZoom();
        listReturnOriginData.forEach((item, index, self) => {
          data.push({
            from: item.addCenterCoor,
            to: item.addOdCenterCoor,
            color: utils.flyColorByNumber(item.odCnt, self[0] ? self[0].odCnt : 0),
          });
          if (curZoom > config.map_show_fly_tip_zoom) {
            this.areaArcMarkerInstance.push(this.renderFlyTip(item));
          }
        });
        this.setState({
          topFlyLoading: false,
          trlTopFlyFlyLineData: data,
          listReturnOriginData,
        }, () => {
          this.showTopFlyLine();
        });
      }
    });
  };
  // 飞线上的提示框
  renderFlyTip = (item) => {
    const position = utils.arcCenter(item.addCenterCoor, item.addOdCenterCoor, this.map); //获得飞线弧形中心
    let arcIcon = L.divIcon({
      className: `${styles.distance_marker}`,
      html: `<p>${utils.transform(item.odCnt, 2)}</p>`,
    });
    let arcMarker = L.marker(position, {
      icon: arcIcon,
    });
    return arcMarker.addTo(this.map);
  };

  fetchGoTypeSpecialAnalysis = () => {
    const { statMonth, trlTypeNos, doeDateType } = this.state;
    const params = {
      trlTypeNo: trlTypeNos,
      doeDateType: doeDateType,
      statMonth: statMonth,
    };
    this.setState({
      goTypeSpecialAnalysisLoading: true,
    });
    getGoTypeSpecialAnalysis(params).then(res => {
      if (res.code === 200) {
        this.setState({
          goTypeSpecialAnalysisLoading: false,
          goTypeSpecialAnalysisData: res.data,
        });
      }
    });
  };
//交通小区出行排行  热门出行排行
  fetchOdTop = (subUnitTypeNo) => {
    const { pageNum, pageSize, statMonth, orderBy, trlTypeNos } = this.state;
    const params = {
      pageNum,
      pageSize,
      statMonth,
      subUnitTypeNo: subUnitTypeNo,
      orderBy: orderBy,
      trlTypeNo: trlTypeNos,
    };
    this.setState({
      odLoading: true,
    });
    getODtOP(params).then(res => {
      if (res.code === 200) {
        this.setState({
          odLoading: false,
          smallOdData: res.data.records,
        });
      }
    });
  };

  //中区区域出行需求排行
  fetchOdTopIsCenter = (subUnitTypeNo) => {
    const { pageNum, pageSize, statMonth, orderBy } = this.state;
    const params = { pageNum, pageSize, statMonth, subUnitTypeNo, orderBy: orderBy };
    this.setState({
      odAllAreaTotalLoading: true,
    });
    getODtOP(params).then(res => {
      if (res.code === 200) {
        this.setState({
          odAllAreaTotalLoading: false,
          bigOdData: res.data.records,
        });
      }
    });
  };

  fetchTrlDurCompareWithLastMonth = () => {
    const { statMonth, trlTypeNos } = this.state;
    this.setState({
      timeLoading: true,
    });
    getTrlDurCompareWithLastMonth({ statMonth: statMonth, trlTypeNo: trlTypeNos }).then(res => {
      if (res.code === 200) {
        this.setState({
          goTimeHowLongSpecail: res.data,
          timeLoading: false,
        });
      }
    });
  };

  //异步并发请求，统计总和
  fetchPassengerFlow = () => {
    Promise.all([
      this.fetchTipData('1'),
      this.fetchTipData('2'),
      this.fetchTipData('3'),
      this.fetchTipData('4')]).then(res => {
      let cur = 0;
      let last = 0;
      res.forEach(item => {
        if (item.cur) {
          cur = item.cur + cur;
        }
        if (item.last) {
          last = item.last + last;
        }
      });
      const passengerFlowALL = {
        cur: cur,
        last: last,
      };
      this.setState({
        passengerFlowGONGJIAO: res[0], //公交客流量
        passengerFlowGUIJIAO: res[1], //轨交客流量
        passengerFlowXUNYOU: res[2], //巡游客流量
        passengerFlowWANGYUE: res[3], //网约客流量
        passengerFlowALL, //网全局客流量
      });
    }).catch(e => console.log('e', e));//捕获错误
  };

  /**
   *  请求顶部的tip信息
   * @param item
   */
  fetchTipData = (item) => {
    const { statMonth } = this.state;
    const params = {
      statMonth,
      trlTypeNos: item,
    };
    return getPassengerFlow(params).then(res => {
      if (res.data) {
        return res.data;
      }
    });
  };


  /**
   *显示飞线图层
   */
  showTopFlyLine = () => {
    const { trlTopFlyFlyLineData } = this.state;
    if (trlTopFlyFlyLineData.length === 0) {
      // message.info('正在获取客流走向出行数据，请稍等...');
      return;
    }
    this.clearHeatMap();  //先清除热力图
    if (this.map && !this.trlTopFlyFlyLine) {
      this.trlTopFlyFlyLine = new L.migrationLayer({
        map: this.map,
        data: trlTopFlyFlyLineData,
        pulseRadius: 10, // 圆的大小
        pulseBorderWidth: 1, // 圆边粗细
        arcWidth: 1, // 曲线粗细
        arcLabel: false, // 是否显示label
        arcLabelFont: '10px sans-serif',
      });
      this.trlTopFlyFlyLine.addTo(this.map);
      this.setState({
        currentArea: 'fly',
      });
    }
  };

  /**
   * 显示热力图层
   */
  showHeatMap = () => {
    const { heatMapData } = this.state;
    this.clearTopFly();
    if (this.map && !this.heatMapData) {
      this.heatMapData = L.heatLayer(heatMapData, {
        radius: 22,
        blur: 15,
        max: 2000,
        gradient: {
          0.3: 'rgba(23,230,103,0.3)',
          0.4: 'rgba(23,230,103,0.6)',
          0.5: 'rgba(176,255,86,0.55)',
          0.65: 'rgba(255,255,104,0.7)',
          1: 'rgba(255,26,14,0.42)',
        },
      }).addTo(this.map);
      this.setState({
        currentArea: 'heat',
      });
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
  clearTopFly = () => {
    this.removeAreaArcMarkerInstance(); //移除距离标记块
    if (this.trlTopFlyFlyLine) { //清空飞线
      this.trlTopFlyFlyLine.setData();
      this.trlTopFlyFlyLine = null;
    }
  };
//移除热力图
  clearHeatMap = () => {
    if (this.heatMapData) {
      this.map.removeLayer(this.heatMapData); //移除热力图数据
      this.heatMapData = null;
    }
  };
  //获取地图分块数据
  fetchMapArea = () => {
    this.props.dispatch({
      type: 'global/fetchMapArea',
      payload: { unitType: '0103', pageSize: 20, pageNum: 1 },
      callback: (res) => {
        if (this.map) {
          this.setState({
            createResMapArea: res.records,
          });
          this.renderMapArea(res.records);
          // this.setMapAreaName(res.records);
        }
      },
    });
  };
  //渲染地图区块
  renderMapArea = (data) => {
    const latlngData = [];
    data.forEach(item => {
      let homeArea = this.map.createPane('homeArea');
      this.map.getPane('homeArea').style.zIndex = 300;
      let boundPolys = JSON.parse(item.boundPoly).flat();//数组扁平化处理
      boundPolys.forEach(itemArr => {
        itemArr.forEach(item => {
          item.reverse();
        });
      });
      const polygon = L.polygon(boundPolys, {
        zoneId: item.tfcunitId,
        color: config.map_LineColor,
        fillColor: config.sameColorLike,
        weight: config.map_weight,
        fillOpacity: config.map_fillOpacity,
        pane: homeArea,
      });
      latlngData.push(polygon);
    });
    this.originArea = new L.layerGroup(latlngData).addTo(this.map);
  };

  fetchAll = () => {
    this.getType();
    this.fetchPassengerFlow();
    this.fetchTrlDurCompareWithLastMonth();
    this.fetchGoTypeSpecialAnalysis();
    this.fetchOdTopIsCenter('0103');
    this.fetchOdTop('0103');
    // this.fetchAnalysisToHeatMap();
    this.fetchCenterAreaFlyData();  //飞线
    this.fetchBasisInfo();
  };

  fetchBasisInfo = () => {
    const { statMonth } = this.state;
    getBasisInfo({ statMonth }).then(res => {
      this.setState({
        BasisInfo: res.data,
      });
    });
  };

  componentDidMount() {
    this.map = this.refs.map.contextValue.map;
    this.fetchAll();
    this.setMapView();
    this.fetchMapArea();
    // 监听当前放大或者缩小的等级
    this.map.on('zoomend', e => {
      const { listReturnOriginData } = this.state;
      if (e.target.getZoom() <= config.map_show_fly_tip_zoom) {
        this.removeAreaArcMarkerInstance();
      } else {
        if (this.areaArcMarkerInstance.length === 0) {
          listReturnOriginData.forEach(item => {
            this.areaArcMarkerInstance.push(this.renderFlyTip(item));
          });
        }
      }
    });
  }

  setMapView = () => {
    this.map.setView([34.628934584996816, 113.4314119873047], 10);
  };

  setMapAreaName = (data) => {
    const curZoom = this.map.getZoom();
    if (this.areaMarkerName.length === 0) {
      if (curZoom >= 10) {
        this.areaMarkerName = utils.renderMapAreaName(data, this.map);
      }
    }
  };

  removeMap = () => {
    if (this.originArea) {
      this.map.removeLayer(this.originArea); //移除区块数据
    }
    this.areaMarkerName.map(item => { //移除标记名称
      item.remove();
    });
    this.clearTopFly();
    this.clearHeatMap();
  };


  componentWillUnmount() {
    this.setState = () => false;
    try {
      this.removeMap();
      this.map = null;
    } catch (e) {
      console.log('卸载出错', e);
    }
  }


  onChangeType = (e) => {
    const value = e.target.value;
    this.setState({
      doeDateType: value,
    }, () => this.fetchGoTypeSpecialAnalysis());
  };

  onChange = (date, dateString) => {
    const month = dateString.replace(/-/, '');
    this.clearHeatMap();
    this.clearTopFly();
    this.setMapView();
    this.setState({
      statMonth: month,
    }, () => {
      this.fetchAll();
    });
  };

  setTrlTypeNos = (trlTypeNos) => {
    this.setMapView();
    this.setState({
      trlTypeNos: trlTypeNos,
    }, () => {
      this.clearTopFly();
      this.fetchCenterAreaFlyData(); //飞线联动
      this.fetchOdTop('0103'); // 右侧热门排行联动
      this.fetchGoTypeSpecialAnalysis();  //底部图表联动
      this.fetchTrlDurCompareWithLastMonth();  //右侧底部图表联动
    });
  };


  render() {
    const {
      monthTrlTypeData, BasisInfo, trlTypeNos, statMonth, bigOdData, smallOdData, goTimeHowLongSpecail, typeLoading, goTypeSpecialAnalysisData, heatMapLoading, currentArea, topFlyLoading,
      timeLoading, passengerFlowALL, passengerFlowGUIJIAO, passengerFlowXUNYOU, passengerFlowGONGJIAO, passengerFlowWANGYUE, odLoading, odAllAreaTotalLoading, goTypeSpecialAnalysisLoading,
    } = this.state;
    const { mapThemeUrlObj, mapAreaLoading } = this.props;
    const tipData = [
      { key: '-1', staticName: '全局客流量', ...passengerFlowALL },
      { key: '1', staticName: '公交客流量', ...passengerFlowGONGJIAO },
      { key: '2', staticName: '轨交客流量', ...passengerFlowGUIJIAO },
      { key: '3', staticName: '巡游客流量', ...passengerFlowXUNYOU },
      { key: '4', staticName: '网约客流量', ...passengerFlowWANGYUE },
    ];
    const basisInfoArr = [
      {
        key: 'subwayCount',
        name: '轨交线路总数（条）',
        color: '#0b80ef',
        icon: require('../../static/basisInfoIcon/subway.png'),
      },
      {
        key: 'subwayMileage',
        name: '轨交线路总里程数（公里）',
        color: '#00c1de',
        icon: require('../../static/basisInfoIcon/subway_mileage.png'),
      },
      {
        key: 'subwayStationCount',
        name: '轨交站点总数（个）',
        color: '#ffac00',
        icon: require('../../static/basisInfoIcon/subway_stop.png'),
      },
      {
        key: 'busLineNum',
        name: '公交线路总数（条）',
        color: '#e25959',
        icon: require('../../static/basisInfoIcon/bus_line.png'),
      },
      {
        key: 'busMileage',
        name: '公交总里程数（公里）',
        color: '#856be4',
        icon: require('../../static/basisInfoIcon/bus_mileage.png'),
      },
      { key: 'busCount', name: '公交车辆总数（辆）', color: '#2CA150', icon: require('../../static/basisInfoIcon/bus.png') },
    ];
    const getValue = (data, key) => {
      return data.cur && data.cur[key] ? data.cur[key] : 0;
    };
    const getIconSrc = (data, key) => {
      return data.cur &&
      data.last &&
      data.cur[key] &&
      data.last[key]
        ? data.cur[key] - data.last[key] >= 0
          ? icon_up
          : icon_down
        : icon_up;
    };
    const getRate = (data, key) => {
      return data.cur &&
      data.last &&
      data.cur[key] &&
      data.last[key] &&
      data.cur[key] - data.last[key]
        ? (
        (Math.abs(data.cur[key] - data.last[key]) /
          data.last[key]) *
        100
      ).toFixed(2) + '%'
        : '0%';
    };
    const renderBasisInfo = () => {
      return (
        <div className={styles.basicItems}>
          <ul>
            {basisInfoArr.map((item, index) => {
              return (
                <li key={index}>
                  <div className={styles.param}>
                    <img src={item.icon} alt=""/>
                    <i style={{ color: item.color }}>{getValue(BasisInfo, item.key)}</i>
                    <span>
                      同比
                      <img src={getIconSrc(BasisInfo, item.key)} alt=""/>
                      <b>{getRate(BasisInfo, item.key)}</b>
                    </span>
                  </div>
                  <p>{item.name}</p>
                </li>
              );
            })}
          </ul>
        </div>
      );
    };

    const renderOD = (data) => {
      const { statMonth, orderBy, trlTypeNos } = this.state;
      return data.map(({ tfcunitName, odTotal, tfcunitId, lastOdTotal, cnt, lastCnt }, index) => {
        const status = !cnt || !lastCnt || (cnt - lastCnt) >= 0;
        return (
          <div key={tfcunitId} className={styles.item_od_order} onClick={
            () => {
              history.push(`/analysisOfTravel?tripMode=${trlTypeNos}&tripMonth=${statMonth}&${orderBy === '1' ? 'tripFrom' : 'tripArrive'}=${tfcunitId}`);
            }
          }>
            <Row className={styles.item}>
              <Col span={12} title={tfcunitName} className={styles.over_hidden}>
                            <span className={`${styles.index_math}`}>
                            {index + 1}
                          </span>
                <span className={styles.name}>{tfcunitName}</span>
              </Col>
              <Col span={7} style={{ textAlign: 'center' }} className={styles.over_hidden}>
                <span className={styles.number}>
                  {utils.transform(cnt, 2)}
                </span>
              </Col>
              <Col span={5} className={styles.rate}>
                {/* {status ? (<img src={icon_up} alt=""/>) : (<img src={icon_down} alt=""/>)} */}
                <i className={status ? styles.rateUp : styles.rateDown}></i>
                <span>
                  {cnt && lastCnt ? ((Math.abs(cnt - lastCnt) / lastCnt) * 100).toFixed(1) + '%' : '0%'}
                </span>
              </Col>
            </Row>
          </div>
        );
      });
    };

    return (
      <div className={styles.wrap_index}>
        {/* <Spin size="large" spinning={heatMapLoading}> */}
        <Map
          ref="map"
          zoomControl={false}
          className={styles.map_style}
          center={[34.535803, 113.558109]}
          minZoom={6}
          maxZoom={18}
          zoom={10}
        >
          <TileLayer url={mapThemeUrlObj.mapImg}/>
          <TileLayer url={mapThemeUrlObj.mapPoi}/>
        </Map>
        {/* </Spin> */}
        <TipComp className={styles.showTip} data={tipData} statMonth={statMonth} trlTypeNos={trlTypeNos}
                 setTrlTypeNos={this.setTrlTypeNos}/>
        <div className={styles.time_select}>
          <DatePicker defaultValue={moment().subtract(1, 'months')} allowClear={false}
                      onChange={this.onChange} disabledDate={utils.returnDisabledMonth} picker="month"/>
        </div>
        <div className={styles.wrap_content}>
          <div className={styles.wrap_left}>
            <Corner classNL='boxBgLeft'
                    constructorStyle={{
                      width: '18%',
                      minWidth: '250px',
                      zIndex: 20,
                      marginLeft: 14,
                      bottom: 14,
                      top: 64,
                      boxSizing: 'content-box',
                    }}/>
            <div className={styles.wrap_left_content}>
              <div className={styles.top_left_card_content}>
                <Card
                  title={<ChartTitle title="基础设施数据概览" notNeedIntroduce/>}
                  className={styles.top_left_card}
                  bordered={false}
                >
                  {odAllAreaTotalLoading ?
                    <div className={`${styles.wrap_in_body}`}>
                      <Spin spinning={true} className={styles.loading_style}></Spin>
                    </div> : ''}
                  {renderBasisInfo()}
                </Card>
              </div>
              <Card
                title={<ChartTitle title="出行方式特征分布" notNeedIntroduce/>}
                className={styles.bottom_left_card}
                bordered={false}
              >
                {/*typeLoading*/}
                {typeLoading ?
                  <div className={styles.left_bottom_loading}>
                    <Spin spinning={true} className={styles.loading_style}></Spin></div>
                  : ''}
                {monthTrlTypeData ? <TypeAnalysis monthTrlTypeData={monthTrlTypeData}/> : ''}
              </Card>
            </div>

          </div>

          {/*  <div className={styles.public_traffic}>
            <div className={`${styles.button_style}  ${currentArea === 'heat' ? styles.isSelect : ''}`}
                 onClick={this.showHeatMap}>
              <img src={currentArea === 'heat' ? heat_select_icon : heat_no_select_icon} alt=""/>客流分布热力
            </div>
            <div className={`${styles.button_style}  ${currentArea === 'fly' ? styles.isSelect : ''}`}
                 onClick={this.showTopFlyLine} style={{ marginTop: 6 }}>
              <Spin spinning={topFlyLoading}>
                <img src={currentArea === 'fly' ? fly_select_icon : fly_no_select_icon} alt=""/>客流走向出行
              </Spin>
            </div>
          </div>*/}
          {/*右边的卡片*/}
          <div className={styles.wrap_right}>
            <Corner classNL='boxBgLeft'
                    constructorStyle={{
                      width: '18%',
                      minWidth: '250px',
                      zIndex: 20,
                      bottom: 14,
                      top: 64,
                      right: 14,
                      left: 'revert',
                      boxSizing: 'content-box',
                    }}/>
            <div className={styles.wrap_right_content}>
              <div className={styles.top_card_content}>
                <Card
                  title={<ChartTitle title="热门出行排行" notNeedIntroduce/>}
                  className={styles.top_right_card}
                  bordered={false}
                  extra={
                    <div className={styles.select_right}>
                      <Radio.Group
                        onChange={e => this.setState({ orderBy: e.target.value }, () => {
                          this.fetchOdTop('0103');
                        })}
                        buttonStyle="solid"
                        defaultValue="1"
                        size="small"
                      >
                        <Radio.Button value="1">出发地</Radio.Button>
                        <Radio.Button value="2">目的地</Radio.Button>
                      </Radio.Group>
                    </div>
                  }
                >
                  {odLoading ? <div className={`${styles.wrap_in_body}`}>
                    <Spin spinning={true} className={styles.loading_style}></Spin>
                  </div> : ''}

                  {renderOD(smallOdData)}
                </Card>
              </div>
              <div className={styles.bottom_card_content}>
                <Card
                  title={<ChartTitle title="出行时长特征分布" notNeedIntroduce/>}
                  className={styles.bottom_right_card}
                  bordered={false}
                >
                  {/*timeLoading*/}
                  {timeLoading ?
                    <div className={styles.right_bottom_loading}>
                      <Spin spinning={true} className={styles.loading_style}/></div>
                    : ''}
                  {goTimeHowLongSpecail ? <TimeAnalysis goTimeHowLongSpecail={goTimeHowLongSpecail}/> : ''}
                </Card>
              </div>
            </div>
          </div>

          <Card className={styles.bottom_content}>
            <Corner classNL='boxBgLeft' constructorStyle={{ width: '100%', zIndex: 0 }}/>
            {/* <div className={styles.wrap_desc_item}>
              <TrafficCard imgFlag={guidao} staticText='轨道客流量' data={passengerFlowGUIJIAO}/>
              <Divider type="vertical"/>
              <TrafficCard imgFlag={gongjiao} staticText='公交客流量' data={passengerFlowGONGJIAO}/>
              <Divider type="vertical"/>
              <TrafficCard imgFlag={chuzu} staticText='出租客流量' data={passengerFlowXUNYOU}/>
            </div> */}
            <Card
              title={<ChartTitle title="出行时间特征分布" notNeedIntroduce/>}
              className={styles.wrap_center_card}
              extra={
                <div className={styles.select_right}>
                  <Radio.Group
                    onChange={this.onChangeType}
                    buttonStyle="solid"
                    defaultValue="99"
                    size="small"
                  >
                    <Radio.Button value="99">工作日</Radio.Button>
                    <Radio.Button value="100">非工作日</Radio.Button>
                  </Radio.Group>
                </div>
              }
            >
              <div className={styles.lenged_tip}>
                <div>
                  <span/>当月
                </div>
                <div>
                  <span/>上月
                </div>
              </div>
              {goTypeSpecialAnalysisLoading ?
                <div className={styles.bottom_loading}><Spin spinning={true} className={styles.loading_style}></Spin>
                </div>
                : ''}
              {goTypeSpecialAnalysisData ?
                <PayTimeSpecial goTypeSpecialAnalysisData={goTypeSpecialAnalysisData}/> : ''}
            </Card>
          </Card>
        </div>
      </div>
    );
  }
}

export default Index;
