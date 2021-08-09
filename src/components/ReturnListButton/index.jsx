import React, { Component } from 'react';
import styles from './index.less';
import img from '../../static/返回结果列表.png';

function Index({ onClick, constructStyle={} }) {


  return <div className={styles.wrap_button} onClick={onClick} style={constructStyle}>
    <span>
      <img src={img} alt=""/>
      返回结果列表
    </span>
  </div>;
}

export default Index;
