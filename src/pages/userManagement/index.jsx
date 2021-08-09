import React, { Component, useEffect, useState } from 'react';
import styles from './index.less';
import {
  Table,
  Tag,
  Select,
  Divider,
  Modal,
  Form,
  Input,
  Switch,
  Card,
  Button,
  Popconfirm,
  message,
  Pagination,
} from 'antd';
import { getUserList, addUser, editUser, resetPassword, delUser } from '../../services/userServ';
import utils from '../../utils/utils';
import JSEncrypt from 'jsencrypt'; //引入加密模块

const { Option } = Select;
const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};


function Index() {

  const prototypeFunc = new JSEncrypt();
  //非对称加密公钥
  prototypeFunc.setPublicKey('30819f300d06092a864886f70d010101050003818d0030818902818100be73c938637b92e7889c6a85e19e2afda03fed5b2bc6165625cb9d909cdafb7450ec75192ae38367595cb5bd03020130a8ca58510baafd50619b0d165e47437b652d9c95963433dbb19bc309ffe1a69f47c4285eca16cc7697e34668126494897bd5cc49b521b5b4c55a299f323f929c21d7a6b157c9f35cb91e9d9a42efe11b0203010001'); // 设置公钥

  const [form] = Form.useForm();
  const columns = [
    {
      title: '用户名称',
      dataIndex: 'username',
      key: 'username',
      render: text => <a>{text}</a>,
    }, {
      title: '角色',
      key: 'role',
      dataIndex: 'role',
      render: text => (
        <Tag color={text === '1' ? '#2db7f5' : '#87d068'}>
          {text === '1' ? '系统管理员' : '普通用户'}
        </Tag>
      ),
    }, {
      title: '操作',
      key: 'action',
      render: (text, record) => {
        const currentUserSelf = utils.localUserInfoGet().externalId === record.externalId; //自己不能删除自己
        return (
          <div>
            <Popconfirm
              title="你确定删除该用户？"
              onConfirm={() => delUserFunc(record.externalId)}
              okText="确定"
              cancelText="取消"
              disabled={currentUserSelf}
            >
              <Button size={'small'} disabled={currentUserSelf} type='primary'
                      danger>删除</Button>
            </Popconfirm>
            <Divider type="vertical"/>
            <Button size={'small'} type='primary' onClick={() => isEditUser(record)}>修改</Button>
          </div>
        );
      },
    },
  ];

  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const [row, setRow] = useState({});
  const [type, setType] = useState('');
  const [userList, setUserList] = useState([]);
  const [total, setTotal] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchUserList();
  }, [pageNum]);

  const fetchUserList = () => {
    setLoadingList(true);
    const params = { pageNum, pageSize };
    getUserList(params).then(res => {
      if (res.code === 200) {
        console.log('res', res.data);
        setUserList(res.data.records);
        setTotal(res.data.total);
        setLoadingList(false);
      }
    });
  };

  const delUserFunc = (id) => {
    delUser({ externalId: id }).then(res => {
      if (res.code === 200) {
        message.info('删除用户成功');
        fetchUserList();
      }
    });
  };

  const isEditUser = (record) => {
    form.setFieldsValue({
      userName: record.username,
      role: record.role,
    });
    setRow(record);
    setType('edit');
    setVisible(true);
  };
  const isAddUser = () => {
    setRow({});
    setType('add');
    setVisible(true);
  };


  const handelOk = (values) => {
    setModalLoading(true);
    const params = {
      externalId: row.externalId,
      role: values.role,
      isResetPwd: checked ? 1 : 0,
    };
    if (checked) {
      params.pwd = prototypeFunc.encrypt(values.password);
    }
    if (values.password) {
      values.password = prototypeFunc.encrypt(values.password);
    }
    if (type === 'add') {    //新增
      addUser(values).then(res => {
        if (res.code === 200) {
          message.success('新增用户成功');
          whenModalOkClearState();
        } else {
          setModalLoading(false);
        }
      });
    } else if (type === 'edit') {   //编辑
      editUser(params).then(res => {
        if (res.code === 200) {
          message.success('修改用户成功');
          whenModalOkClearState();
        }
      });
    } /*else if (checked && type === 'edit') {  //修改密码+编辑
      const fetchEditUser = () => {
        return editUser(params).then(res => {
          return res;
        });
      };
      const fetchRestPassword = () => {
        return resetPassword({
          externalId: row.externalId,
          pwd: values.password,
        }).then(res => {
          return res;
        });
      };
      const result = new Promise.all([fetchEditUser(), fetchRestPassword()]);
      result.then(res => {
        if (res[0].code === 200 && res[1].code === 200) {
          message.success('修改用户成功');
          whenModalOkClearState();
        }
      });
    }*/
  };

  const whenModalOkClearState = () => {
    setVisible(!visible);
    fetchUserList();
    form.resetFields();
    setRow({});
    setChecked(false);
    setModalLoading(false);
  };

  const handelCancel = () => {
    setVisible(!visible);
    setChecked(false);
    form.resetFields();
    setRow({});
    setType('');
  };

  const onChangeResetPassWord = (checked) => {
    setChecked(checked);
  };

  return (
    <div className={styles.wrap_user}>
      <Card title={<span style={{ fontWeight: 'bold' }}>用户管理</span>}
            extra={<Button type='link' style={{ fontWeight: 'bold' }}
                           onClick={() => isAddUser()}>新增用户</Button>}>
        <Table columns={columns} dataSource={userList} pagination={false}
               rowKey={'externalId'} loading={loadingList}/>
        <Pagination style={{ textAlign: 'end', marginTop: 20 }} onChange={(page) => setPageNum(page)} pageSize={10}
                    total={total}
                    current={pageNum}/>
      </Card>

      {visible &&
      <Modal
        visible={visible}
        onOk={() => {
          form.validateFields()
            .then((values) => {
              handelOk(values);
            })
            .catch((info) => {
              console.log('Validate Failed:', info);
            });
        }}
        onCancel={handelCancel}
        confirmLoading={modalLoading}
        title={type === 'edit' ? '编辑用户' : '新增用户'}
        maskClosable={false}>
        <Form
          preserve={false}
          {...layout}
          name="basic"
          /*          initialValues={{
                      userName: row.username,
                      role: row.role,
                    }}*/
          form={form}
        >
          {type === 'add' &&
          <>
            <Form.Item
              label="昵称"
              name="displayName"
              rules={[{
                required: true,
                message: '请输入昵称！',
              }, {
                whitespace: true,
              }]}
            >
              <Input maxLength={20} placeholder='请输入昵称'/>
            </Form.Item>
            <Form.Item
              label="手机号"
              name="phoneNumber"
              rules={[{
                required: true,
                message: '请输入手机号！',
              }, {
                pattern: /^1[3|4|5|7|8][0-9]\d{8}$/, message: '请输入正确的手机号',
              }]}
            >
              <Input placeholder='请输入手机号'/>
            </Form.Item>
          </>
          }
          <Form.Item
            label="用户名称"
            name="userName"
            rules={[{
              required: true,
              message: '请输入用户名称！',
            }, {
              pattern: /^[A-Za-z0-9_]+$/g, message: '只能输入英文、数字、下划线',
            }]}
          >
            <Input maxLength={20} disabled={type === 'edit'} placeholder='请输入用户名称'/>
          </Form.Item>
          {/*            <Form.Item
              label="确认密码"
              name="password2"
              rules={[{
                required: true,
                message: '请输入密码！',
              }, {
                  pattern: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{10,16}$/,
                message: '密码必须由大小写英文字母+数字+特殊符号组成8-16位',
              }]}
            >
              <Input.Password/>
            </Form.Item>*/}
          <Form.Item
            label="角色"
            name="role"
            rules={[{
              required: true,
              message: '请选择角色！',
            }]}
          >
            <Select placeholder='请选择角色'>
              <Option value="1">系统管理员</Option>
              <Option value="2">普通用户</Option>
            </Select>
          </Form.Item>
          {(checked || type === 'add') &&
          <Form.Item
            label="密码"
            name="password"
            rules={[{
              required: true,
              message: '请输入密码！',
            }, {
              pattern: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{10,16}$/,
              message: '密码必须由大小写英文字母+数字+特殊符号组成10-16位',
            }]}
          >
            <Input.Password placeholder='请输入密码'/>
          </Form.Item>}
          {type === 'edit' ? <Form.Item label="重置密码" name="reset">
            <Switch onChange={onChangeResetPassWord}/>
          </Form.Item> : null}
        </Form>
      </Modal>}
    </div>
  );
}

export default Index;
