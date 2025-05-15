import React from 'react';
import { format } from 'date-fns';
import { CheckCircle, Clock, Calendar, Edit, Trash2 } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const priorityClasses = {
    [TaskPriority.LOW]: 'bg-success-100 text-success-800',
    [TaskPriority.MEDIUM]: 'bg-warning-100 text-warning-800',
    [TaskPriority.HIGH]: 'bg-error-100 text-error-800',
  };

  const statusClasses = {
    [TaskStatus.TODO]: 'bg-gray-100 text-gray-800',
    [TaskStatus.IN_PROGRESS]: 'bg-primary-100 text-primary-800',
    [TaskStatus.COMPLETED]: 'bg-success-100 text-success-800',
    [TaskStatus.PENDING]: 'bg-error-100 text-error-800',
  };

  const statusText = {
    [TaskStatus.TODO]: 'To Do',
    [TaskStatus.IN_PROGRESS]: 'In Progress',
    [TaskStatus.COMPLETED]: 'Completed',
    [TaskStatus.PENDING]: 'Pending',
  };

  const dueDate = new Date(task.dueDate);
  const isOverdue = dueDate < new Date() && task.status !== TaskStatus.COMPLETED;

  return (
    <div className="card p-4 hover:border-primary-300 transition-all animate-fade-in">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 truncate max-w-[70%]">{task.title}</h3>
        <div className="flex space-x-1">
          <span className={`badge ${priorityClasses[task.priority]}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          <span className={`badge ${statusClasses[task.status]}`}>
            {statusText[task.status]}
          </span>
        </div>
      </div>
      
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex items-center text-xs text-gray-500 mb-4 space-x-4">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          <span className={isOverdue ? 'text-error-600 font-medium' : ''}>
            {format(dueDate, 'MMM dd, yyyy')}
          </span>
        </div>
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>{format(dueDate, 'hh:mm a')}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {task.status !== TaskStatus.COMPLETED ? (
            <button
              onClick={() => onStatusChange(task._id, TaskStatus.COMPLETED)}
              className="flex items-center text-xs font-medium text-success-600 hover:text-success-800 transition-colors"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Mark Complete
            </button>
          ) : (
            <button
              onClick={() => onStatusChange(task._id, TaskStatus.TODO)}
              className="flex items-center text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Clock className="h-3 w-3 mr-1" />
              Mark To Do
            </button>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(task)}
            className="text-gray-500 hover:text-primary-600 transition-colors"
            aria-label="Edit task"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="text-gray-500 hover:text-error-600 transition-colors"
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;