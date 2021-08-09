import React, { Component } from 'react';
import styles from './index.less';
import { Tooltip } from 'antd';

function Index({ title, text = [], dataInfo }) {


  return (
    <div className={styles.wrap_trl_sug}>
      <p>
        <span className={styles.for_position}><span/></span>
        {title}
      </p>
      <div className={styles.color}>
        <div className={styles.item_color}>
          {dataInfo.position === 4 && <Tooltip title={dataInfo.toolTip}><span className={styles.span}/></Tooltip>}
        </div>
        <div className={styles.item_color}>
          {dataInfo.position === 3 && <Tooltip title={dataInfo.toolTip}><span className={styles.span}/></Tooltip>}
        </div>
        <div className={styles.item_color}>
          {dataInfo.position === 2 && <Tooltip title={dataInfo.toolTip}><span className={styles.span}/></Tooltip>}
        </div>
        <div className={styles.item_color}>
          {dataInfo.position === 1 && <Tooltip title={dataInfo.toolTip}><span className={styles.span}/></Tooltip>}
        </div>

      </div>
      <div className={styles.wrap_text}>
        {
          text.map(item => {
            return <div key={item} className={styles.text}>{item}</div>;
          })
        }
      </div>
    </div>
  );
}

export default Index;
