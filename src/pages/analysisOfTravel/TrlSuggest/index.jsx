import React, { Component } from 'react';
import styles from './index.less';
import TrlSuggestComp from '../../../components/TrlSuggestComp/index';
import { Card, Spin } from 'antd';
import ChartTitle from '../../../components/ChartTitle';
import introduce from '../../../static/introduce.png';
import utils from '../../../utils/utils';

class Index extends Component {


  /**
   * 字符串转数组
   * @param string
   * @param start  取的位置
   * @param end  取的位置
   */
  stringToArray = (string, start, end) => {
    if (!string) return [];
    let data = string.split(',');
    return data;
  };

  render() {
    const { suggestData, loading } = this.props;


    const publicTrafficRatio = this.stringToArray(suggestData && suggestData.publicTrafficRatio);
    const roadCongestion = this.stringToArray(suggestData && suggestData.roadCongestion);
    const travelTime = this.stringToArray(suggestData && suggestData.travelTime);
    const travellerCnt = this.stringToArray(suggestData && suggestData.travellerCnt);

    const position = [1, 2, 3];
    //客流出行人数
    const travellerCntData = travellerCnt.slice(1, 4);
    console.log('travellerCntData',travellerCntData);
    let travellerCntInfo = { toolTip: Number(travellerCnt[0]), position: 4 };
    for (let i = 0; i < travellerCntData.length; i++) {
      if (Number(travellerCnt[0]) <= travellerCntData[i]) {
        travellerCntInfo = { toolTip: Number(travellerCnt[0]), position: position[i] };
        break;
      }
    }
    //道路拥挤程度
    const roadCongestionData = roadCongestion.slice(1, 4);
    let roadCongestionInfo = { toolTip: utils.getFloat(Number(roadCongestion[0])), position: 4 };
    for (let i = 0; i < roadCongestionData.length; i++) {
      if (Number(roadCongestion[0]) <= roadCongestionData[i]) {
        roadCongestionInfo = { toolTip: utils.numberTranFormPercent(Number(roadCongestion[0])), position: position[i] };
        break;
      }
    }
    //出行时间
    const timeData = travelTime.slice(1, 4);
    let timeInfo = { toolTip: Number(travelTime[0]) + 'min', position: 4 };
    for (let i = 0; i < timeData.length; i++) {
      if (Number(travelTime[0]) <= timeData[i]) {
        timeInfo = { toolTip: Number(travelTime[0]) + 'min', position: position[i] };
        break;
      }
    }
    //公共交通分担率
    const publicTrafficRatioData = publicTrafficRatio.slice(1, 4);
    let publicTrafficRatioInfo = { toolTip: utils.numberTranFormPercent(Number(publicTrafficRatio[0])), position: 4 };
    for (let i = 0; i < publicTrafficRatioData.length; i++) {
      if (Number(publicTrafficRatio[0]) <= publicTrafficRatioData[i]) {
        publicTrafficRatioInfo = {
          position: position[i],
          toolTip: utils.numberTranFormPercent(Number(publicTrafficRatio[0])),
        };
        break;
      }
    }

    const time = ['>60min', '60-40min', '40-20min', '<20min'];
    const publicPercent = ['公共出行为主', '公共出行居多', '基本持平', '其他出行居多'];
    const road = ['非常拥堵', '拥堵', '基本畅通', '畅通'];
    const people = ['非常多', '较多', '正常', '偏少'];

    const showTexttime = [...time].reverse();
    const showTextpublicPercent = [...publicPercent].reverse();
    const showTextroad = [...road].reverse();
    const showTextpeople = [...people].reverse();

    return (
      <div className={styles.wrap_suggest}>
        <Spin spinning={loading}>
          <TrlSuggestComp dataInfo={travellerCntInfo} title={'客流出行人数'} text={people}/>
          <TrlSuggestComp dataInfo={roadCongestionInfo} title={'道路拥堵程度'} text={road}/>
          <TrlSuggestComp dataInfo={timeInfo} title={'出行时间'} text={time}/>
          <TrlSuggestComp dataInfo={publicTrafficRatioInfo} title={'公共交通机动化出行分担率'} text={publicPercent}/>

          <Card className={styles.wrap_card1}
                title={<div>分析建议</div>}>
            <div className={styles.show_text}>
              分析建议：两地之间有{utils.transform(Number(travellerCnt[0]))}的客流出行人数，主要通行道路{showTextroad[roadCongestionInfo.position - 1]}，
              人群出行以{showTextpublicPercent[publicTrafficRatioInfo.position - 1]}，总体出行时间分布在{showTexttime[timeInfo.position - 1]}范围。
            </div>

          </Card>
        </Spin>
      </div>
    );
  }
}

export default Index;
