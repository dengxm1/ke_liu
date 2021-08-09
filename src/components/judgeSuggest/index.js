import React, { useEffect } from 'react';
import styles from './index.less';
import ChartTitle from '../ChartTitle';
import utils from '../../utils/utils';
import {
  Card,
  Progress,
  Tooltip,
} from 'antd';

function JudgeSuggest({ timeCursor, distanceCursor, outCursor, inCursor }) {

  useEffect(() => {

  }, [timeCursor, distanceCursor, outCursor, inCursor]);

  const minDetail = ['小于20', '20~40', '40~60'];
  const min = [20, 40, 60];
  let defaultMinDetail = '大于60';
  for (let i = 0; i < min.length; i++) {
    if (timeCursor.value < min[i]) {
      defaultMinDetail = minDetail[i];
      break;
    }
  }
  const kmDetail = ['小于10KM', '10~20KM', '20~30KM'];
  const km = [10, 20, 30];
  let defaultKmDetail = '大于30KM';
  for (let i = 0; i < km.length; i++) {
    if (distanceCursor.value < km[i]) {
      defaultKmDetail = kmDetail[i];
      break;
    }
  }
  const outDetail = ['小于50%', '100%~150%', '150%~200%'];
  const out = [0.5, 1, 1.5];
  let defaultOutDetail = '大于200%';
  for (let i = 0; i < km.length; i++) {
    if (outCursor.value < out[i]) {
      defaultOutDetail = outDetail[i];
      break;
    }
  }

  return (
    <div className={styles.content}>
      <Card className={styles.progress_card}
            title={
              <div className={styles.card_title}>
                <div className={styles.title_icon_content}>
                  <span className={styles.react_icon}/>
                  <span className={styles.circle_icon}/>
                </div>
                <span className={styles.title_name}>出行时间</span>
              </div>
            }
      >
        <div className={styles.progress_graph}>
          <Tooltip title={timeCursor.value + 'min'}>
            <div className={`${styles.triangle} ${styles[timeCursor.colorKey]}`}
                 style={{ right: timeCursor.position }}/>
          </Tooltip>
          <Progress
            strokeColor={{
              '0%': '#EA2A25',
              '25%': '#FA6D35',
              '50%': '#FDC539',
              '100%': '#F6EF7F',
            }}
            percent={100}
          />
        </div>
        <div className={styles.labelContent}>
          <span>>60min</span>
          <span>60~40min</span>
          <span>40~20min</span>
          <span>{'<20min'}</span>
        </div>
      </Card>
      <Card
        className={styles.progress_card}
        title={
          <div className={styles.card_title}>
            <div className={styles.title_icon_content}>
              <span className={styles.react_icon}/>
              <span className={styles.circle_icon}/>
            </div>
            <span className={styles.title_name}>出行距离</span>
          </div>
        }
      >
        <div className={styles.progress_graph}>
          <Tooltip title={utils.getFloat(distanceCursor.value, 2) + 'KM'}>
            <div className={`${styles.triangle} ${styles[distanceCursor.colorKey]}`}
                 style={{ right: distanceCursor.position }}/>
          </Tooltip>
          <Progress
            strokeColor={{
              '0%': '#EA2A25',
              '25%': '#FA6D35',
              '50%': '#FDC539',
              '100%': '#F6EF7F',
            }}
            percent={100}
          />
        </div>
        <div className={styles.labelContent}>
          <span> >30KM </span>
          <span>  30-20KM  </span>
          <span> 20-10KM</span>
          <span>  {'<10KM'}  </span>
        </div>
      </Card>
      <Card
        className={styles.progress_card}
        title={
          <div className={styles.card_title}>
            <div className={styles.title_icon_content}>
              <span className={styles.react_icon}/>
              <span className={styles.circle_icon}/>
            </div>
            <span className={styles.title_name}>外出率</span>
          </div>
        }
      >
        <div className={styles.progress_graph}>
          <Tooltip title={utils.numberTranFormPercent(outCursor.value)}>
            <div className={`${styles.triangle} ${styles[outCursor.colorKey]}`}
                 style={{ right: outCursor.position }}/>
          </Tooltip>
          <Progress
            strokeColor={{
              '0%': '#EA2A25',
              '25%': '#FA6D35',
              '50%': '#FDC539',
              '100%': '#F6EF7F',
            }}
            percent={100}
          />
        </div>
        <div className={styles.labelContent}>
          <span>  >150%</span>
          <span>  150%~100%  </span>
          <span> 100%~50%  </span>
          <span>  {'<50%'} </span>
        </div>
      </Card>
      <Card
        className={styles.progress_card}
        title={
          <div className={styles.card_title}>
            <div className={styles.title_icon_content}>
              <span className={styles.react_icon}/>
              <span className={styles.circle_icon}/>
            </div>
            <span className={styles.title_name}>外来率</span>
          </div>
        }
      >
        <div className={styles.progress_graph}>
          <Tooltip title={utils.numberTranFormPercent(inCursor.value)}>
            <div className={`${styles.triangle} ${styles[inCursor.colorKey]}`} style={{ right: inCursor.position }}/>
          </Tooltip>
          <Progress
            strokeColor={{
              '0%': '#EA2A25',
              '25%': '#FA6D35',
              '50%': '#FDC539',
              '100%': '#F6EF7F',
            }}
            percent={100}
          />
        </div>
        <div className={styles.labelContent}>
          <span>  >150%</span>
          <span>   150%~100%  </span>
          <span> 100%~50%  </span>
          <span>  {'<50%'} </span>
        </div>
      </Card>
      <Card className={styles.suggest_card} title={<ChartTitle title='分析建议'/>}>
        <p>两地之间通勤时间在{defaultMinDetail}分钟范围，出行距离在{defaultKmDetail}范围左右，
          外出率为{utils.numberTranFormPercent(outCursor.value)}，外来率为{utils.numberTranFormPercent(inCursor.value)}.
          {/*          <span className={styles.high_light}>外出率较高、外来率较低。建议
            加密两地之间的公交线路班次，</span>以满足两地之间的公共出行需求。*/}
        </p>
      </Card>
    </div>
  );
}

export default JudgeSuggest;
