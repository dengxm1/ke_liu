import React, {Component} from 'react';
import styles from './index.less';
import {Card, Radio, Button, Table, Popconfirm, Tag, message, Divider} from 'antd';
import {
  getEmial,
  delEmial,
  getReport,
  generateReport,
  mailDelivery,
  getTakeAttention,
  delTakeAttention
} from '../../services/report';
import Corner from "../../components/Corner";
import LogModal from './LogModal';
import FormModal from './FormModal';
import {api} from '../../utils/url'
import PaperFormModal from "./PaperModel";
import {Map, TileLayer} from 'react-leaflet';
import {connect} from 'dva';

const reportTimeType = {0: '年', 1: '季', 2: '月', 3: '节假日'};


@connect(({global})=>(global))
class AnalysisReport extends Component {
  state = {
    reportType: '', //报告类型
    reportColumns: [], //报告表格字段名
    reportData: [], //报告表格数据  reportMockData
    reportPageSize: 20, //每页条数
    reportCurrent: 1, //当前页
    reportTotal: 0, //总数
    cardStatus: 0, // 0分析报告 1订阅设置
    subscribeData: [], // 订阅表格数据  subscribeMockData
    subscribePageSize: 10, //每页条数
    subscribeCurrent: 1, //当前页
    subscribeTotal: 0, //总数
    logModalVisible: false, //是否显示日志弹窗
    formModalVisible: false, //是否显示订阅新增编辑弹窗
    paperModalVisible: false, //是否显示设置新增编辑弹窗
    pushLoading: false,
    attentionData: [],
    attentionPageSize: 10,
    attentionTotal: 0,
    attentionCurrent: 1,
    emailLoading: false,
    Focusloading: false, //报告表格是否在加载中
    analyzeLoading: false,
    defaultCenter: [34.635803, 113.442109],
  };

  componentDidMount() {
    this.getReportList();
    this.getSubscribeList();
    this.getTakeList();
    if (this.timeInterval) {
      clearInterval(this.timeInterval)
    }
    const _this = this;
    this.timeInterval = setInterval(function () {
      _this.updateReportList()
    }, 5000)
  }

  componentWillUnmount() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval)
    }
  }

  // 定时有条件刷新列表
  updateReportList = () => {
    const {
      cardStatus,
      reportType,
      reportPageSize,
      reportCurrent,
      reportData,
    } = this.state;
    if (cardStatus === 0) {
      getReport({
        reportTypeNo: reportType,
        pageNum: reportCurrent,
        pageSize: reportPageSize,
      }).then(res => {
        if (res.data) {
          let isUpdate = false;
          for (let i in reportData) {
            if (reportData[i].id === res.data.records[i].id && reportData[i].state !== res.data.records[i].state) {
              isUpdate = true
            }
          }
          if (isUpdate) {
            this.setState({
              reportData: res.data.records,
            });
          }
        }
      })
    }
  }
  // 获取订阅邮箱
  getSubscribeList = (reportType = '', size = 10, current = 1) => {
    this.setState({
      reportType: reportType,
      subscribePageSize: size, //每页条数
      subscribeCurrent: current, //当前页
      emailLoading: true
    })
    getEmial({
      reportTypeNo: reportType === '' ? '' : reportTimeType[reportType],
      pageNum: current,
      pageSize: size,
    }).then(res => {
      if (res) {
        if (res.data) {
          this.setState({
            subscribeData: res.data.records,
            subscribePageSize: res.data.size,
            subscribeTotal: res.data.total,
            emailLoading: false
          });
        }
      }
    }).catch(e => {
      this.setState({
        emailLoading: false
      })
    });
  };
  // 获取分析报告
  getReportList = (reportType = '', size = 10, current = 1) => {
    this.setState({
      reportPageSize: size, //每页条数
      reportCurrent: current, //当前页
      analyzeLoading: true
    })
    getReport({
      reportTypeNo: reportType,
      pageNum: current,
      pageSize: size,
    }).then(res => {
      if (res) {
        if (res.data) {
          this.setState({
            reportData: res.data.records,
            reportPageSize: res.data.size,
            reportTotal: res.data.total,
            analyzeLoading: false
          });
        }
      }
    }).catch(e => {
      this.setState({
        analyzeLoading: false
      })
    });
  };

  //获取关注设置数据
  getTakeList = () => {
    const {attentionCurrent, attentionPageSize, reportType} = this.state;
    this.setState({
      Focusloading: true,
    });
    getTakeAttention({
      pageNum: attentionCurrent,
      pageSize: attentionPageSize,
      reportTypeNo: reportType === '' ? '' : reportTimeType[reportType],
    })
      .then(res => {
        if (res) {
          if (res.code === 200) {
            this.setState({
              attentionData: res.data.records,
              attentionTotal: res.data.total,
              Focusloading: false,
            });
          }
        }
      })
      .catch(e => {
        console.log(e);
        this.setState({
          Focusloading: false,
        });
      });
  };

  onSearch = () => {
    const {cardStatus, reportType, reportPageSize, reportCurrent, subscribePageSize, subscribeCurrent} = this.state;
    if (!cardStatus) {
      this.getSubscribeList(reportType, reportPageSize, reportCurrent);
    } else if (cardStatus === 1) {
      this.getSubscribeList(reportType, subscribePageSize, subscribeCurrent);
    } else {
      this.getTakeList();
    }
  };

  //删除订阅设置
  onDelete = id => {
    delEmial({id}).then(res => {
      if (res.code === 200) {
        message.success('删除成功');
        if (this.state.subscribeData.length > 1) {
          this.onSearch();
        } else {    //当删除当前也最后一条数据时返回第一页
          this.setState({
            subscribeCurrent: 1
          }, () => {
            this.onSearch();
          })
        }

      }
    });
  };

  //选择报告类型
  selectReportType = e => {
    console.log('e.target.value', e.target.value)
    const {cardStatus} = this.state;
    console.log('选择报告类型', cardStatus)
    const val = e.target.value
    this.setState({
        reportType: val,
      }, () => {
        //分析报告
        if (cardStatus === 0) {
          this.getReportList(val === '' ? '' : val);
        } else if (cardStatus === 1) {  //订阅邮箱
          this.getSubscribeList(val);
        } else {
          this.setState({
            attentionCurrent: 1,
            attentionPageSize: 10,
            reportType: val
          }, () => {
            this.getTakeList();
          })
        }
      },
    );
  };

  //pageSize变化的回调
  onShowSizeChange = (current, size) => {
    const {cardStatus} = this.state;
    this.setState(
      cardStatus === 0 ? {reportPageSize: size} : {subscribePageSize: size},
      () => {
        this.onSearch();
      },
    );
  };

  //页码改变的回调，参数是改变后的页码及每页条数
  onPageChange = (page, pageSize) => {
    console.log('页码改变的回调，参数是改变后的页码及每页条数');
    const {cardStatus} = this.state;
    this.setState(
      cardStatus === 0
        ? {
          reportCurrent: page,
          reportPageSize: pageSize,
        }
        : cardStatus === 1
        ? {
          subscribeCurrent: page,
          subscribePageSize: pageSize,
        }
        : {
          attentionCurrent: page,
          attentionPageSize: pageSize,
        }, //当前页
      () => {
        this.onSearch();
      },
    );
  };


  attentionSetting = () => {
    this.setState({
      cardStatus: 2,
      attentionPageSize: 10,
      attentionCurrent: 1,
      reportType: '',
    })
  }

  //订阅设置
  subscribeOrComplete = () => {
    this.setState({
      cardStatus: 1,
      reportType: '',
      subscribeCurrent: 1,
      subscribePageSize: 10,
      reportCurrent: 1,
      reportPageSize: 10
    });
  };

  //订设置完成按钮--切换回分析报告
  forBack = () => {
    console.log('切换回分析报告')
    this.setState({
      cardStatus: 0,
      reportType: '',
      reportCurrent: 1,
      reportPageSize: 10
    }, () => {
      this.getReportList();
    });
  };

  //日志弹窗显示和关闭
  showLogModal = bool => {
    this.setState({
      logModalVisible: bool,
    });
  };
  // 订阅新增编辑弹窗显示和关闭
  showFormModal = bool => {
    this.setState({
      formModalVisible: bool,
    });
  };

  //生成报告
  createReport = (id) => {
    generateReport({
      id
    }).then(res => {
      if (res) {
        if (res.code === 200) {
          this.getReportList();
        }
      }
    }).catch(e => {
      console.log(e)
    })
  }

  //推送邮箱
  mailDelivery = (id) => {
    this.setState({
      pushLoading: true
    })
    mailDelivery({
      id
    }).then(res => {
      this.setState({pushLoading: false})
      if (res) {
        if (res.code === 200) {
          message.success('推送成功')
        }
      }
    }).catch(e => {
      console.log(e)
    })
  }


  //订阅设置删除
  paperDelete = tfcunitId => {
    console.log('订阅日志删除', tfcunitId);
    delTakeAttention({id: tfcunitId})
      .then(res => {
        if (res) {
          if (res.data) {
            this.getTakeList();
            message.success('删除成功');
          }
        }
      })
      .catch(e => {
        console.log(e);
      });
  };


  //新增
  addTable = () => {
    console.log('新增新增');
    const {cardStatus} = this.state;
    if (cardStatus === 1) {
      console.log('新增订阅设置');
      this.setState({record: null, formModalVisible: true});
    } else {
      // paperModalVisible
      console.log('新增关注设置');
      this.setState({
        logRecord: null,
        paperModalVisible: true,
      });
    }
  };

  //是否显示订阅设置弹窗的开关
  showPaperModal = bool => {
    this.setState({
      paperModalVisible: bool, //是否显示设置新增编辑弹窗
    });
  };

  //关注设置编辑
  paperEdit = (logRecord) => {
    this.setState({
      logRecord,
      paperModalVisible: true
    })
  }

  //显示表格数据总数
  showTotal = (total) => {
    return `共 ${total} 条`;
  }

  render() {
    const {mapThemeUrlObj} = this.props;
    const {
      reportType,
      // reportColumns,
      reportData,
      reportPageSize,
      reportCurrent,
      reportTotal,
      subscribeData,
      subscribePageSize,
      subscribeCurrent,
      subscribeTotal,
      emailLoading,
      Focusloading, //报告表格是否在加载中
      analyzeLoading,
      cardStatus,
      logModalVisible,
      formModalVisible,
      record,
      pushLoading,
      attentionData,
      attentionCurrent,
      attentionPageSize,
      attentionTotal,
      paperModalVisible,
      logRecord,
      defaultCenter
    } = this.state;
    // 报告设置
    const reportColumns = [
      {
        title: '标题',
        key: 'fileName',
        dataIndex: 'fileName',
        align: 'center',
      },
      {
        title: '报告类型',
        key: 'reportTypeNo',
        dataIndex: 'reportTypeNo',
        align: 'center',
        render: reportTypeNo => {
          const type = {0: '年', 1: '季', 2: '月', 3: '周', 4: '节假日'}
          return (
            <div>
              <Tag color="green">{type[reportTypeNo]}</Tag>
            </div>
          );
        },
      },
      {
        title: '创建时间',
        key: 'createTime',
        dataIndex: 'createTime',
        align: 'center',
      },
      {
        title: '状态',
        key: 'state',
        dataIndex: 'state',
        align: 'center',
        width: 100,
        render: (state)=>{
          return (
            <div>
            <i
              className={styles.dot}
              style={{background: state === 1?'#2CA150':state === 2 ?'#f00':'#98A9B9'}}
            />
            {state === 1 ? '成功' : state === 2 ? '失败' : '生成中'}
            </div>
          )
        }
      },
      {
        title: '操作',
        key: 'operator',
        dataIndex: 'operator',
        align: 'center',
        width: 330,
        render: (operator, logRecord) => (
          <div className={styles.operatorTool}>
            <Button type="link" disabled={logRecord.state === 0}
                    onClick={() => this.createReport(logRecord.id)}>报告生成</Button>
            <Divider type="vertical"/>
            <Button type="link" disabled={logRecord.state === 0}
                    onClick={() => window.open(api + '/report/fileDetails?id=' + logRecord.id + `&id_token=${window.localStorage.getItem('id_token')}`)}>预览</Button>
            <Divider type="vertical"/>
            <Button type="link" disabled={logRecord.state === 0}
                    onClick={() => window.open(api + '/report/fileDetails?id=' + logRecord.id + '&isDownload=1' + `&id_token=${window.localStorage.getItem('id_token')}`)}>
              下载
            </Button>
            <Divider type="vertical"/>
            <Button type="link" onClick={() => this.setState({logRecord, logModalVisible: true})}>
              查看日志
            </Button>
            <Divider type="vertical"/>
            <Button type="link" disabled={logRecord.state === 0} onClick={() => this.mailDelivery(logRecord.id)}
                    loading={pushLoading}>邮箱推送</Button>
          </div>
        ),
      },
    ];
    //订阅设置
    const subscribeColumns = [
      {
        title: '抄送人',
        key: 'ccPeople',
        dataIndex: 'ccPeople',
        align: 'center',
      },
      {
        title: '邮箱地址',
        key: 'emailAddress',
        dataIndex: 'emailAddress',
        align: 'center',
      },
      {
        title: '报告类型',
        key: 'reportTypeNo',
        dataIndex: 'reportTypeNo',
        align: 'center',
        render: reportTypeNo => {
          return (
            <div>
              {(reportTypeNo || '').split(',').map((item, index) => {
                return <Tag key={index} color="green">{item}</Tag>;
              })}
            </div>
          );
        },
      },
      {
        title: '创建时间',
        key: 'createTime',
        dataIndex: 'createTime',
        align: 'center',
      },
      {
        title: '操作',
        key: 'operator',
        dataIndex: 'operator',
        align: 'center',
        render: (text, record, index) => {
          return (
            <div className={styles.operatorTool}>
              <Button
                // className={styles.firstBtn}
                type="link"
                onClick={() => {
                  this.setState({record, formModalVisible: true});
                }}
              >
                编辑
              </Button>
              <Divider type="vertical"/>
              <Popconfirm
                title="确定删除吗?"
                onConfirm={() => {
                  this.onDelete(record.id);
                }}
              >
                <Button type="link"> 删除 </Button>
              </Popconfirm>
            </div>
          );
        },
      },
    ];
    //关注设置
    const attentionColumns = [
      {
        title: '区域类型',
        key: 'subUnitTypeNo',
        dataIndex: 'subUnitTypeNo',
        align: 'center',
        render: reportTypeNo => {
          return (
            <div>
              <div>
                {reportTypeNo === '0103'
                  ? '交通大区'
                  : reportTypeNo === '0101'
                    ? '交通小区'
                    : '交通中区'}
              </div>
            </div>
          );
        },
      },
      {
        title: '区域名称',
        key: 'tfcunitName',
        dataIndex: 'tfcunitName',
        align: 'center',
      },
      {
        title: '订阅报告',
        key: 'reportTypeNo',
        dataIndex: 'reportTypeNo',
        align: 'center',
        render: reportTypeNo => {
          return (
            <div>
              {(reportTypeNo || '').split(',').map((item, index) => {
                return <Tag key={index} color="green">{item}</Tag>;
              })}
            </div>
          );
        },
      },
      {
        title: '操作',
        key: 'operator',
        dataIndex: 'operator',
        align: 'center',
        render: (operator, logRecord) => (
          <div className={styles.operatorTool}>
            <Popconfirm
              title="确定删除吗?"
              onConfirm={() => {
                this.paperDelete(logRecord.id);
              }}
            >
              <Button type="link"> 删除 </Button>
            </Popconfirm>
            <Divider type="vertical"/>
            <Button type="link" onClick={() => {
              this.paperEdit(logRecord);
            }}>
              编辑
            </Button>
          </div>
        ),
      },
    ];
    return (
      <div>
        <Map
          ref="map"
          zoomControl={false}
          className={styles.map_style}
          center={defaultCenter}
          minZoom={6}
          maxZoom={18}
          zoom={10}
        >
          <TileLayer url={mapThemeUrlObj.mapImg} subdomains={[]}/>
          <TileLayer url={mapThemeUrlObj.mapPoi} subdomains={[]}/>
        </Map>
        <Corner classNL="reportBgL"/>
        <div className={styles.wrap_index}>
          {logModalVisible ? <LogModal record={logRecord} showLogModal={this.showLogModal}/> : ''}
          {formModalVisible ? (
            <FormModal
              record={record}
              getSubscribeList={this.getSubscribeList}
              showFormModal={this.showFormModal}
            />
          ) : (
            ''
          )}
          {paperModalVisible ? (
            <PaperFormModal
              record={logRecord}
              getTakeList={this.getTakeList}
              showPaperModal={this.showPaperModal}
            />
          ) : (
            ''
          )}
          <div className={styles.topTitle}>
            <div className={styles.analyzeTitle}>
              <div className={styles.topTip}>
                {cardStatus === 0 ? '分析报告' : cardStatus === 1 ? '订阅设置' : '关注设置'}
              </div>
              {
                cardStatus !== 0 && (
                  <Button
                    type="primary"
                    className={styles.takeBtn}
                    onClick={this.forBack}
                  >
                    返回
                  </Button>
                )
              }
            </div>
          </div>
            <div className={styles.wrap_content}>
              <Card bordered={false} className={styles.tableContain}>
                <div className={styles.selectContain}>
                  <div>
                    <span className={styles.buttonTitle}>报告类型:</span>
                    <Radio.Group
                      value={reportType}
                      onChange={this.selectReportType}
                    >
                      <Radio.Button value="">全部</Radio.Button>
                      <Radio.Button value="0">按年</Radio.Button>
                      <Radio.Button value="1">按季</Radio.Button>
                      <Radio.Button value="2">按月</Radio.Button>
                      <Radio.Button value="3">按节假日</Radio.Button>
                    </Radio.Group>
                  </div>
                  {cardStatus === 0 && (
                    <div>
                      <Button
                        type="primary"
                        className={styles.takeBtn}
                        onClick={this.attentionSetting}
                      >
                        关注设置
                      </Button>
                      <Button
                        type="primary"
                        className={`${styles.takeBtn} ${styles.twoBtn}`}
                        onClick={this.subscribeOrComplete}
                      >
                        订阅设置
                      </Button>
                    </div>
                  )
                  }
                  {cardStatus !== 0 && (
                    <Button
                      type="primary"
                      className={styles.takeBtn}
                      onClick={this.addTable}
                    >
                      新增
                    </Button>
                  )}
                </div>
                <Table
                  rowKey={ record => record.id }
                  className={styles.tableStyle}
                  columns={cardStatus === 0 ? reportColumns :cardStatus === 1? subscribeColumns: attentionColumns}
                  dataSource={cardStatus === 0 ? reportData : cardStatus === 1?subscribeData: attentionData}
                  size="middle"
                  loading={Focusloading||emailLoading||analyzeLoading}
                  scroll={{y: 'calc(100vh - 330px)' }}
                  pagination={{
                    size: 'large',
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal:this.showTotal,
                    // onShowSizeChange: this.onShowSizeChange,
                    current: cardStatus === 0 ? reportCurrent :cardStatus === 1? subscribeCurrent:attentionCurrent,
                    pageSize: cardStatus === 0 ?reportPageSize : cardStatus === 1? subscribePageSize: attentionPageSize,
                    total: cardStatus === 0 ? reportTotal :cardStatus === 1 ?subscribeTotal: attentionTotal,
                    onChange: this.onPageChange,
                  }}
                />
              </Card>
            </div>
        </div>
      </div>
    );
  }
}

export default AnalysisReport;
