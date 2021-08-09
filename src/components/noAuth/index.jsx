import React, { Component } from 'react';
import styles from './index.less';
import { history } from 'umi';
import { message } from 'antd';


class Index extends Component {
  render() {
    return (
      <div className={styles.wrap_noAuth}>
        <h2>
          当前账号只是个普通管理员，没有权限访问这个页面地址
        </h2>
        <p>
          <a onClick={() => history.goBack()}>
            我知道了这就返回
          </a>
        </p>
      </div>
    );
  }
}

export default Index;
