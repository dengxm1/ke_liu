import React, { Component } from 'react';
import { Button, Card, DatePicker, Form, Radio, Select, Tooltip, Tag } from 'antd';
import { CloseCircleFilled } from '@ant-design/icons';
import styles from './index.less';
import to from '../../static/出发icon.png';
import moment from 'moment';
import utils from '../../utils/utils';

const text = window.location.pathname === '/analysisOfTravel' ? '出行' : '通勤';
const optionsAreaType = [
  { label: '交通大区', value: '0103' },
  { label: '交通中区', value: '0102' },
  { label: '交通小区', value: '0101' },
];
const optionsTripMode = [
  { label: '全量'+text, value: '-1' },
  { label: '公交'+text, value: '1' },
  { label: '轨交'+text, value: '2' },
  { label: '巡游车', value: '3' },
  { label: '网约车', value: '4' },
];
const optionsTravalPeriod = [
  { label: '全部', value: '-1' },
  { label: '工作日', value: '99' },
  { label: '非工作日', value: '100' },
];
const { Option } = Select;

class CardForm extends Component {
  formRef = React.createRef();
  state = {
    // statMonth: moment(new Date().toLocaleDateString(), 'YYYY-MM'), //月份
    statMonth: moment().subtract(1, 'months'), //默认月份往前一个月，因为当前月份不可选
    areaType: '0103', //区域类型
    tripMode: '-1', //出行方式
    travalPeriod: '-1', //出行周期
    travalTime: '0', //出发时间
    tfcunitIds: [], //选中的区块数组
    exitOption: null, //下拉框选中的地区id
    regionsLoading: false,
    fullOut:1
  };

  componentDidMount() {
    this.props.onRef(this);
  }

  //开始分析
  onFinish = (fieldsValue) => {
    const values = {
      ...fieldsValue,
      'statMonth': fieldsValue['statMonth'].format('YYYYMM'),
    };
    this.props.onFinish(values);
  };

  //区域类型选择
  handleAreaType = e => {
    console.log('e', e);
  };


  //日期选择
  datePickerChange = (date) => {
    this.formRef.current.resetFields(['exitOption']);
    this.props.onSetStatMonth(date.format('YYYYMM'));
    this.setState({exitOption: ''})
  };

  //大，中，小区选择
  changeTrlAreaType = (e) => {
    this.formRef.current.resetFields(['exitOption']);
    this.props.onChangeTrlAreaType(e.target.value);
    this.setState({
      areaType: e.target.value,
      exitOption: ''
    });
  };

  //下拉框选中的变化;
  regionsChange = (valueArr) => {
    const { selectOptionArea } = this.props;
    this.formRef.current.resetFields(['exitOption']);
    this.setState({exitOption: ''})
    const selectArr = [];
    // selectOptionArea.forEach(item => {
    //   if (item.tfcunitId === valueArr) {
    //     item.fillColor = 'rgba(44,161,80,0.7)'; //填充颜色
    //     selectArr.push(item);
    //   }
    // });
    // this.props.onRenderMapUnit(selectArr);
    this.props.onRenderMapNew(valueArr);
  };

  //设置选中选项
  setChildSelected = (value) => {
    this.formRef.current.setFieldsValue({ 'exitOption': value.join(',') });
    this.setState({exitOption: value.join(',')})
  };

  //清空所有
  clearSelectArea = () => {
    this.formRef.current.resetFields(['exitOption']);
    this.setState({exitOption: ''})
    this.props.onclearSelectArea();
    this.props.mapResetView();
  };

  //区域选择
  selectArea = () => {
    const {analyzeResult} = this.props;
    if (analyzeResult.length>0){
       this.clearSelectArea();
    }
    this.props.onSelectArea();
  };

  selectTag = (props) => {
    const { label } = props;
    return (
      <div>
        {
          label.length > 12 ?
            <Tooltip placement="topLeft" title={label}>
              <Tag closable={false} style={{ marginRight: 3 }} className={styles.tagStyle}>
                {label}
              </Tag>
            </Tooltip>
            : <Tag closable={false} style={{ marginRight: 3 }} className={styles.tagStyle}>
              {label}
            </Tag>
        }
      </div>
    );
  };

  filterOption = (input, option) => {
    return option.children.indexOf(input) >= 0;
  };

  //设置全维度日期类型
  setTravalPeriod = (e)=>{
    this.props.onSetTravalPeriod(e.target.value)
  }

  render() {
    const { statMonth, areaType, tripMode, travalPeriod, travalTime, regionsLoading, exitOption } = this.state;
    const { selectOptionArea } = this.props;
    return (
      <div>
        <Card
          bordered={false}
          className={
            styles.analyzeCard2
          }
        >
          <Form
            ref={this.formRef}
            name="control-ref"
            onFinish={this.onFinish}
            initialValues={{
              statMonth,
              areaType,
              tripMode,
              travalPeriod,
              travalTime,
              goOrArrive:'go'
              // fullOut
            }}
            onValuesChange={this.handleAreaType}
          >
            {/*选择日期*/}
            <Form.Item
              name="statMonth"
              rules={[
                {
                  required: true,
                  message: '请选择月份',
                },
              ]}
            >
              <DatePicker picker="month" disabledDate={utils.returnDisabledMonth} allowClear={false}
                          onChange={this.datePickerChange}/>
            </Form.Item>
            {/*全量出行*/}
            <Form.Item
              name="tripMode"
              rules={[
                {
                  required: true,
                  message: '全量'+text,
                },
              ]}
            >
              <Select options={optionsTripMode}/>
            </Form.Item>
            {/*区域类型*/}
            <Form.Item
              name="areaType"
              rules={[
                {
                  required: true,
                  message: '请选择区域类型',
                },
              ]}
            >
              <Radio.Group
                options={optionsAreaType}
                optionType="button"
                onChange={this.changeTrlAreaType}
              />
            </Form.Item>
            {/*出行方式*/}
         {/*   <Form.Item
              name="tripMode"
              rules={[
                {
                  required: true,
                  message: '请选择出行方式',
                },
              ]}
            >
              <Radio.Group
                options={optionsTripMode}
                optionType="button"
              />
            </Form.Item>*/}
            {/*出行周期*/}
            <Form.Item
              name="travalPeriod"
              rules={[
                {
                  required: true,
                  message: `请选择${text}周期`,
                },
              ]}
            >
              <Radio.Group
                options={optionsTravalPeriod}
                optionType="button"
                onChange={this.setTravalPeriod}
              />
            </Form.Item>
            <Form.Item name="exitOption" className={styles.selectItem}>
              <Select
                autoClearSearchValue
                showSearch
                loading={regionsLoading}
                onChange={this.regionsChange}
                defaultActiveFirstOption={false}
                value={exitOption}
                notFoundContent={null}
                filterOption={(input, option) => this.filterOption(input, option)}
                // disabled={this.props.flyData.length > 0}
                suffixIcon={
                  exitOption?
                  <span onClick={this.clearSelectArea}><CloseCircleFilled/></span>:
                  <Tooltip placement="top" title={'点击图标选中区域'}>
                   <img src={to} alt="" onClick={this.selectArea}/>
                 </Tooltip>
                }
              >
                {
                  selectOptionArea.map(item => (
                    <Option
                      key={item.tfcunitId}
                      value={item.tfcunitId}
                      title={item.tfcunitName}
                      // disabled={item.disabled}
                    >
                      {item.tfcunitName}
                    </Option>
                  ))
                }
              </Select>
            {/*  <Form.Item>
                <Tooltip placement="top" title={<span>点击图标选中区域</span>}>
                  <img src={to} alt="" onClick={this.selectArea} className={styles.selectArea}/>
                </Tooltip>
                <Button
                  type="primary"
                  onClick={this.clearSelectArea}>
                  清空
                </Button>
              </Form.Item>*/}
            </Form.Item>
            <Form.Item
              name="goOrArrive"
              // style={{ marginBottom: '0' }}
            >
              <Radio.Group
                className={styles.go_or_arrive}
              >
                <Radio.Button value="go">出发</Radio.Button>
                <Radio.Button value="arrive">到达</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="button"
              style={{ marginBottom: '0' }}
            >
              <div className={styles.btnContain}>
                <Button
                  type="primary"
                  htmlType="submit"
                  className={styles.analyzeBtn}
                >
                  开始分析
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
  }
}

export default CardForm;
