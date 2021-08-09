/**
 * 路由级别权限控制
 */
import { Redirect } from 'umi';
import utils from '../../utils/utils';
import { message } from 'antd';
import UnAuth from '../../components/noAuth/index';

export default (props) => {
  const isLogin = utils.localUserInfoGet().username;
  const currentRole = utils.localUserInfoGet().role;
  const currentPath = window.location.pathname;
  const normalAuth = ['/userManagement', '/analysisOfWork', '/analysisOfTravel', '/'];  //普通用户只有权限访问这些页面

  if (isLogin) {
    if (currentRole === '1') {
      return <div>{props.children}</div>;
    }
    if (currentRole === '2') {
      const find = normalAuth.findIndex(item => item === currentPath);
      if (find !== -1) {
        return <div>{props.children}</div>;
      } else {
        return <UnAuth/>;
      }
    }
  } else {
    return <Redirect to="/userLogin"/>;
  }
}
