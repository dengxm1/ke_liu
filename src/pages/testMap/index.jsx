import React, { Component } from 'react';
import { Map, TileLayer } from 'react-leaflet';
import styles from '../analysisOfTravel/index.less';
import { connect } from 'dva';

@connect(({ global, loading }) => {
  return { ...global, mapAreaLoading: loading.effects['global/fetchMapArea'] };
})
class Index extends Component {

  componentDidMount() {
    this.map = this.refs.map.contextValue.map;
    // this.renderMapArea(res);
    this.fetchMapArea();
  }

  //获取地图分块数据
  fetchMapArea = () => {
    this.props.dispatch({
      type: 'global/fetchMapArea',
      payload: { unitType: '0103', pageSize: 50, pageNum: 1 },
      callback: (res) => {
        if (this.map) {
          this.setState({
            createResMapArea: res.records,
          });
          console.log('res.records', res.records);
          this.renderMapArea(res.records);
          // this.setMapAreaName(res.records);
        }
      },
    });
  };

  //渲染地图区块
  renderMapArea = (data) => {
    const latlngData = [];
    data.forEach(item => {
      console.log('item',item)
      // let aaa = item.geometry.coordinates.flat();//数组扁平化处理
      let aaa = JSON.parse(item.boundPoly).flat();
      aaa[0].forEach(item => {
        item.reverse();
      });
      aaa[1] && aaa[1].forEach(item => {
        item.reverse();
      });
      const polygon = L.polygon(aaa, {
        color: '#0b80ef', //描边颜色
        weight: 1, //描边线条大小
        // zoneId: item.tfcunitId,
        fillColor: '#5eb9e2', //填充颜色
        fillOpacity: 0.5,
        flag: item.properties,
      }).on('click', e => {
        const layer = e.target;
        console.log('e', item);
        layer.setStyle({
          // color: '#0B80EF', //描边颜色
          fillColor: 'rgba(44,161,80,0.7)', //填充颜色
          flag: false,
          fromOrTo: 'isFrom',
        });
      });
      latlngData.push(polygon);
    });
    this.originArea = new L.layerGroup(latlngData).addTo(this.map);
  };

  render() {
    const { mapThemeUrlObj } = this.props;
    return (
      <div className={styles.wrap_travel}>
        <Map
          ref="map"
          zoomControl={false}
          className={styles.map_style}
          center={[34.635803, 113.658109]}
          minZoom={6}
          maxZoom={18}
          zoom={10}
        >
          <TileLayer url={mapThemeUrlObj.mapImg} subdomains={[]}/>
          <TileLayer url={mapThemeUrlObj.mapPoi} subdomains={[]}/>
        </Map>
      </div>
    );
  }
}

export default Index;
