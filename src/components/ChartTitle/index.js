import React, { Component } from 'react';
import { Card, Spin } from 'antd';
import introduce from "../../static/introduce.png";
import styles from './index.less'

export default class ChartTitle extends Component{

   render(){
     const {title, notNeedIntroduce=false}= this.props;
     return (
       <div className={styles.title_content}>
         <span className={styles.title}>{title}</span>
         {/* <img style={{marginLeft:'5px'}} src={introduce}/> */}
         {/*{notNeedIntroduce?<img style={{marginLeft:'5px'}} src={introduce}/>:''}*/}
       </div>
     )
   }
}
