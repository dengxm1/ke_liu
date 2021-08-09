import React, { Component, Fragment, useEffect } from 'react';
import { Map, Marker, Popup, Tooltip } from 'react-leaflet';
import styles from './index.less';
import { Row, Col, Tooltip as TooltipAnt, Divider, Space, Spin } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import utils from '../../utils/utils';

function Index({
                 visible, position, popInfo = {}, closePopup, distance, popLoading, peopleNum = '', fromName = '',
                 arriveName = '', unit = 'km', unitTip = '直线距离', leftText = '客流量',
               }) {
  const busArray = popInfo.tansitLine ? popInfo.tansitLine.split(';') : [];
  useEffect(() => {

  }, [popInfo]);

  return <Fragment>
    {visible && <Popup position={position}>
      <Spin spinning={popLoading} tip={'数据加载中...'} delay={0.6}>
        <div className={styles.wrap_pop_content}>
          <Row gutter={24} justify='space-between' className={styles.from_arrive}>
            <div className={styles.self_close_icon} onClick={closePopup}>
              <CloseOutlined style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}/>
            </div>
            <Col span={12} className={styles.pop_from}>出发地：{fromName}</Col>
            <Col span={12} className={styles.pop_arrive}>目的地：{arriveName}</Col>
          </Row>
          <Row justify='space-between' className={styles.distance_people}>
            <Col span={11}>
              <span className={styles.number}>{distance} <span>{unit}</span></span>
              <span className={styles.text}>{unitTip}</span>
            </Col>
            <Col span={2} className={styles.gor}> <Divider type="vertical"/></Col>
            <Col span={11}>
              <span className={styles.number}>
                    {utils.transform(peopleNum, 2, true)[0]}
                <span>{utils.transform(peopleNum, 2, true)[1]}人次</span>
                </span>
              <span className={styles.text}>{leftText}</span>
            </Col>
          </Row>
          <div className={styles.detail}>
            <p>公交出行线路：</p>
            <div className={styles.busLine}>
              {busArray && busArray.map(item => {
                const info = item.split(',');
                return <TooltipAnt key={item}
                                   title={<div className={styles.wrap_tip}>{info[1] + '人次'}</div>}>
                  <span className={styles.show_line}>{info[0] + '路'}</span>
                </TooltipAnt>;
              })}
            </div>
            <div className={styles.item_num}>
              <p>轨交出行客流量：<span>{popInfo && popInfo.metroCnt}</span></p>
              <p>网约客流量：<span>{popInfo && popInfo.carCnt}</span></p>
              {/*<p>共享单车客流量：<span>{popInfo && popInfo.bicycleCnt}</span></p>*/}
            </div>
          </div>
        </div>
      </Spin>
    </Popup>}
  </Fragment>;
}

export default Index;
