import React, { Component } from 'react';
import { Card } from 'antd';
import styles from './index.less';

function Index(props) {
  return (
    <React.Fragment>
      <div className={styles.wrap_card}>
        <Card
          {...props}
          title={<span>{props.title}</span>}
          className={`${props.className}`}
        >
          {props.children}
        </Card>
      </div>
    </React.Fragment>
  );
}

export default Index;
