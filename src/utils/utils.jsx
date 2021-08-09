import styles from '../global.less';
import moment from 'moment';
import config from './config';


/**
 * 将数值转换为万、千万...
 * @param value
 * @param float   保留几位小数
 * @param returnArray  是否返回为数组格式，默认false
 */
function transform(value, float = 3, returnArray = false) {
  if (!value) return 0;
  let newValue = ['', '', ''];
  let fr = 1000;
  const ad = 1;
  let num = 3;
  const fm = 1;
  while (value / fr >= 1) {
    fr *= 10;
    num += 1;
    // console.log('数字', value / fr, 'num:', num);
  }
  if (num <= 4) { // 千
    // newValue[1] = '千';
    // newValue[0] = value / 1000 + '';
    newValue[0] = value;
  } else if (num <= 8) { // 万
    const text1 = parseInt(num - 4) / 3 > 1 ? '千万' : '万';
    // tslint:disable-next-line:no-shadowed-variable
    const fm = '万' === text1 ? 10000 : 10000000;
    newValue[1] = text1;
    newValue[0] = (value / fm) + '';
  } else if (num <= 16) {// 亿
    let text1 = (num - 8) / 3 > 1 ? '千亿' : '亿';
    text1 = (num - 8) / 4 > 1 ? '万亿' : text1;
    text1 = (num - 8) / 7 > 1 ? '千万亿' : text1;
    // tslint:disable-next-line:no-shadowed-variable
    let fm = 1;
    if ('亿' === text1) {
      fm = 100000000;
    } else if ('千亿' === text1) {
      fm = 100000000000;
    } else if ('万亿' === text1) {
      fm = 1000000000000;
    } else if ('千万亿' === text1) {
      fm = 1000000000000000;
    }
    newValue[1] = text1;
    newValue[0] = value / fm + '';
  }
  /* if (value < 1000) {
     newValue[1] = '';
     newValue[0] = value + '';
   }*/
  newValue[0] = getFloat(newValue[0], float);
  if (returnArray) return newValue;
  return newValue.join('');
}


/**
 *  默认将小数取3位四舍五入
 * @param number  原本数值
 * @param n 保留几位小数
 * @param needAddLength 是否需要补足位数，例如0 显示为0.00
 * @returns {string|number}
 */
function getFloat(number, n = 3, needAddLength = false) {
  n = n ? parseInt(n) : 0;
  if (n <= 0) {
    return Math.round(number);
  }
  number = Math.round(number * Math.pow(10, n)) / Math.pow(10, n); //四舍五入
  number = needAddLength ? Number(number).toFixed(n) : number; //补足位数
  // return typeof number === 'number' ? number : 0;
  return number;
};

/**
 *根据od数量计算返回区块颜色
 * @param fromData  出发
 * @param toData    到达
 * @param unitType  区块类型：大中小区
 */
const areaColorByNumber = (fromData, toData, unitType) => {
  const howMatch = unitType === '0103' ? 100000 : unitType === '0102' ? 30000 : 10000;
  const differentialValue = fromData - toData;
  const differentialValueABS = Math.abs(differentialValue);
  if (differentialValueABS <= howMatch) {
    return config.sameColorLike;  //基本持平
  }
  if (differentialValue > howMatch) {
    return config.goOutColor;  //出行起点多
  } else if (differentialValue < -howMatch) {
    return config.arriveColor;  //出行终点多
  }
};

/**
 *根据差值，计算出发/到达颜色深浅透明度
 * @param data
 * @param rgbColor
 * @param unitType
 * @returns {string}
 */
function returnFromOrToColor(data, rgbColor, unitType) {
  const bigArea = [10000000, 20000000, 30000000];
  const centerArea = [300000, 600000, 900000];
  const smallArea = [50000, 100000, 150000];
  const numbers = unitType === '0101' ? smallArea : unitType === '0102' ? centerArea : bigArea;
  const color = [0.2, 0.4, 0.6];
  let c = 0.9;
  for (let i = 0; i < numbers.length; i++) {
    if (data < numbers[i]) {
      c = color[i];
      break;
    }
  }
  return 'rgba(' + rgbColor + ',' + c + ')';
}

/**
 *根据差值，计算职/住颜色深浅透明度
 * @param data
 * @param rgbColor
 * @param unitType
 * @returns {string}
 */
function returnWorkOrLiveColor(data, rgbColor, unitType) {
  const bigArea = [50000, 150000, 250000];
  const centerArea = [5000, 10000, 15000];
  const smallArea = [2000, 4000, 8000];
  const numbers = unitType === '0101' ? smallArea : unitType === '0102' ? centerArea : bigArea;
  const color = [0.2, 0.4, 0.6];
  let c = 0.8;
  for (let i = 0; i < numbers.length; i++) {
    if (data < numbers[i]) {
      c = color[i];
      break;
    }
  }
  return 'rgba(' + rgbColor + ',' + c + ')';
}

/**
 *根据居住人口和工作人口的数量计算返回区块颜色
 * @param liveData  居住
 * @param workData    工作
 * @param areaType    交通区域类型
 */
export const areaColorByPeopleNum = (liveData, workData, areaType) => {
  const howMatch = areaType === '0103' ? 3000 : areaType === '0102' ? 1000 : 500;
  const differentialValue = liveData - workData;
  const differentialValueABS = Math.abs(differentialValue);
  if (differentialValueABS <= howMatch) {
    return config.sameColorLike;  //基本持平
  }
  if (differentialValue > howMatch) {
    return config.goOutColor;  //居住多
  } else if (differentialValue < -howMatch) {
    return config.arriveColor;  //工作多
  }
};

/**
 *根据数值大小返回飞线颜色
 * @param number  每一项的值
 * @param maxValue 最大值
 */
const flyColorByNumber = (number, maxValue) => {
  let color = '#FF0200';
  let percent = number / maxValue;
  const value = [0.3, 0.6];
  const colorIs = ['#2CA150', '#F87002'];
  for (let i = 0; i < value.length; i++) {
    if (percent < value[i]) {
      color = colorIs[i];
      break;
    }
  }
  return color;
};

/**
 *根据数值大小返回区块颜色  用于职住通勤页面根据到达人数确定区块颜色
 * @param number
 */
const colorAsArrive = (number) => {
  let color = '';
  if (number > 200000) {
    color = '#FF0200';
  } else if ((100000 <= number) && (number < 200000)) {
    color = '#FFAC00';
  } else if ((50000 <= number) && (number < 100000)) {
    color = '#0B80EF';
  } else if ((10000 <= number) && (number < 50000)) {
    color = '#de05d3';
  } else if (number < 10000) {
    color = '#0de009';
  }
  return color;
};

/**
 * 渲染地图区块方法
 * @param data  数据
 * @param map   当前地图
 * @param zoneType   地图类型
 * @returns {[]}   返回数据
 */
const renderMapAreaName = (data = [], map, zoneType = '') => {
  const array = [];
  data.forEach((item, index) => {
    if (item.centerCoor.indexOf(';') !== -1) {
      const arrayCoor = [];
      item.centerCoor.split(';').forEach(coor => {
        arrayCoor.push(LatLanToArray(coor));
      });
      item['addCenterCoor'] = arrayCoor;
    } else {
      item['addCenterCoor'] = [LatLanToArray(item.centerCoor)];
    }
    item.addCenterCoor.forEach(centerPosition => {
      let myIcon = L.divIcon({
        className: `${styles.od_marker}`,
        html: '<p>' + item.tfcunitName + '<p>',
      });
      const marker = L.marker(centerPosition, {
        icon: myIcon,
        zoneId: item.tfcunitId,
        zoneType: zoneType,
        riseOnHover: true,
      });
      marker.addTo(map);
      array.push(marker);
    });
  });
  return array;
};


/**
 * 移除dom元素，为了解决飞线被覆盖在地图的区块元素下bug
 */
const removeFlyDom = () => {
  const getDOM = document.getElementsByClassName('leaflet-ODLayer-container');
  if (getDOM[0]) {
    getDOM[0].remove();
  }
};

/**
 * 获取网址上的参数
 * @param name
 * @returns {any}
 */
const getUrlParam = (name) => {
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
  let result = window.location.search.substr(1).match(reg);
  return result ? decodeURIComponent(result[2]) : null;
};

/**
 * 设置idass用户信息
 * @param key
 * @param infoData
 */
const localUserInfoSet = (key = 'IDaaSUserInfo', infoData) => {
  localStorage.setItem(key, JSON.stringify(infoData));
};

/**
 * 获取idass用户信息
 * @param key
 * @returns {any}
 */
const localUserInfoGet = (key = 'IDaaSUserInfo') => {
  return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : {};
};

/**
 * 将string类型的坐标信息转为数组结构
 * @param string
 * @returns {*}
 * @constructor
 */
const LatLanToArray = (string) => {
  return JSON.parse('[' + string + ']').reverse();
};

/**
 * 是否渲染区块
 * @param unitType   区域类型
 * @param curZoom    当前缩放等级
 * @returns {boolean|boolean}
 */
const isShowMarkerByZoom = (unitType, curZoom) => {
  return (unitType === '0103' && curZoom >= 10) || (unitType === '0102' && curZoom >= 13) || (unitType !== '0103' && curZoom >= 15);
};

/**
 * 通过飞线的from、to的坐标计算出飞线的中心点位置
 * @param fromCentroid
 * @param toCentroid
 * @param map
 * @returns {*}
 */
const arcCenter = (fromCentroid, toCentroid, map) => {
  let arcCenterArr = [];
  var fromPixel = map.latLngToContainerPoint(new L.LatLng(fromCentroid[1], fromCentroid[0]));
  var toPixel = map.latLngToContainerPoint(new L.LatLng(toCentroid[1], toCentroid[0]));
  var factor = 1.5;
  var m = (fromPixel.x + toPixel.x) / 2;
  var n = (fromPixel.y + toPixel.y) / 2;
  var centerX = (fromPixel.y - toPixel.y) * factor + m; //（圆心坐标X）
  var centerY = (toPixel.x - fromPixel.x) * factor + n; // (圆心坐标Y）
  var r = Math.sqrt(Math.pow(centerX - fromPixel.x, 2) + Math.pow(centerY - fromPixel.y, 2));
  var ocX = m - centerX; // o 是圆心坐标点
  var ocY = n - centerY;
  var x = Math.sqrt(Math.pow(r, 2) / (Math.pow(ocX, 2) + Math.pow(ocY, 2))); //(向量的倍数 )
  var centerCX = x * ocX + centerX; // (弧中心坐标X)
  var centerCY = x * ocY + centerY; //（弧中心坐标Y）
  var latLng = map.containerPointToLatLng(new L.point(centerCX, centerCY));
  arcCenterArr.push(centerCX);
  arcCenterArr.push(centerCY);
  arcCenterArr.push(latLng);
  return arcCenterArr[2];
};

/**
 * 通过经纬度计算距离（单位km）
 * @param LatLng1
 * @param LatLng2
 * @returns {number}
 * @constructor
 */
const getDistance = (LatLng1, LatLng2) => {
  let radLat1 = LatLng1[0] * Math.PI / 180.0;
  let radLat2 = LatLng2[0] * Math.PI / 180.0;
  let a = radLat1 - radLat2;
  let b = LatLng1[1] * Math.PI / 180.0 - LatLng2[1] * Math.PI / 180.0;
  let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137;// EARTH_RADIUS;
  s = Math.round(s * 1000) / 1000;
  return s; // 距离单位km
};
/**
 * 在源数据立案统一添加一个中心点字段，为数组格式，返回改变后的源数据
 * @param data  源数据
 * @param str1  要改变的字段名1
 * @param str2   要改变的字段名2，默认不传为空不执行
 * @returns {*[]}  返回
 */
const inOriginDataAddCenterArray = (data, str1 = 'centerCoor', str2 = null, str3 = null, portFlag = null) => {
  const newData = [...data];
  newData.forEach(item => {
    try {
      //需要处理的字段名1
      if (item[str1].indexOf(';') !== -1) {
        const arrayCoor = [];
        item[str1].split(';').forEach(coor => {
          arrayCoor.push(LatLanToArray(coor));
        });
        const reverseData = arrayCoor[0];
        item['addCenterCoor'] = reverseData.reverse();
      } else {
        item['addCenterCoor'] = [LatLanToArray(item[str1])][0].reverse();
      }
      //需要处理的字段名2
      if (str2) {
        if (item[str2].indexOf(';') !== -1) {
          const arrayCoor = [];
          item[str2].split(';').forEach(coor => {
            arrayCoor.push(LatLanToArray(coor));
          });
          const reverseData = arrayCoor[0];
          item['addOdCenterCoor'] = reverseData.reverse();
        } else {
          item['addOdCenterCoor'] = [LatLanToArray(item[str2])][0].reverse();
        }
      }
      //需要处理的字段名2 ---职住统一按客流，时间，距离排行的参数
      if (str3)
        item['addSortVariable'] = portFlag === 1 ? Number(item[str3]) : portFlag === 2 ? parseInt(item[str3]) : getFloat(item[str3] / 1000, 2);
      item['addSortVariableText'] = portFlag === 1 ? (Number(item[str3]) < 10000 ? Number(item[str3]) : transform(item[str3], 2)) + '人' : portFlag === 2 ? parseInt(item[str3]) + '分钟' : getFloat(item[str3] / 1000, 2) + 'km';
    } catch (e) {
      console.warn('数据转换出错:', item);
    }
  });
  return newData;
};

/**
 * 获取上个月的月份
 * @date 为日期对象
 * */
export function getLastMoth() {
  var datetime = new Date();
  var year = datetime.getFullYear();
  var month = datetime.getMonth();
  if (month == 0) {
    year = parseInt(year) - 1;
    month = 12;
  }
  var strtime = year + '-' + month;
  var date = new Date(strtime.replace(/-/g, '/'));
  return date;
}

// 将数组中的经纬度字符串转化成数组，添加latlngArr参数
export function addlatlngArr(dataArr) {
  let idArr = [];
  let idColor = {};
  for (let item of dataArr) {
    if (idArr.indexOf(item.routeId) === -1) {
      idArr.push(item.routeId);
    }
  }
  for (let i in idArr) {
    idColor[idArr[i]] = getEchartsColor(i);
  }
  let resArr = [];
  for (let item of dataArr) {
    resArr.push({
      ...item,
      latlngArr: latlngStrToArr(item.lnglatSeq),
      color: idColor[item.routeId],
    });
  }
  return resArr;
}


/**
 * 获取echarts图的颜色
 */
export function getEchartsColor(index) {
  const colors = [
    '#0B80EF',
    '#FFAC00',
    '#00C1DE',
    '#ff667f',
    '#fade64',
    '#7790ed',
    '#80cc3d',
    '#5F9EA0',
    '#8c3ebb',
    '#A0522D',
  ];
  return colors[index % 10];
}

// 将经纬度字符串转化成数组
export function latlngStrToArr(lnglatStr) {
  if (!lnglatStr) return [];
  let latlngArr = [];
  for (let latlng of lnglatStr.split(';')) {
    latlngArr.push([latlng.split(',')[1], latlng.split(',')[0]]);
  }
  return latlngArr;
}

/**
 * 控制月份，返回不可选的月份情况
 * @param current
 */
const returnDisabledMonth = (current) => {
  // return current && current > moment().endOf('day'); //大于当前月不可选
  return current && current >= moment().subtract(1, 'months');  //大于或者等于当前月份不可选择
};

/**
 * 判断当前区域是否相邻
 * @param selectFromArea   //已经选中的区块id数组
 * @param curSelectAreaRelationArray   //当前选中的id的关联数组
 * @returns {boolean}
 */
const judgeCurSelectIsRelation = (selectFromArea, curSelectAreaRelationArray) => {
  let relation = false;
  for (let k = 0; k < curSelectAreaRelationArray.length; k++) {
    for (let l = 0; l < selectFromArea.length; l++) {
      if (curSelectAreaRelationArray[k] === selectFromArea[l]) {
        relation = true;
        break;
      }
    }
  }
  return relation;
};

/**
 * 数值转为百分比
 * @param number
 * @returns {string}
 */
const numberTranFormPercent = (number) => {
  // return (Math.round(number * 10000) / 100).toFixed(2) + '%';
  return (Math.round(number * 100) / 100).toFixed(2) + '%';
};

/**
 * 将飞线缩放到指定的可视化范围内
 * @param data
 * @param paddingTopLeft
 * @param paddingBottomRight
 */
const mapFitMove = (data, map, paddingTopLeft = [390, 190], paddingBottomRight = [190, 190]) => {
  if (data.length === 0) return;
  const assignData = [];
  data.forEach(item => {
    assignData.push(item.addCenterCoor, item.addOdCenterCoor);
  });
  const lngLats = []; //拷贝内层数组，做顺序对换，防止改变原数组
  assignData.forEach(item => {
    const self = [...item];
    lngLats.push(self.reverse());
  });
  map.fitBounds(lngLats, {
    paddingTopLeft: paddingTopLeft,
    paddingBottomRight: paddingBottomRight,
  });
};

export default {
  addlatlngArr,
  transform,
  getFloat,
  areaColorByNumber,
  flyColorByNumber,
  colorAsArrive,
  arcCenter,
  areaColorByPeopleNum,
  renderMapAreaName,
  removeFlyDom,
  getUrlParam, localUserInfoGet,
  localUserInfoSet,
  LatLanToArray,
  isShowMarkerByZoom,
  inOriginDataAddCenterArray,
  returnDisabledMonth,
  judgeCurSelectIsRelation,
  mapFitMove,
  getDistance,
  numberTranFormPercent,
};


