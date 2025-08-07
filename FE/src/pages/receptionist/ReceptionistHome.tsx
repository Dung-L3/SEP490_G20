

import TaskbarRecptionist from '../../components/TaskbarReceptionist';

const ReceptionistHome = () => {
  return (
    <div style={{ display: 'flex' }}>
      <TaskbarRecptionist />
      <div style={{ marginLeft: '220px', padding: '24px', width: '100%' }}>
        <h1>Receptionist Page</h1>
        <p>Welcome to the receptionist page!</p>
      </div>
    </div>
  );
};

export default ReceptionistHome;
