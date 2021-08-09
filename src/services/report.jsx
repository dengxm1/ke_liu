import { get, post, put, del } from '../utils/request';
import qs from 'qs';
import { api } from '../utils/url';

// 订阅邮箱分页查询
export async function getEmial(params) {
  return get(`${api}/report/email/page?${qs.stringify(params)}`);
}

// 报告分页查询
export async function getReport(params) {
  return get(`${api}/report/page?${qs.stringify(params)}`);
}

// 日志分页查询
export async function getLog(params) {
  return get(`${api}/report/logs/page?${qs.stringify(params)}`);
}

//根据id删除订阅邮箱
export async function delEmial(params) {
  return del(`${api}/report/${params.id}`);
}

//新增订阅邮箱
export async function addEmial(params) {
  return post(`${api}/report/`, params);
}

//更新订阅邮箱
export async function updataEmial(params) {
  return put(`${api}/report/`, params);
}

//手动报表生成POST /images/generateReport/{id}
export async function generateReport(params) {
  return post(`${api}/images/generateReport/${params.id}`);
}

//邮箱推送POST /images/mailDelivery/{id}
export async function mailDelivery(params) {
  return post(`${api}/images/mailDelivery/${params.id}`);
}

// 订阅关注分页查询
export async function getTakeAttention(params) {
  return get(`${api}/report/focus/page?${qs.stringify(params)}`);
}

// 根据id删除订阅关注
export async function delTakeAttention(params) {
  return del(`${api}/report/focus/${params.id}`);
}

//新增订阅关注POST /report/focus
export async function addTakeAttention(params) {
  return post(`${api}/report/focus`, params);
}
// 更新订阅关注
export async function updataTakeAttention(params) {
  return put(`${api}/report/focus`, params);
}

// 区域下拉列表
export async function getTakeSimple(params) {
  return post(`${api}/report/focus/simple/${params.subUnitTypeNo}`);
}
