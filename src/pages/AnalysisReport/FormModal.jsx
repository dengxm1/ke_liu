import React, { Component } from 'react';
import { Form, Input, Select, Modal, message, Checkbox  } from 'antd';
import { addEmial, updataEmial } from '../../services/report';

const { Option } = Select;
export default class FormModal extends Component {
  form = React.createRef();
  onSave = values => {
    const handleData = this.props.record ? updataEmial : addEmial;
    handleData({
      ccPeople: values.name,
      emailAddress: values.email,
      reportTypeNo: values.type ? values.type.join(',') : '',
      id: this.props.record ? this.props.record.id : '',
    }).then(res => {
      if (res.code === 200) {
        message.success(this.props.record ? '修改成功' : '新增成功');
        this.props.showFormModal(false);
        this.props.getSubscribeList();
      }
    });
  };
  render() {
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
    const record = this.props.record;
    const options = [
      { label: '年', value: '年' },
      { label: '季', value: '季' },
      { label: '月', value: '月' },
      { label: '节假日', value: '节假日' },
    ];
    return (
      <div>
        <Modal
          title={`${record ? '编辑' : '新增'}订阅`}
          width={600}
          visible={true}
          onCancel={() => this.props.showFormModal(false)}
          // footer={<Button onClick={()=>this.props.showFormModal(false)}>关闭</Button>}
          onOk={() => this.form.current.submit()}
        >
          <Form
            {...layout}
            ref={this.form}
            name="nest-messages"
            onFinish={this.onSave}
            validateMessages={validateMessages}
            initialValues={{
              name: record ? record.ccPeople : '',
              email: record ? record.emailAddress : '',
              type: record && record.reportTypeNo
                  ? record.reportTypeNo.split(',')
                  : [],
            }}
          >
            <Form.Item
              name={'name'}
              label="抄送人"
              rules={[{ required: true }]}
            >
              <Input maxLength={64}/>
            </Form.Item>
            <Form.Item
              name={'email'}
              label="邮箱地址"
              rules={[{ required: true }, { type: 'email' }]}
            >
              <Input  maxLength={128}/>
            </Form.Item>
            <Form.Item
              name={'type'}
              label="报告类型"
              rules={[{ required: true }]}
            >
              {/* <Select mode="multiple" placeholder="请选择">
                <Option value="年">年</Option>
                <Option value="季">季</Option>
                <Option value="月">月</Option>
                <Option value="周">周</Option>
                <Option value="节假日">节假日</Option>
              </Select> */}
               <Checkbox.Group options={options} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }
}
