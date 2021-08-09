import React, { Component, useState, useEffect } from 'react';
import styles from './index.less';
import { Row, Col, Space } from 'antd';
import up from '../../static/up.png';
import down from '../../static/down.png';
import utils from '../../utils/utils';
import Corner from "../Corner";

function Index({ className, data = [], setTrlTypeNos, trlTypeNos, statMonth }) {


  //转换百分比计算
  const transFormPer = (cur, last) => {
    if (!last || !cur) {
      return '--%';
    }
    const percent = (Math.abs((cur - last)) / last *100).toFixed(2);
    // if (percent < 0.01) {
    //   return '基本持平';  //基本持平
    // }
    return `${percent}%`;
  };

  // console.log(data);



  return <div className={`${styles.wrap_tip} ${className}`}>
    <div className={styles.content_row}>
      <Space align="center" wrap={'true'}>
        {/*1*/}
        {data.map((item,index)=>{
          let status = !item.cur || !item.last || item.cur - item.last >= 0;
          return(
            <div key={index} className={`${styles.passengerItem} ${item.key===trlTypeNos?styles.activeItem:''}`} onClick={()=>setTrlTypeNos(item.key)}>
              <div className={styles.flowData}>
                <div className={styles.flowWrap}>
                  {/* {(item.cur/10000).toFixed(0)} */}
                  <span className={styles.flowNum}>{item ? (item.cur/10000).toFixed(0)  : 0}</span>
                  <span className={styles.flowUnit}>万人次</span>
                </div>
              </div>
              <div className={styles.dataTip}>
                <div className={styles.tipWrap}>
                  <span className={styles.tipName}>{item.staticName}</span>
                  <span className={styles.tipNum}>
                      {/* <img src={up} className={styles.imgMoveUp}/> */}
                      {/* <img src={status ? up : down} alt=""/> */}
                      <i className={status ? styles.rateUp : styles.rateDown}></i>
                      <b className={status ? styles.red : styles.green}>{transFormPer(item.cur, item.last)}</b>
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </Space>
    </div>
  </div>;
}

export default Index;
