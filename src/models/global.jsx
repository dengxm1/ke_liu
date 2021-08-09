import { testFetch, getMapArea, getBusLine, flowAnalyze } from '../services/global';
import { mapUrlWhite, mapUrlWhitePOI } from '../utils/url';
import utils from '../utils/utils';

export default {
  namespace: 'global',

  state: {
    collapsed: false,
    mapThemeUrlObj: {
      mapImg: mapUrlWhite, //默认白色
      mapPoi: mapUrlWhitePOI, //默认白色的poi是空的
    },
    createResMapArea: [],
    resMapAreaOrigin: {},
    busLineMsg: [], //公交线路信息
    lineToolTipInfo: ['小于30%', '30%-60%', '大于60%'],
    lineToolTipColor: ['#07d626', '#ff8f02', '#FF0200'],
  },

  subscriptions: {
    setup({ dispatch, history }) {
      // 默认执行
      /*      dispatch({
              type: 'autoFetchMapData',
              payload: {
                pageNum: 1,
                pageSize: 50,
                unitType: '0103',
              },
            });*/
    },
  },

  effects: {
    //修改地图主题
    * changeMapTheme({ payload }, { call, put }) {
      yield put({
        type: 'changeFuncReducer',
        payload: payload,
      });
    },
    //请求地图区块数据
    * fetchMapArea({ payload, callback }, { call, put }) {
      let response = yield call(getMapArea, payload);
      if (response.code === 200 && typeof callback === 'function') {
        //FIXME:在源数据插入addCenterCoor字段
        response.data.records = utils.inOriginDataAddCenterArray(response.data.records);
        callback(response.data);
      }
    },
    //职住获取客流分析接口的数据
    * fetchFlowAnalyze({ payload, callback }, { call, put }) {
      let response = yield call(flowAnalyze, payload);
      if (response.code === 200 && typeof callback === 'function') {
        //FIXME:在源数据插入addCenterCoor字段
        response.data.records = utils.inOriginDataAddCenterArray(response.data.records);
        callback(response.data);
      }
    },
    * autoFetchMapData({ payload, callback }, { call, put }) {
      let response = yield call(getMapArea, payload);
      console.log('autoFetchMapData', response);
    },
    * getBusLine({ payload, callback }, { call, put }) {
      let response = yield call(getBusLine, payload);
      callback(utils.addlatlngArr(response.data));
      yield put({
        type: 'setBusLineMsg',
        payload: response,
      });
    },
  },

  reducers: {
    changeFuncReducer(state, { payload }) {
      return {
        ...state,
        mapThemeUrlObj: payload,
      };
    },
    mapArea(state, { payload }) {
      return {
        ...state,
        resMapAreaOrigin: payload,
        createResMapArea: payload.records,
      };
    },
    setBusLineMsg(state, { payload }) {
      return {
        ...state,
        busLineMsg: utils.addlatlngArr(payload.data),
      };
    },
  },
};
