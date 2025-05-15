import React, { useEffect, useState } from 'react';
import { BarChart2, TrendingUp, Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { useTask } from '../../context/TaskContext';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

const AnalyticsPage: React.FC = () => {
  const { tasks } = useTask();
  const [weeklyStats, setWeeklyStats] = useState<{ date: Date; completed: number; created: number }[]>([]);
  
  useEffect(() => {
    const start = startOfWeek(new Date());
    const end = endOfWeek(new Date());
    const days = eachDayOfInterval({ start, end });
    
    const stats = days.map(date => {
      const completed = tasks.filter(task => 
        task.status === TaskStatus.COMPLETED && 
        format(new Date(task.updatedAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      ).length;
      
      const created = tasks.filter(task => 
        format(new Date(task.createdAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      ).length;
      
      return { date, completed, created };
    });
    
    setWeeklyStats(stats);
  }, [tasks]);

  const calculateCompletionRate = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const getAverageCompletionTime = () => {
    const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED);
    if (completedTasks.length === 0) return 0;
    
    const totalTime = completedTasks.reduce((acc, task) => {
      const created = new Date(task.createdAt).getTime();
      const completed = new Date(task.updatedAt).getTime();
      return acc + (completed - created);
    }, 0);
    
    return Math.round(totalTime / completedTasks.length / (1000 * 60 * 60 * 24)); // Convert to days
  };

  const getTasksByPriority = () => {
    return Object.values(TaskPriority).map(priority => ({
      priority,
      count: tasks.filter(task => task.priority === priority).length
    }));
  };

  const getMaxBarHeight = () => {
    return Math.max(...weeklyStats.map(stat => Math.max(stat.completed, stat.created)));
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">
          Track your productivity and task management metrics
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completion Rate</p>
              <h3 className="text-2xl font-semibold text-gray-900">{calculateCompletionRate()}%</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center p-3 bg-success-100 rounded-lg">
              <Clock className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Completion Time</p>
              <h3 className="text-2xl font-semibold text-gray-900">{getAverageCompletionTime()} days</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center p-3 bg-warning-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Tasks</p>
              <h3 className="text-2xl font-semibold text-gray-900">{tasks.length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center p-3 bg-error-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-error-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
              <h3 className="text-2xl font-semibold text-gray-900">
                {tasks.filter(task => task.status === TaskStatus.PENDING).length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Weekly Activity</h2>
            <div className="h-64 flex items-end justify-between">
              {weeklyStats.map((stat, index) => {
                const maxHeight = getMaxBarHeight();
                const completedHeight = maxHeight > 0 ? (stat.completed / maxHeight) * 100 : 0;
                const createdHeight = maxHeight > 0 ? (stat.created / maxHeight) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full px-2 flex justify-center space-x-1 h-48">
                      <div 
                        className="w-3 bg-primary-200 rounded-t"
                        style={{ height: `${completedHeight}%` }}
                      />
                      <div 
                        className="w-3 bg-primary-600 rounded-t"
                        style={{ height: `${createdHeight}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      {format(stat.date, 'EEE')}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center mt-4 space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-primary-600 rounded mr-2" />
                <span className="text-sm text-gray-600">Created</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-primary-200 rounded mr-2" />
                <span className="text-sm text-gray-600">Completed</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Task Distribution</h2>
            <div className="space-y-4">
              {getTasksByPriority().map(({ priority, count }) => {
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
                      <span className="text-sm text-gray-500">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${priorityColorClass} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Status Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.values(TaskStatus).map(status => {
                  const count = tasks.filter(task => task.status === status).length;
                  const statusClass = {
                    [TaskStatus.TODO]: 'bg-gray-100 text-gray-800',
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

export default AnalyticsPage;