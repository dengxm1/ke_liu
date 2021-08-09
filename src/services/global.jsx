import request, { get, post, put } from '../utils/request';
import qs from 'qs';
import { api } from '../utils/url';

/***
 *  职住通勤部分接口
 * **/
//出行特征分析---用作飞线
export async function tripFeatureAnalyze(params) {
  return get(`${api}/workhome/featureAnalysis?${qs.stringify(params)}`);
}
//客流分析--用作区块对比
export async function flowAnalyze(params) {
  return get(`${api}/workhome/selectPassengerFlowAnalysis?${qs.stringify(params)}`);
}

//出行方式占比(人群出勤分析)
export async function crowdTripMode(params) {
  return get(`${api}/workhome/selectTrlTypeCompareWithLastMonth?${qs.stringify(params)}`);
}

//出行方式占比(交通出行分析)
export async function trafficTripMode(params) {
  return get(`${api}/workhome/selectCurMonthTrlType?${qs.stringify(params)}`);
}

//出行距离占比（车辆分析）
export async function trafficDistanceMode(params) {
  return get(
    `${api}/workhome/selectCurMonthTrlDistanceByTrlType?${qs.stringify(params)}`
  );
}

// 当月和上月人员出行距离对比
export async function trafficDistanceCompare(params) {
  return get(
    `${api}/workhome/selectWhTrlDistanceCompareWithLastMonth?${qs.stringify(params)}`
  );
}

//获取区域
export async function getRegionsBySize(params) {
  return get(
      `${api}/index/getRegionsBySize?${qs.stringify(params)}`
  );
}

//出行时间占比（车辆分析）
export async function trafficTripTimeHold(params) {
  return get(
    `${api}/workhome/selectAvgTrlDurBytrlType?${qs.stringify(params)}`
  );
}

//出行时间占比（人群分析）
export async function tripTimeHold(params) {
  return get(
    `${api}/workhome/selectAvgTrlDurCompareWithLastMonth?${qs.stringify(params)}`
  );
}

//获取区块分区数据
export async function getMapArea(params) {
  return get(`${api}/index/getRegions?${qs.stringify(params)}`);
}

//判断区域是否相邻
export async function isAdjacent(params) {
  return get(`${api}/index/isAdjacent?${qs.stringify(params)}`);
}

//get请求方式
export async function testFetch(params) {
  return get(`${api}/users?${qs.stringify(params)}`);
}

//post请求方式
export async function testPost(params) {
  return post(`${api}/users?${qs.stringify(params)}`, params);
}

//mock数据
export async function getBusLine(params) {
  return get(`/appserver/fake_list?${qs.stringify(params)}`);
}

//职住 ---职住通勤分析 平均出行时间
export async function analysisAvgTrlTimeFlyLine(params) {
  return get(`${api}/workhome/analysisAvgTrlTimeFlyLine?${qs.stringify(params)}`);
}

//职住 ---职住通勤分析 客流量
export async function analysisOdCntFlyLine(params) {
  return get(`${api}/workhome/analysisOdCntFlyLine?${qs.stringify(params)}`);
}
//职住 ---职住通勤分析 平均出行距离
export async function analysisAvgTrlDistanceFlyLine(params) {
  return get(`${api}/workhome/analysisAvgTrlDistanceFlyLine?${qs.stringify(params)}`);
}
//职住--研判分析GET /workhome/workHomeAdvise
export async function workHomeAdvise(params) {
  return get(`${api}/workhome/workHomeAdvise?${qs.stringify(params)}`);
}

//职住 线路详情 GET /workhome/lineDetail
export async function lineDetail(params) {
  return get(`${api}/workhome/lineDetail?${qs.stringify(params)}`);
}
