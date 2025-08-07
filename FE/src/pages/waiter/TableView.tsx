
import React from 'react';
import TaskbarWaiter from '../../components/TaskbarWaiter';
import TableMap from '../../components/TableMap';

const TableView: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <TaskbarWaiter />
      <div className="hidden md:block w-56" />
      <main className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Sơ đồ bàn</h1>
        <TableMap />
      </main>
    </div>
  );
};

export default TableView;
