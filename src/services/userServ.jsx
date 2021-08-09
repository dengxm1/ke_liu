import request, { get, post, put } from '../utils/request';
import qs from 'qs';
import { api } from '../utils/url';


//请求用户列表
export async function getUserList(params) {
  return get(`${api}/auto/jwtAccountPage?${qs.stringify(params)}`);
}

//新增用户
export async function addUser(params) {
  return get(`${api}/auto/addAccount?${qs.stringify(params)}`);
}

//修改用户
export async function editUser(params) {
  return post(`${api}/auto/updateAccount?${qs.stringify(params)}`);
}

//删除用户
export async function delUser(params) {
  return get(`${api}/auto/delAccount?${qs.stringify(params)}`);
}

//退出登录
export async function logoutUser(params) {
  return get(`${api}/auto/loginOut?${qs.stringify(params)}`);
}

//重置密码
export async function resetPassword(params) {
  return get(`${api}/auto/resetPwd?${qs.stringify(params)}`);
}


