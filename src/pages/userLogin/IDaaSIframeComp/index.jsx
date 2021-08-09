import React, { Component, useEffect, useState } from 'react';
import styles from './index.less';

function Index() {

  const [IDaaSConfig] = useState(window.configIDaaSConfig.config);

  return (
    <div className={styles.wrap_idass}>
      <iframe id='idaasLoginPlugin'
              onLoad={() => document.getElementById('idaasLoginPlugin').contentWindow.postMessage(IDaaSConfig, IDaaSConfig.portalUrl)}
              src={IDaaSConfig.portalUrl}
              width='340px'
              height='410px'
              scrolling={0}
              frameBorder={0}
      >

      </iframe>
    </div>
  );
}

export default Index;
