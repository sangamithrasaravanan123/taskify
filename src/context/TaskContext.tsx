import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { Task, TaskGroup, TaskPriority, TaskStatus } from '../types';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

interface TaskState {
  tasks: Task[];
  taskGroups: TaskGroup[];
  isLoading: boolean;
  error: string | null;
}

interface TaskContextType extends TaskState {
  createTask: (task: Omit<Task, '_id' | 'createdAt' | 'updatedAt' | 'assignedBy'>) => Promise<Task>;
  updateTask: (id: string, task: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  getTasksByUser: () => Promise<void>;
  getTaskById: (id: string) => Promise<Task>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

type TaskAction =
  | { type: 'TASKS_LOADING' }
  | { type: 'TASKS_LOADED'; payload: Task[] }
  | { type: 'TASK_CREATED'; payload: Task }
  | { type: 'TASK_UPDATED'; payload: Task }
  | { type: 'TASK_DELETED'; payload: string }
  | { type: 'TASKS_ERROR'; payload: string };

const initialState: TaskState = {
  tasks: [],
  taskGroups: [],
  isLoading: false,
  error: null,
};

const groupTasksByPriority = (tasks: Task[]): TaskGroup[] => {
  const highPriority = tasks.filter(task => task.priority === TaskPriority.HIGH);
  const mediumPriority = tasks.filter(task => task.priority === TaskPriority.MEDIUM);
  const lowPriority = tasks.filter(task => task.priority === TaskPriority.LOW);

  return [
    { title: 'High Priority', tasks: highPriority },
    { title: 'Medium Priority', tasks: mediumPriority },
    { title: 'Low Priority', tasks: lowPriority },
  ];
};

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'TASKS_LOADING':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'TASKS_LOADED':
      return {
        ...state,
        isLoading: false,
        tasks: action.payload,
        taskGroups: groupTasksByPriority(action.payload),
        error: null,
      };
    case 'TASK_CREATED':
      const newTasks = [...state.tasks, action.payload];
      return {
        ...state,
        tasks: newTasks,
        taskGroups: groupTasksByPriority(newTasks),
        isLoading: false,
      };
    case 'TASK_UPDATED':
      const updatedTasks = state.tasks.map(task => 
        task._id === action.payload._id ? action.payload : task
      );
      return {
        ...state,
        tasks: updatedTasks,
        taskGroups: groupTasksByPriority(updatedTasks),
        isLoading: false,
      };
    case 'TASK_DELETED':
      const filteredTasks = state.tasks.filter(task => task._id !== action.payload);
      return {
        ...state,
        tasks: filteredTasks,
        taskGroups: groupTasksByPriority(filteredTasks),
        isLoading: false,
      };
    case 'TASKS_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      getTasksByUser();
    }
  }, [isAuthenticated]);

  const getTasksByUser = async () => {
    if (!token) return;
    
    try {
      dispatch({ type: 'TASKS_LOADING' });
      const response = await axios.get(`${API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Check for tasks that are past due date and update status
      const updatedTasks = response.data.map((task: Task) => {
        if (task.status !== TaskStatus.COMPLETED && 
            new Date(task.dueDate) < new Date() && 
            task.status !== TaskStatus.PENDING) {
          return { ...task, status: TaskStatus.PENDING };
        }
        return task;
      });
      
      dispatch({ type: 'TASKS_LOADED', payload: updatedTasks });
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to fetch tasks';
      dispatch({ type: 'TASKS_ERROR', payload: errorMessage });
    }
  };

  const getTaskById = async (id: string): Promise<Task> => {
    if (!token) throw new Error('Authentication required');
    
    try {
      const response = await axios.get(`${API_URL}/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to fetch task';
      dispatch({ type: 'TASKS_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const createTask = async (task: Omit<Task, '_id' | 'createdAt' | 'updatedAt' | 'assignedBy'>): Promise<Task> => {
    if (!token) throw new Error('Authentication required');
    
    try {
      dispatch({ type: 'TASKS_LOADING' });
      const response = await axios.post(`${API_URL}/api/tasks`, task, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch({ type: 'TASK_CREATED', payload: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to create task';
      dispatch({ type: 'TASKS_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const updateTask = async (id: string, task: Partial<Task>): Promise<Task> => {
    if (!token) throw new Error('Authentication required');
    
    try {
      dispatch({ type: 'TASKS_LOADING' });
      const response = await axios.put(`${API_URL}/api/tasks/${id}`, task, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch({ type: 'TASK_UPDATED', payload: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to update task';
      dispatch({ type: 'TASKS_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    if (!token) throw new Error('Authentication required');
    
    try {
      dispatch({ type: 'TASKS_LOADING' });
      await axios.delete(`${API_URL}/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch({ type: 'TASK_DELETED', payload: id });
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to delete task';
      dispatch({ type: 'TASKS_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        ...state,
        createTask,
        updateTask,
        deleteTask,
        getTasksByUser,
        getTaskById,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};