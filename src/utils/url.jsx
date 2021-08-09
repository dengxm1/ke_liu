/***
 * 统一api，配置转发代理请求识别
 * **/
// export const api = 'http://172.17.175.195:8000';  // 正式环境-线上slb地址
// export const api = 'http://59.207.61.20:11437';  // 正式环境--通过映射地址到slb
// export const api = 'http://172.17.168.60:8008';  // 测试环境--真实数据--旧版本
export const api = 'http://172.17.168.60:8006';  // 测试环境--真实数据---新版本


/**
 *地图主题url
 * @type {string}
 */
/***************测试*****************/
/*export const mapUrlWhite = 'http://172.17.168.54:25333/v3/tile?z={z}&x={x}&y={y}'; //内网-白色底图
export const mapUrlBlue = 'http://172.17.168.54:25003/v3/tile?z={z}&x={x}&y={y}'; //内网-蓝色底图
export const mapUrlBluePOI = 'http://172.17.168.54:25033/v3/tile?z={z}&x={x}&y={y}'; //内网-蓝色的poi*/
/***************正式*****************/
/*export const mapUrlWhite = 'http://59.207.61.20:11433/v3/tile?z={z}&x={x}&y={y}'; //内网-白色底图
export const mapUrlBlue = 'http://59.207.61.20:11431/v3/tile?z={z}&x={x}&y={y}'; //内网-蓝色底图
export const mapUrlBluePOI = 'http://59.207.61.20:11432/v3/tile?z={z}&x={x}&y={y}'; //内网-蓝色的poi*/
/***************外网*****************/
export const mapUrlWhite =
  'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}';
export const mapUrlBlue =
  'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}';
export const mapUrlBluePOI =
  'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}';
export const mapUrlWhitePOI = ''; //内网-白色的poi-其实不用
export const dark = { mapImg: mapUrlBlue, mapPoi: mapUrlBluePOI };
export const light = { mapImg: mapUrlWhite, mapPoi: mapUrlWhitePOI };
export const mapUrl = 'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}';//外网
// export const light = { mapImg: mapUrl, mapPoi: '' };  //外网环境

