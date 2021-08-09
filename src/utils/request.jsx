/**
 * 请求方法
 */
import qs from 'qs';
import { message } from 'antd';
import { history } from 'umi';

const fetch = require('dva').fetch;
const { stringify, parse } = qs;

message.config({  //避免多个消息多次弹出来
  maxCount: 1,  //最大消息数量
});
const checkStatus = res => {
  if (200 >= res.status < 300) {
    return res;
  }
  message.error(`网络请求失败,${res.status}`);
  const error = new Error(res.statusText);
  error.response = response;
  throw error;
};

/**
 *  捕获成功登录过期状态码等
 * @param res
 * @returns {*}
 */
const judgeOkState = async res => {
  const cloneRes = await res.clone().json();
  if (cloneRes.code === 904) {   //904未登录状态无权进入系统
    history.push('/userLogin');
    message.error(`${cloneRes.msg}`);
  }
  if (cloneRes.code !== 200) {
    message.error(`${cloneRes.msg}`);
  }
  return res;
};

/**
 * 捕获失败
 * @param error
 */
const handleError = error => {
  if (error instanceof TypeError) {
    message.error(`网络请求失败！${error}`);
  }
  return {
    //防止页面崩溃，因为每个接口都有判断res.code以及data
    code: -1,
    data: false,
  };
};

class http {
  /**
   *静态的fetch请求通用方法
   * @param url
   * @param options
   * @returns {Promise<unknown>}
   */
  static async staticFetch(url = '', options = {}) {
    const defaultOptions = {
      /*允许携带cookies*/
      credentials: 'include',
      /*允许跨域**/
      mode: 'cors',
      headers: {
        id_token: localStorage.getItem('id_token'),
        // 当请求方法是POST，如果不指定content-type是其他类型的话，默认为如下↓，要求参数传递样式为 key1=value1&key2=value2，但实际场景以json为多
        // 'content-type': 'application/x-www-form-urlencoded',
      },
    };
    if (options.method === 'POST' || 'PUT') {
      defaultOptions.headers['Content-Type'] = 'application/json; charset=utf-8';
    }
    const newOptions = { ...defaultOptions, ...options };
    return fetch(url, newOptions)
      .then(checkStatus)
      .then(judgeOkState)
      .then(res => res.json())
      .catch(handleError);
  }

  /**
   *post请求方式
   * @param url
   * @returns {Promise<unknown>}
   */
  post(url, params = {}, option = {}) {
    const options = Object.assign({ method: 'POST' }, option);
    //一般我们常用场景用的是json，所以需要在headers加Content-Type类型
    options.body = JSON.stringify(params);

    //可以是上传键值对形式，也可以是文件，使用append创造键值对数据
    if (options.type === 'FormData' && options.body !== 'undefined') {
      let params = new FormData();
      for (let key of Object.keys(options.body)) {
        params.append(key, options.body[key]);
      }
      options.body = params;
    }
    return http.staticFetch(url, options); //类的静态方法只能通过类本身调用
  }

  /**
   * put方法
   * @param url
   * @returns {Promise<unknown>}
   */
  put(url, params = {}, option = {}) {
    const options = Object.assign({ method: 'PUT' }, option);
    options.body = JSON.stringify(params);
    return http.staticFetch(url, options); //类的静态方法只能通过类本身调用
  }

  /**
   * get请求方式
   * @param url
   * @param option
   */
  get(url, option = {}) {
    const options = Object.assign({ method: 'GET' }, option);
    return http.staticFetch(url, options);
  }

  /**
   * delete请求方式
   * @param url
   * @param option
   */
  del(url, option = {}) {
    const options = Object.assign({ method: 'DELETE' }, option);
    return http.staticFetch(url, options);
  }
}

const requestFun = new http(); //new生成实例
export const { post, get, put, del } = requestFun;
export default requestFun;
