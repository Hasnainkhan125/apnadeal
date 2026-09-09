import { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { useAuth } from '../contexts/AuthContext';

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTasks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await taskService.getTasks(user.id);
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData) => {
    try {
      const newTask = await taskService.addTask({
        ...taskData,
        user_id: user.id
      });
      setTasks([newTask, ...tasks]);
      return newTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const updated = await taskService.updateTask(id, updates);
      setTasks(tasks.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      await taskService.deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

  return { tasks, loading, error, addTask, updateTask, deleteTask, refresh: loadTasks };
};