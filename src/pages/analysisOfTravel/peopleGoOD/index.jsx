import React, { Component, useEffect } from 'react';
import styles from './index.less';
import { Card, Tabs, Table, Badge } from 'antd';
import PeopleGoAnalysis from '../peopleGoAnalysis';

const { TabPane } = Tabs;

function Index({}) {
  const callbackTabs = key => {
    console.log('key', key);
  };

  const columns = [
    {
      title: '区域名称',
      dataIndex: 'name',
      key: 'name',
      render: text => (
        <span>
          <Badge status="processing" color="#0B80EF" />
          {text}
        </span>
      ),
    },
    {
      title: '出行人次',
      dataIndex: 'age',
      key: 'age',
    },
  ];

  const data = [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
      tags: ['nice', 'developer'],
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
      tags: ['loser'],
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
      tags: ['cool', 'teacher'],
    },
  ];

  return (
    <div className={styles.wrap_od}>
      <Tabs defaultActiveKey="1" onChange={callbackTabs}>
        <TabPane tab="出发地" key="from">
          <Table columns={columns} dataSource={data} pagination={false} />
        </TabPane>
        <TabPane tab="目的地" key="to">
          <Table columns={columns} dataSource={data} pagination={false} />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default Index;
