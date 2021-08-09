import React, { Component } from 'react';
import styles from './index.less';
import utils from '../../utils/utils';
import { get } from '../../utils/request';
import { api } from '../../utils/url';
import { history } from 'umi';

class Index extends Component {

  componentDidMount() {
    const id_token = utils.getUrlParam('id_token');
    if (id_token) {
      localStorage.setItem('id_token', id_token);
      get(`${api}/auto/isLogin?id_token=${id_token}`).then(res => {
        console.log('res', res);
        if (res.code === 200) {
          utils.localUserInfoSet('IDaaSUserInfo', res.data);
          setTimeout(() => {
            history.push('/');
          }, 1500);
        }
      });
    }
  }


  render() {
    return (
      <div style={{ margin: 'auto' }}>
        <div className={styles.app}>
          <div className={styles.loaderWrapper}>
            <div className={styles.loader}/>
            <div className={`${styles.loaderSection} ${styles.sectionLeft}`}/>
            <div className={`${styles.sectionRight}`}/>
            <div className={styles.load_title}>正在登录，请等待...</div>
          </div>
        </div>
      </div>
    );
  }
}

export default Index;
