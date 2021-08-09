import React, { Component } from 'react';
import styles from './index.less';
import { Button, Radio } from 'antd';

function Index({ visible, className, style = {}, onOk, onCancel, data = [], value = 1, onChangeRadio }) {


  return visible && <div className={`${styles.wrap_filter} ${className}`} style={style}>
    <div className={styles.wrap_content}>
      <Radio.Group onChange={onChangeRadio} value={value} size='small'>
        {data.map(({ value, label }) => <Radio value={value}>{label}</Radio>)}
      </Radio.Group>
      <div className={styles.wrap_button}>
        {/*<Button size='small' type='primary' style={{ fontSize: 12 }} onClick={onCancel}>关闭</Button>*/}
        {/*        <div className={styles.showButton}>
          <Button size='small' style={{ fontSize: 12 }} onClick={onCancel}>取消</Button>
          <Button size='small' type='primary' onClick={onOk} style={{ fontSize: 12 }}>确定</Button>
        </div>*/}
      </div>
    </div>
  </div>;
}

export default Index;
