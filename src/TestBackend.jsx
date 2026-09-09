import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { taskService } from '../services/taskService';

const TestBackend = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const loadTasks = async () => {
      if (user) {
        const data = await taskService.getTasks(user.id);
        setTasks(data);
      }
    };
    loadTasks();
  }, [user]);

  return (
    <div className="p-4">
      <h2>Tasks: {tasks.length}</h2>
      {tasks.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  );
};

export default TestBackend;