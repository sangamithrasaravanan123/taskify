import React, { useState, useEffect } from 'react';
import { BarChart, CheckSquare, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTask } from '../../context/TaskContext';
import { Task, TaskStatus, DashboardSummary, TaskPriority } from '../../types';
import TaskCard from '../../components/ui/TaskCard';
import Button from '../../components/ui/Button';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { tasks, taskGroups, getTasksByUser, updateTask, deleteTask } = useTask();
  const [summary, setSummary] = useState<DashboardSummary>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    upcomingTasks: 0,
    completionRate: 0,
  });

  useEffect(() => {
    getTasksByUser();
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      const now = new Date();
      const completed = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
      const pending = tasks.filter(task => task.status === TaskStatus.PENDING).length;
      const upcoming = tasks.filter(
        task => new Date(task.dueDate) > now && task.status !== TaskStatus.COMPLETED
      ).length;
      
      setSummary({
        totalTasks: tasks.length,
        completedTasks: completed,
        pendingTasks: pending,
        upcomingTasks: upcoming,
        completionRate: Math.round((completed / tasks.length) * 100) || 0,
      });
    }
  }, [tasks]);

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    await updateTask(id, { status });
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id);
    }
  };

  const getUpcomingTasks = () => {
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);
    
    return tasks
      .filter(task => 
        task.status !== TaskStatus.COMPLETED && 
        new Date(task.dueDate) > now && 
        new Date(task.dueDate) <= threeDaysFromNow
      )
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name.split(' ')[0]}
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your tasks today.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-lg">
              <CheckSquare className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Tasks</p>
              <h3 className="text-2xl font-semibold text-gray-900">{summary.totalTasks}</h3>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full"
                style={{ width: `${summary.completionRate}%` }}
              ></div>
            </div>
            <p className="text-xs font-medium text-gray-500 mt-1">
              {summary.completionRate}% complete
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center p-3 bg-success-100 rounded-lg">
              <CheckSquare className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <h3 className="text-2xl font-semibold text-gray-900">{summary.completedTasks}</h3>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Keep up the good work!
          </p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center p-3 bg-warning-100 rounded-lg">
              <Clock className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Upcoming</p>
              <h3 className="text-2xl font-semibold text-gray-900">{summary.upcomingTasks}</h3>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Due in the next few days
          </p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center p-3 bg-error-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-error-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <h3 className="text-2xl font-semibold text-gray-900">{summary.pendingTasks}</h3>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Past due date
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
              <Button variant="outline" size="sm" rightIcon={<Calendar size={16} />}>
                View Calendar
              </Button>
            </div>
            <div className="space-y-4">
              {getUpcomingTasks().length > 0 ? (
                getUpcomingTasks().map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={() => {}}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No upcoming tasks in the next 3 days.
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Priority Breakdown</h2>
              <BarChart size={20} className="text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {Object.values(TaskPriority).map((priority) => {
                const count = tasks.filter(task => task.priority === priority).length;
                const percentage = tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0;
                
                const priorityColorClass = {
                  [TaskPriority.HIGH]: 'bg-error-600',
                  [TaskPriority.MEDIUM]: 'bg-warning-600',
                  [TaskPriority.LOW]: 'bg-success-600',
                }[priority];
                
                return (
                  <div key={priority}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium capitalize">{priority}</span>
                      <span className="text-sm text-gray-500">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${priorityColorClass} h-2 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Status Distribution</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.values(TaskStatus).map((status) => {
                  const count = tasks.filter(task => task.status === status).length;
                  
                  const statusClass = {
                    [TaskStatus.TODO]: 'bg-gray-200 text-gray-800',
                    [TaskStatus.IN_PROGRESS]: 'bg-primary-100 text-primary-800',
                    [TaskStatus.COMPLETED]: 'bg-success-100 text-success-800',
                    [TaskStatus.PENDING]: 'bg-error-100 text-error-800',
                  }[status];
                  
                  return (
                    <div key={status} className={`p-3 rounded-md ${statusClass}`}>
                      <p className="text-xs font-medium capitalize">
                        {status.replace('-', ' ')}
                      </p>
                      <p className="text-lg font-semibold">{count}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;