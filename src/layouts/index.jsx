import React, { useEffect, useState, createContext } from 'react';
import Header from './Header/index';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import utils from '../utils/utils';
import { dark, light } from '../utils/url';
import { connect } from 'dva';
import '../../src/global.less';

const mapStateToProps = state => {
  const { mapThemeUrlObj } = state['global'];
  return { mapThemeUrlObj };
};

const wrapPage = props => {
  const [loadingTheme, setLoadingTheme] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme'));

  return (
    loadingTheme && (
      <>
        <Header/>
        <ConfigProvider locale={zhCN}>{props.children}</ConfigProvider>
      </>
    )
  );
};

export default connect(mapStateToProps, null)(wrapPage);
