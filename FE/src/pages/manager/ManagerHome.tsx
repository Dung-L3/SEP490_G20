import React from 'react';

import TaskbarManager from '../../components/TaskbarManager';

const ManagerHome = () => {
  return (
    <div style={{ display: 'flex' }}>
      <TaskbarManager />
      <div style={{ marginLeft: '220px', padding: '24px', width: '100%' }}>
        <h1>Manager Page</h1>
        <p>Welcome to the manager page!</p>
      </div>
    </div>
  );
};

export default ManagerHome;
