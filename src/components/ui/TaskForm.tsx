import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus } from '../../types';
import Button from './Button';
import Input from './Input';
import { Calendar, Clock, Info, Users, AlertCircle } from 'lucide-react';

interface TaskFormProps {
  initialTask?: Partial<Task>;
  onSubmit: (task: Partial<Task>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialTask,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [task, setTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    dueDate: new Date().toISOString().split('T')[0],
    ...initialTask,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialTask) {
      // Format the date for the input
      const formattedDueDate = initialTask.dueDate 
        ? new Date(initialTask.dueDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
        
      setTask({
        ...initialTask,
        dueDate: formattedDueDate,
      });
    }
  }, [initialTask]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!task.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!task.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    onSubmit(task);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
      <Input
        id="title"
        name="title"
        label="Task Title"
        placeholder="Enter task title"
        value={task.title || ''}
        onChange={handleChange}
        error={errors.title}
        required
        leftIcon={<Info size={16} />}
      />
      
      <div className="mb-4">
        <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Enter task description"
          value={task.description || ''}
          onChange={handleChange}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="priority" className="block mb-1 text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            className="input"
            value={task.priority}
            onChange={handleChange}
          >
            <option value={TaskPriority.LOW}>Low</option>
            <option value={TaskPriority.MEDIUM}>Medium</option>
            <option value={TaskPriority.HIGH}>High</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="status" className="block mb-1 text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="input"
            value={task.status}
            onChange={handleChange}
          >
            <option value={TaskStatus.TODO}>To Do</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.COMPLETED}>Completed</option>
            <option value={TaskStatus.PENDING}>Pending</option>
          </select>
        </div>
      </div>
      
      <Input
        id="dueDate"
        name="dueDate"
        type="date"
        label="Due Date"
        value={task.dueDate || ''}
        onChange={handleChange}
        error={errors.dueDate}
        leftIcon={<Calendar size={16} />}
        min={new Date().toISOString().split('T')[0]}
      />
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {initialTask?._id ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;