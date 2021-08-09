import React, { Component } from 'react';
import { Spin } from 'antd';

class Loading extends Component {
  render() {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          textAlign: 'center',
          paddingTop: 300,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }
}

export default Loading;
