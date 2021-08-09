import request, { get, post, put } from '../utils/request';
import qs from 'qs';
import { api } from '../utils/url';

/**
 * 总体出行特征分析页面
 * @param params
 * @returns {Promise<unknown>}
 */
//当月和上月人员出行方式对比
export async function getTrlType(params) {
  return await get(`${api}/overall/selectTrlTypeCompareWithLastMonth?${qs.stringify(params)}`);
}

//出行时间特征分布
export async function getTrlNeedTime(params) {
  return get(
    `${api}/overall/selectOverallTimeCharacteristicDistribution?${qs.stringify(params)}`,
  );
}

//出行时间段占比
export async function trlTimePercent(params) {
  return get(`${api}/overall/selectAvgTrlDurCompareWithLastMonth?${qs.stringify(params)}`);
}


//开始分析查询
export async function analysisTrl(params) {
  return get(`${api}/overall/featureAnalysis?${qs.stringify(params)}`);
}


//当月和上月人员出行距离对比
export async function getTrlDistance(params) {
  return get(`${api}/overall/selectWhTrlDistanceCompareWithLastMonth`);
}

//当月和上月人员出行距离对比
export async function getIsAdjacent(params) {
  return get(`${api}/index/isAdjacent?${qs.stringify(params)}`);
}

//线路详情
export async function getLineDetail(params) {
  return get(`${api}/overall/lineDetail?${qs.stringify(params)}`);
}

// 出行特征分析 不选择出发地，到达地显示飞线
export async function analysisFlyLine(params) {
  return get(`${api}/overall/analysisFlyLine?${qs.stringify(params)}`);
}

// 区域分析--显示对比颜色区块
export async function areaAnalysis(params) {
  return get(`${api}/overall/areaAnalysis?${qs.stringify(params)}`);
}

//研判分析 客流
export async function fetchSuggest(params) {
  return get(`${api}/overall/overallAdvise?${qs.stringify(params)}`);
}

//出行特征分析 道路拥挤指数
export async function roadAnalysis(params) {
  return get(`${api}/overall/analysisRoadCongestion?${qs.stringify(params)}`);
}


/**
 * 首页接口
 * @param params
 * @returns {Promise<unknown>}
 */
//出行方式特征分布
export async function getCurMonthTrlType(params) {
  return get(`${api}/index/selectCurMonthTrlType?${qs.stringify(params)}`);
}

//左右两侧OD排行
export async function getODtOP(params) {
  return get(`${api}/index/getRegionODPage?${qs.stringify(params)}`);
}

//当月上月出行用时占比
export async function getTrlDurCompareWithLastMonth(params) {
  return get(`${api}/index/selectIndexAvgTrlDurCompareWithLastMonth?${qs.stringify(params)}`);
}

//中间顶部内容
export async function getPassengerFlow(params) {
  return get(`${api}/index/passengerFlow?${qs.stringify(params)}`);
}

// 出行时间特征分布
export async function getGoTypeSpecialAnalysis(params) {
  return get(`${api}/index/selectAllTravellerCntDistribute?${qs.stringify(params)}`);
}

// 获取月份
export async function getMonth(params) {
  return get(`${api}/index/getMonths`);
}

// 获取两地客流-图标数据GET
export async function getRegionsCnt(params) {
  return get(`${api}/images/regionsCnt?${qs.stringify(params)}`);
}

// 获取两地出行客流报表GET /images/regionalPdf
export async function getRegionalPdf(params) {
  return post(`${api}/images/regionalPdf`, params);
}

// 获取中区top10飞线
export async function getCenterAreaFlyData(params) {
  return get(`${api}/index/getTopFlyLine?${qs.stringify(params)}`);
}

// export async function getRegionalPdf(params) {
//   return get(`${api}/images/regionalPdf${qs.stringify(params)}`);
// }

//获取基本信息
export async function getBasisInfo(params) {
  return get(`${api}/index/getBasisInfoByStatMonth?${qs.stringify(params)}`);
}
