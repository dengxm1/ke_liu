import React, { Component } from 'react';
import styles from './index.less';
import {
  Layout,
  Menu,
  Input,
  Row,
  Col,
  Dropdown,
  message,
  Button,
  Switch,
} from 'antd';
import { withRouter, history } from 'umi';
import { connect } from 'dva';
import { logoutUser } from '../../services/userServ';
import utils from '../../utils/utils';
import sysImg from '../../static/author.png';
import setting from '../../static/setting.png';
import logo from '../../static/logo.png';
import msg from '../../static/msg.png';
import { dark, light } from '../../utils/url';

const { Header, Content, Footer } = Layout;
const { Search } = Input;

@connect(({ global }) => {
  return { ...global };
})
class Index extends Component {
  nowTime = null;

  state = {
    value: '',
    nowTime: '',
    userData: true,
    changeTheme: true,
    changeThemeLoading: false,
    mapTheme: localStorage.getItem('theme'),
  };

  onClickMenu = e => {
    history.push(e.key);
  };

  NowTime = () => {
    //获取年月日
    let time = new Date();
    let year = time.getFullYear();
    let month = time.getMonth() + 1;
    let day = time.getDate();
    //获取时分秒
    let h = time.getHours();
    let m = time.getMinutes();
    let s = time.getSeconds();
    //检查是否小于10
    h = this.check(h);
    m = this.check(m);
    s = this.check(s);
    this.setState({
      nowTime: year + '-' + month + '-' + day + ' ' + h + ':' + m + ':' + s,
    });
  };
  //时间数字小于10，则在之前加个“0”补位。
  check = i => {
    let num;
    i < 10 ? (num = '0' + i) : (num = i);
    return num;
  };

  componentDidMount() {
    this.nowTime = setInterval(() => {
      this.NowTime();
    }, 1000);
  }

  componentWillUnmount() {
    this.setState({ value: '' });
    clearInterval(this.nowTime);
    this.nowTime = null;
  }

  theme1 = true;
  changeColor = () => {
    let styleLink = document.getElementById('theme-style');
    let body = document.getElementsByTagName('body')[0];
    if (styleLink) {
      // 假如存在id为theme-style 的link标签，直接修改其href
      if (this.theme1) {
        styleLink.href = '/theme/theme1.css'; // 切换 antd 组件主题
        body.className = 'body-wrap-theme1'; // 切换自定义组件的主题
      } else {
        styleLink.href = '/theme/theme2.css';
        body.className = 'body-wrap-theme2';
      }
      this.theme1 = !this.theme1;
    } else {
      // 不存在的话，则新建一个
      styleLink = document.createElement('link');
      styleLink.type = 'text/css';
      styleLink.rel = 'stylesheet';
      styleLink.id = 'theme-style';
      if (this.theme1) {
        styleLink.href = '/theme/theme1.css';
        body.className = 'body-wrap-theme1';
      } else {
        styleLink.href = '/theme/theme2.css';
        body.className = 'body-wrap-theme2';
      }
      this.theme1 = !this.theme1;
      document.body.append(styleLink);
    }


    /*    const mapTheme = localStorage.getItem('theme');
        this.setState({
          changeThemeLoading: true,
        });
        setTimeout(() => {
          this.setState({
            changeThemeLoading: false,
          });
        }, 700);
        switch (mapTheme) {
          case 'dark':
            localStorage.setItem('theme', 'light');
            utils.changeTheme('light');
            this.props.dispatch({
              type: 'global/changeMapTheme',
              payload: light,
            });
            break;
          case 'light':
            localStorage.setItem('theme', 'dark');
            utils.changeTheme('dark');
            this.props.dispatch({
              type: 'global/changeMapTheme',
              payload: dark,
            });
            break;
          default:
            localStorage.setItem('theme', 'dark');
            this.props.dispatch({
              type: 'global/changeMapTheme',
              payload: dark,
            });
            return;
        }*/
  };


  userLogout = () => {
    const params = {
      // appId: 'szzzjwt40',
      appId: localStorage.getItem('appId'),
      enternalId: utils.localUserInfoGet().externalId,
    };
    message.warning('退出登录中...');
    localStorage.removeItem('id_token');
    localStorage.removeItem('IDaaSUserInfo');
    history.push('/userLogin');
    setTimeout(() => {
      message.info('退出登录成功！');
    }, 1000);
  };

  render() {
    // console.log('props', this.props);
    const { nowTime, changeThemeLoading, mapTheme } = this.state;
    const menu = (
      <Menu>
        {utils.localUserInfoGet().role === '1' &&
        <Menu.Item onClick={() => history.push('/userManagement')}> 用户管理</Menu.Item>}
        <Menu.Item onClick={this.userLogout}>退出登录</Menu.Item>
        <Menu.Item disabled>角色：{utils.localUserInfoGet().role === '1' ? '系统管理员' : '普通用户'}</Menu.Item>
      </Menu>
    );
    return (
      <div className={styles.forHeader}>
        <div className={styles.logo}>
          <img src={logo} alt=""/>
          <span>城市客流出行特征分析系统</span>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[this.props.location.pathname]}
          onClick={this.onClickMenu}
          className={styles.wrap_menu}
        >
          <Menu.Item key="/">全局总览</Menu.Item>
          <Menu.Item key="/analysisOfTravel">总体出行特征分析</Menu.Item>
          <Menu.Item key="/analysisOfWork">职住通勤分析</Menu.Item>
          {(utils.localUserInfoGet().role === '1') && <Menu.Item key="/lawsw">分析报告</Menu.Item>}

        </Menu>
        <div className={styles.admin}>
          <div className={styles.time}>{nowTime}</div>
{/*          <div className={styles.switch}>
            <Switch
              checkedChildren="浅"
              unCheckedChildren="深"
              defaultChecked={mapTheme !== 'dark'}
              // loading={changeThemeLoading}
              onClick={this.changeColor}
            />
          </div>
          <div className={styles.test}>这段文字变红蓝</div>*/}
          {/*            <Dropdown overlay={setMenu}>
              <div className={styles.setting}>
                <img src={setting} alt="" />
              </div>
            </Dropdown>*/}
          {/*            <div className={styles.message}>
              <img src={msg} alt="" />
            </div>*/}
          <Dropdown overlay={menu}>
            <div className={styles.user}>
              <img src={sysImg} alt=""/>
              {utils.localUserInfoGet().username}
            </div>
          </Dropdown>
        </div>
      </div>
    );
  }
}

export default withRouter(Index);
