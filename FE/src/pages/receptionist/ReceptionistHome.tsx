import React from 'react';

import TaskbarRecptionist from '../../components/TaskbarReceptionist';

const ReceptionistHome = () => {
  return (
    <div style={{ display: 'flex' }}>
      <TaskbarRecptionist />
      <div style={{ marginLeft: '220px', padding: '24px', width: '100%' }}>
        <h1>Trang Lễ Tân</h1>
        <p>Chào mừng bạn đến với trang Lễ tn!</p>
      </div>
    </div>
  );
};

export default ReceptionistHome;
