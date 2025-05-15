import React, { useState, useEffect } from 'react';
import { Plus, Filter, SortAsc, SortDesc, X } from 'lucide-react';
import { useTask } from '../../context/TaskContext';
import { Task, TaskStatus } from '../../types';
import TaskCard from '../../components/ui/TaskCard';
import TaskForm from '../../components/ui/TaskForm';
import Button from '../../components/ui/Button';

const TasksPage: React.FC = () => {
  const { tasks, taskGroups, createTask, updateTask, deleteTask, getTasksByUser, isLoading } = useTask();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  
  useEffect(() => {
    getTasksByUser();
  }, []);
  
  const handleAddTask = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };
  
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };
  
  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };
  
  const handleFormSubmit = async (task: Partial<Task>) => {
    setIsSubmitting(true);
    try {
      if (editingTask?._id) {
        await updateTask(editingTask._id, task);
      } else {
        await createTask(task as Omit<Task, '_id' | 'createdAt' | 'updatedAt' | 'assignedBy'>);
      }
      setIsFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id);
    }
  };
  
  const handleStatusChange = async (id: string, status: TaskStatus) => {
    await updateTask(id, { status });
  };
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  const getFilteredTasks = () => {
    let filteredTasks = [...tasks];
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === filterStatus);
    }
    
    // Apply sorting by due date
    filteredTasks.sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    return filteredTasks;
  };
  
  return (
    <div className="animate-fade-in">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            Manage and organize your tasks
          </p>
        </div>
        <Button 
          onClick={handleAddTask}
          leftIcon={<Plus size={16} />}
        >
          Add New Task
        </Button>
      </header>
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
          <select
            className="input h-9 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
          >
            <option value="all">All Status</option>
            <option value={TaskStatus.TODO}>To Do</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.COMPLETED}>Completed</option>
            <option value={TaskStatus.PENDING}>Pending</option>
          </select>
          
          {filterStatus !== 'all' && (
            <button
              onClick={() => setFilterStatus('all')}
              className="inline-flex items-center px-2 py-1 bg-gray-100 text-xs rounded-md hover:bg-gray-200"
            >
              <X size={14} className="mr-1" />
              Clear filter
            </button>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSortOrder}
          leftIcon={sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
        >
          {sortOrder === 'asc' ? 'Oldest first' : 'Newest first'}
        </Button>
      </div>
      
      {isFormOpen && (
        <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <TaskForm
            initialTask={editingTask || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          {getFilteredTasks().length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-6">
                {filterStatus !== 'all' 
                  ? `There are no tasks with the "${filterStatus}" status.` 
                  : "You don't have any tasks yet."}
              </p>
              <Button onClick={handleAddTask} leftIcon={<Plus size={16} />}>
                Create your first task
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredTasks().map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TasksPage;