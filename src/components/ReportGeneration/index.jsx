import React from 'react';
import echarts from 'echarts';
// import { api } from '../../utils/url';

let hostname = window.location.hostname;
let port = '8008';
if (hostname === 'localhost') {
  hostname = '172.17.168.60'; // 本地开发调(测试库)
} else if (hostname === '59.207.61.20') {
  port = '11439';
}
const api = `http://${hostname}:${port}`; // 后端接口

class ReportGeneration extends React.Component{  
  // 获取网址上的参数
  getUrlParam = (name) => {
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
    let result = window.location.search.substr(1).match(reg);
    return result ? decodeURIComponent(result[2]) : null;
  };
  componentDidMount(){
    const _this = this;
    var myChart = echarts.init(document.getElementById('chart'));// 初始化图表标签
    this.myChart = myChart;
    myChart.on('finished', function (e) {
      _this.saveImageData();
    });
    myChart.on("mouseover", function (params){
      this.dispatchAction({
        type: 'downplay'
      });
    });
    this.myChartArr = []
    for(let i=0; i<9; i++){
      this.myChartArr.push(echarts.init(document.getElementById('chart'+i)))
      this.myChartArr[i].on('finished', function (e) {
        _this.saveImageData(this.imgId, this.index);
      });
      this.myChartArr[i].on("mouseover", function (params){
        this.dispatchAction({
          type: 'downplay'
        });
        this.dispatchAction({
          type: 'legendUnSelect',
        })
      });
    }
    this.fetchData()
  }

  // 图片报表生成好后上传
  saveImageData = (imgId, index) => {
    let url = '';
    let L = this.getUrlParam('imageLocation');
    if(('21,22,23,31,32').indexOf(L) > -1){
      L = imgId
      url = this.myChartArr[index].getDataURL()
    }else{
      url = this.myChart.getDataURL()
    }
    // $.ajax(api+`/images`,{
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   data:JSON.stringify({
    //     "imageLocation": L,
    //     "reportTypeNo": this.getUrlParam('reportTypeNo')||2,
    //     "url": url
    //   })
    // })
    fetch(api+`/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body:JSON.stringify({
        "imageLocation": L,
        "reportTypeNo": this.getUrlParam('reportTypeNo')||2,
        "url": url
      })
    })
  }
  
  // 获取数据
  fetchData = () => {
    const P = this.getUrlParam('param');
    const path = this.getUrlParam('id');
    const date = this.getUrlParam('date');
    const reportTypeNo = this.getUrlParam('reportTypeNo');
    // const id_token = localStorage.getItem('id_token');
    if(!path) return
    const url = api+`/images/${path}?${P?'calcAttrNo='+P:''}`+
                `&analyseTypeNo=${parseInt(P)}&subUnitTypeNo=${P}&date=${date}`+
                `&reportTypeNo=${reportTypeNo}`; //&id_token=${id_token}
    // $.ajax(url,{
    //   method: 'GET',
    //   success: (res)=>{
    //     this.handleData(res);
    //   },
    // });
    fetch(url).then(res => res.json()).then(res =>{
      this.handleData(res);
    }) 
  }

  //返回数据处理
  handleData = (res) => {
    const L = this.getUrlParam('imageLocation');
    if(res.data){
      if(L==='12'||L==='331'){// 饼图
        const dataArr = this.dataHandleforPie(res.data.data);
        this.myChart.setOption(this.getPieOption(dataArr))
      }else if(L==='13'||L==='332'||L==='333'){ // 折线图
        const resObj = this.dataHandleforBarAndLine(res.data.data);
        this.myChart.setOption(this.getLineOption(resObj, L==='13'?true:false))
      }else if(L==='14'){ // 柱状图
        const resObj = this.dataHandleforBarAndLine(res.data.data);
        this.myChart.setOption(this.getBarOption(resObj,false,false))
      }else if(('21,22,23,31,32').indexOf(L) > -1){// 九张图
        let i = 0
        for(let key in res.data){
          this.dataHandlefor9(key, res.data[key].data, i);
          i++
        }
        // let key = '2113';  // 单张测试
        // this.dataHandlefor9(key, res.data[key].data)
      }
    }
  }

  // 折线图
  getLineOption = (resObj,axisLabel=true) => {
    const { nameArr, xAxisData, dataArr } = resObj;
    return {
      grid: {
        top: '20%',
        containLabel: true
      },
      legend: {
          data: nameArr,
      },
      xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xAxisData
      },
      yAxis: {
          type: 'value',
          axisLabel: {
            formatter: function(v){
              return  axisLabel?v:v===0?0:`${v*100}%`;
            }
          },
          axisLine: { show: false }, //y轴
          axisTick: { show: false }, //刻度线
      },
      series: [
          {
              name: nameArr[0] || '',
              type: 'line',
              color: '#6394FA',
              symbol: 'circle',  //折点设定为实心点
              symbolSize: 6,   //设定实心点的大小
              data: dataArr[0] || []
          },
          {
              name: nameArr[1] || '',
              type: 'line',
              color: '#63DBAA',
              symbol: 'circle',  //折点设定为实心点
              symbolSize: 6,   //设定实心点的大小
              data: dataArr[1] || []
          },
          {
              name: nameArr[2] || '',
              type: 'line',
              color: '#647797',
              symbol: 'circle',  //折点设定为实心点
              symbolSize: 6,   //设定实心点的大小
              data: dataArr[2] || []
          },
          {
              name: nameArr[3] || '',
              type: 'line',
              color: '#C0504D',
              symbol: 'circle',  //折点设定为实心点
              symbolSize: 6,   //设定实心点的大小
              data: dataArr[3] || []
          },
      ]
    }
  }
  
  // 柱状图(默认叠加型，stack=false条状型)
  getBarOption = (resObj, stack=true, axisLabel=true) => {
    const { nameArr, xAxisData, dataArr } = resObj;
    return {
      grid: {
        top: '20%',
        containLabel: true
      },
      legend: {
        data: nameArr
      },
      xAxis: {
        type: 'category',
        data: xAxisData
      },
      yAxis: {
        type: 'value',
        axisLabel: {
            formatter: function(v){
                return  axisLabel?v:v===0?0:`${v*100}%`;
            }
        },
        axisLine: { show: false }, //y轴
        axisTick: { show: false }, //刻度线
      },
      series: [
        {
          name: nameArr[0] || '',
          type: 'bar',
          barWidth: stack?60:15,
          color: '#6394FA',
          stack: stack,
          data: dataArr[0] || []
        },
        {
          name: nameArr[1] || '',
          type: 'bar',
          barWidth: 15,
          color: '#63DBAA',
          stack: stack,
          data: dataArr[1] || []
        },
        nameArr[2]?{
          name: nameArr[2] || '',
          type: 'bar',
          barWidth: 15,
          color: '#647797',
          stack: stack,
          data: dataArr[2] || []
        }:'',
      ],
    }
  }
  
  // 饼图
  getPieOption = (dataArr) => {
    return {
      legend: {
        bottom: 10,
      },
      series: [
        {
          type: 'pie',
          label: {
            formatter: '{d}%',
          },
          data: dataArr
        }
      ]
    }
  }
  
  // 饼图数据处理
  dataHandleforPie = (dataArr) => {
    const L = this.getUrlParam('imageLocation');
    let resArr = [];
    if(L==='12' || L==='331'){
      for(let i in dataArr){
        if(dataArr[i].cnt>0){
          resArr.push({
            value: dataArr[i].cnt,
            name: dataArr[i].trlType
          })
        }
      }
    }
    return resArr
  }
  
  // 折线及柱状数据处理
  dataHandleforBarAndLine = (data) => {
    const L = this.getUrlParam('imageLocation');
    let resObj = { nameArr:[],xAxisData:[],dataArr:[], };
    if(L==='13' || L==='14'){
      resObj.nameArr = ['当月', '上月'];
      let curDataArr = [], lastDataArr = [];
      if(L==='13'){
        for(let key in data.cur){
          resObj.xAxisData.push(key)
          curDataArr.push(data.cur[key])
        }
        for(let key in data.last){
          lastDataArr.push(data.last[key])
        }
      }else{
        for(let i in data.cur){
          resObj.xAxisData.push(data.cur[i].avgTrlTime)
          curDataArr.push(data.cur[i].proportion)
        }
        for(let i in data.last){
          lastDataArr.push(data.last[i].proportion)
        }
      }
      resObj.dataArr = [curDataArr,lastDataArr]
    }else if(L==='332'||L==='333'){
      let dataArr332 = [];
      for(let key in data){
        resObj.nameArr.push(key);
        dataArr332.push(data[key]);
      }
      resObj.dataArr = [[],[],[],[]];
      for(let i=0; i<dataArr332.length; i++){
        for(let j in dataArr332[i]){
          if(i===0){
            resObj.xAxisData.push(L==='332'?dataArr332[i][j].avgTrlTime+'分钟':dataArr332[i][j].avgTrlDistance+'公里')
          }
          resObj.dataArr[i].push(dataArr332[i][j].proportion)
        }
      }
    }
    return resObj
  }
  
  // 九张图数据处理
  dataHandlefor9 = (id, data, index) =>{
    this.myChartArr[index].imgId = id;
    this.myChartArr[index].index = index;
    let resObj = { nameArr:[],xAxisData:[],dataArr:[[],[],[]]};
    let dataBrr = [];
      for(let key in data){
        resObj.nameArr.push(key);
        dataBrr.push(data[key]);
      }
    if(index===0||index===3||index===6){
      for(let i=0; i<dataBrr.length; i++){
        for(let key in dataBrr[i]){
          if(i==0) resObj.xAxisData.push(key)
          resObj.dataArr[i].push(dataBrr[i][key])
        }
      }
      this.myChartArr[index].setOption(this.getLineOption(resObj))
    }else if(index===1||index===4||index===7){
      for(let i=0; i<dataBrr.length; i++){
        for(let j in dataBrr[i]){
          if(i==0) resObj.xAxisData.push(dataBrr[i][j].trlType)
          resObj.dataArr[i].push(dataBrr[i][j].cnt)
        }
      }
      this.myChartArr[index].setOption(this.getBarOption(resObj))
    }else if(index===2||index===5||index===8){
      for(let i=0; i<dataBrr.length; i++){
        for(let j in dataBrr[i]){
          if(i==0) resObj.xAxisData.push(dataBrr[i][j].avgTrlTime)
          resObj.dataArr[i].push(dataBrr[i][j].cnt)
        }
      }
      this.myChartArr[index].setOption(this.getLineOption(resObj))
    }
  }
  render(){  
    return ( 
      <div>
        <div id="chart" style={{width:600,height:400, position: 'absolute'}}></div>
        {[0,1,2,3,4,5,6,7,8].map(item=>{
          return <div id={`chart`+item} key={item} style={{width:600,height:400}}></div>
        })}
      </div>
    )  
  }
}
export default ReportGeneration;
