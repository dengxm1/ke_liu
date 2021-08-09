import React, { PureComponent } from 'react';
import styles from './index.less';
import { Col, Row } from 'antd';
import chuzu from '../../static/chuzukeliuliang.png';
import utils from '../../utils/utils';
import up from '../../static/up.png';
import down from '../../static/down.png';

class Index extends PureComponent {


  //转换百分比计算
  transFormPer = (cur, last) => {
    if (!last) {
      return '--%';
    }
    const data = Number((cur - last) / last / 100);
    const percent = utils.getFloat(data, 3, true);
    if (percent === '0.000') {
      return null;  //基本持平
    }
    return `${percent}%`;
  };

  render() {
    const { imgFlag, staticText, data = {} } = this.props;
    const upOrDown = data.cur - data.last > 0;
    return (
      <div className={styles.desc_item}>
        <Row>
          <Col span={5}>
            <img src={imgFlag} alt=""/> 
          </Col>
          <Col span={13}>
            <p className={styles.static_number} title={data.cur}>
              {data ? utils.transform(data.cur) : 0}人次
            </p>
            <p className={styles.static_text}>{staticText}</p>
          </Col>
          <Col span={6}>
            {this.transFormPer(data.cur, data.last) ?
              <>
                <p className={styles.set_p_height}>
                  <img src={upOrDown ? up : down} alt=""
                       className={`${upOrDown ? styles.imgMoveUp : styles.imgMoveDown}`}/>
                </p>
                <p style={{ fontWeight: 600, color: upOrDown ? '#DA1414' : '#2CA150' }}>
                  {this.transFormPer(data.cur, data.last)}
                </p>
              </> : <p style={{ fontWeight: 600, color: 'rgb(51 152 182)', marginTop: 25 }}>基本持平</p>
            }
          </Col>
        </Row>
      </div>
    );
  }
}

export default Index;
