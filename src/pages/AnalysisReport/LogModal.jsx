/**
 * 分析报告--查看日志弹窗
* */
import React, { Component } from 'react';
import styles from './index.less';
import { Table, Modal, Button } from 'antd';
import { getLog } from '../../services/report';

export default class LogModal extends Component {
  state = {
    logCurrent: 1,
    logPageSize: 10,
    logData: [], //日志表格数据  logMockData
    loading: false,
    logTotal: 0
  };
  componentDidMount(){
    this.getLogList()
  }
  getLogList = () => {
    const { logCurrent, logPageSize } = this.state;
    this.setState({loading:true})
    getLog({
      analysisReportId: this.props.record.id,
      pageNum: logCurrent,
      pageSize: logPageSize,
    }).then(res => {
      if (res.data) {
        this.setState({
          logData: res.data.records,
          logPageSize: res.data.size,
          logTotal: res.data.total,
          loading:false
        });
      }
    }).catch(e=>{
      this.setState({loading:false})
    });
  };
  //onShowLogSizeChange变化的回调
  onShowLogSizeChange = (current, size) => {
    this.setState({
      current: 1,
      logPageSize: size,
    },()=>{
      this.getLogList()
    });
  };

  //日志页码改变的回调，参数是改变后的页码及每页条数
  onLogPageChange = (page, pageSize) => {
    this.setState({
      logCurrent: page, //当前页
    },()=>{
      this.getLogList()
    });
  };

  //显示表格数据总数
  showTotal = (total) =>{
    return `共 ${total} 条`;
  }

  render() {
    const { loading, logCurrent, logPageSize, logData,logTotal } = this.state;
    // 日志
    const logColumns = [
      {
        title: '邮箱地址',
        dataIndex: 'emailAddress',
        align: 'center',
      },
      {
        title: '状态',
        dataIndex: 'sendType',
        align: 'center',
        render: (sendType)=>{
          return <div><i className={styles.dot} style={{background: sendType?'#2CA150':'#f00'}}/>{sendType?'成功':'失败'}</div>
        }
      },
      {
        title: '发送时间',
        dataIndex: 'sendTime',
        align: 'center',
      },
    ];
    return (
      <div>
        <Modal
          title="查看日志"
          width={700}
          visible={true}
          onCancel={() => this.props.showLogModal(false)}
          footer={
            <Button onClick={() => this.props.showLogModal(false)}>关闭</Button>
          }
          className={styles.logTableStyle}
        >
          <Table
            className={styles.tableStyle}
            columns={logColumns}
            dataSource={logData}
            size="middle"
            loading={loading}
            scroll={{ y: 300 }}
            pagination={{
              size: 'large',
              showSizeChanger: true,
              showQuickJumper: true,
              onShowSizeChange: this.onShowLogSizeChange,
              current: logCurrent,
              pageSize: logPageSize,
              total: logTotal,
              showTotal:()=>this.showTotal(logTotal),
              onChange: this.onLogPageChange,
            }}
          />
        </Modal>
      </div>
    );
  }
}
