// @ts-ignore
import { defineConfig } from 'umi';
// import routes from './src/routes';

export default defineConfig({
  routes: [{
    path: '/ReportGeneration',
    component: '@/components/ReportGeneration/index',
    title: '报告生成',
  }, {
    path: '/userLogin',
    component: '@/pages/userLogin/index',
    title: '登录页',
  }, {
    path: '/loading',
    component: '@/pages/loading/index',
    title: '登录跳转中请稍等...',
  }, {
    path: '/',
    component: '@/layouts/index',
    routes: [
      {
        path: '/',
        component: '@/pages/index/index',
        title: '全局总览-城市客流出行特征分析系统',
        wrappers: [
          '@/pages/auth/index',
        ],
      }, {
        path: '/analysisOfTravel',
        component: '@/pages/analysisOfTravel/index',
        title: '总体出行特征分析',
        wrappers: [
          '@/pages/auth/index',
        ],
      }, {
        path: '/analysisOfWork',
        component: '@/pages/analysisOfWork/index',
        title: '职住通勤分析',
        wrappers: [
          '@/pages/auth/index',
        ],
      }, {
        path: '/userManagement',
        component: '@/pages/userManagement/index',
        title: '用户管理',
        wrappers: [
          '@/pages/auth/index',
        ],
      }, {
        path: '/lawsw',
        component: '@/pages/AnalysisReport/index',
        title: '分析报告',
        wrappers: [
          '@/pages/auth/index',
        ],
      }, /*{
        path: '/testMap',
        component: '@/pages/testMap/index',
        title: '地图测试',
      },*/
    ],
  },
  ],
  favicon: '/static/favicon.ico', //打包后如果找不到favicon文件，可以通过手动复制过去
  hash: true, //配置是否让生成的文件包含 hash 后缀，用于增量发布和避免浏览器加载缓存
  /*  dynamicImport: {
      loading: '@/Loading',
    },*/
  /*  polyfill: {
      imports: ['core-js/stable'],
    },*/
  proxy: {
    '/api': {
      // target: 'http://172.17.168.60:8000/',
      target: 'http://172.17.168.60:8088/',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
  /*  nodeModulesTransform: {
      type: 'none',
      exclude: [],
    },*/
  devtool: false,
});
