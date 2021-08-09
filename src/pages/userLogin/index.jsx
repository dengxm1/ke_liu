import React, { Component, useEffect } from 'react';
import IDaaSIframeComp from './IDaaSIframeComp/index';
import styles from './index.less';

function Index() {


  return (
    <div className={styles.wrap_login}>
      <h2>数字政府统一用户中心</h2>
      <IDaaSIframeComp/>
    </div>
  );
}

export default Index;
