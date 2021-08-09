import React, { Component } from 'react';
import {
  Form,
  Input,
  Select,
  Modal,
  message,
  Checkbox,
  Spin,
  Empty,
} from 'antd';
import {
  addTakeAttention,
  updataTakeAttention,
  getTakeSimple,
} from '../../services/report';
import styles from './index.less';

const { Option } = Select;
export default class PaperFormModal extends Component {
  form = React.createRef();
  state = {
    areaNameOption: [],
    modelLoading: false,
    selectLoading: false,
    showNone: false,
    open: false,
  };

  componentDidMount() {
    console.log('componentDidMount 关注设置');
    const { record } = this.props;
    if (record) {
      this.setState({
        modelLoading: true,
      });
      if (record.subUnitTypeNo) {
        this.setState({ areaType: record.subUnitTypeNo });
        this.getTakeSimple(record.subUnitTypeNo);
      }
    } else {
      this.setState({
        modelLoading: false,
      });
    }
  }

  //区域下拉列表
  getTakeSimple = subUnitTypeNo => {
    getTakeSimple({
      subUnitTypeNo,
    })
      .then(res => {
        this.setState({
          modelLoading: false,
          selectLoading: false,
        });
        if (res) {
          if (res.code === 200) {
            this.setState(
              {
                areaNameOption: res.data,
              },
              () => {
                const { record } = this.props;
                if (record) {
                  this.form.current.setFieldsValue({
                    name: record.subUnitTypeNo,
                    email: record.tfcunitId,
                    type: record.reportTypeNo.split(','),
                  });
                }
              },
            );
          }
        }
      })
      .catch(e => {
        this.setState({
          modelLoading: false,
          selectLoading: false,
        });
        console.log(e);
      });
  };

  onSave = values => {
    const { record } = this.props;
    const handleData = record
      ? updataTakeAttention
      : addTakeAttention;
    handleData({
      id: record ? record.id : '',
      reportTypeNo: values.type ? values.type.join(',') : '',
      subUnitTypeNo: values.name,
      tfcunitId: values.email,
    }).then(res => {
      if (res.code === 200) {
        message.success(this.props.record ? '修改成功' : '新增成功');
        this.props.showPaperModal(false);
        this.props.getTakeList();
      }
    });
  };

  //区域类型改变时的回调
  areaTypeChange = value => {
    this.form.current.setFieldsValue({ email: '' });
    this.setState({
      selectLoading: true,
      areaNameOption: [],
    }, () =>
      this.getTakeSimple(value));
    this.setState({ areaType: value });
  };
  //展开下拉菜单的回调
  dropdownVisibleChange = open => {
    const { areaType } = this.state;
    console.log('展开下拉菜单的回调', open);
    if (!areaType) {
      message.error('请先选择区域类型!');
      this.setState({
        open: false,
      });
    } else {
      this.setState({
        open,
      });
    }
  };

  render() {
    const { areaNameOption, modelLoading, selectLoading, open } = this.state;
    const { record } = this.props;
    console.log('render modelLoading', modelLoading, record);
    const layout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    const validateMessages = {
      required: '${label}不能为空!',
      types: {
        email: '${label}格式不对!',
      },
    };

    const options = [
      { label: '年', value: '年' },
      { label: '季', value: '季' },
      { label: '月', value: '月' },
      { label: '节假日', value: '节假日' },
    ];
    return (
      <div>
        <Modal
          title={`${record ? '编辑' : '新增'}`}
          width={600}
          visible={true}
          onCancel={() => this.props.showPaperModal(false)}
          // footer={<Button onClick={()=>this.props.showFormModal(false)}>关闭</Button>}
          onOk={() => this.form.current.submit()}
        >
          <Spin spinning={modelLoading}>
            <Form
              {...layout}
              ref={this.form}
              name="nest-messages"
              onFinish={this.onSave}
              validateMessages={validateMessages}
              // initialValues={{
              //     name: '',
              //     email: '',
              //     type: [],
              // }}
            >
              {/*record ? record.subUnitTypeNo
                        record ? record.tfcunitId
                        record.reportTypeNo.split(',')
                        */}
              <Form.Item
                name={'name'}
                label="区域类型"
                rules={[{ required: true }]}
              >
                <Select placeholder="请选择" onChange={this.areaTypeChange}>
                  <Option value="0101">交通小区</Option>
                  <Option value="0102">交通中区</Option>
                  <Option value="0103">交通大区</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name={'email'}
                label="区域名称"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="请选择"
                  open={open}
                  onDropdownVisibleChange={this.dropdownVisibleChange}
                  notFoundContent={
                    <div>
                      {selectLoading ? (
                        <Spin
                          tip="加载中"
                          className={styles.selectLoading}
                        ></Spin>
                      ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                      )}
                    </div>
                  }
                >
                  {areaNameOption.map(item => (
                    <Option key={item.tfcunitId} value={item.tfcunitId} title={item.tfcunitName}>
                      {item.tfcunitName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name={'type'}
                label="报告类型"
                rules={[{ required: true }]}
              >
                <Checkbox.Group options={options}/>
              </Form.Item>
            </Form>
          </Spin>
        </Modal>
      </div>
    );
  }
}
