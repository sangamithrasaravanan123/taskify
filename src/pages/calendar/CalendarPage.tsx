import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useTask } from '../../context/TaskContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import Button from '../../components/ui/Button';

const CalendarPage: React.FC = () => {
  const { tasks, getTasksByUser, isLoading } = useTask();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateDetails, setDateDetails] = useState<Task[]>([]);

  useEffect(() => {
    getTasksByUser();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const tasksForDate = tasks.filter(task => 
        isSameDay(new Date(task.dueDate), selectedDate)
      );
      setDateDetails(tasksForDate);
    }
  }, [selectedDate, tasks]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const handlePrevMonth = () => {
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentDate(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentDate(nextMonth);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const getTaskCountForDate = (date: Date) => {
    return tasks.filter(task => isSameDay(new Date(task.dueDate), date)).length;
  };

  const hasHighPriorityTask = (date: Date) => {
    return tasks.some(task => 
      isSameDay(new Date(task.dueDate), date) && 
      task.priority === TaskPriority.HIGH
    );
  };

  const hasOverdueTask = (date: Date) => {
    const today = new Date();
    return date < today && tasks.some(task => 
      isSameDay(new Date(task.dueDate), date) && 
      task.status !== TaskStatus.COMPLETED
    );
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'bg-error-500';
      case TaskPriority.MEDIUM:
        return 'bg-warning-500';
      case TaskPriority.LOW:
        return 'bg-success-500';
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'To Do';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.COMPLETED:
        return 'Completed';
      case TaskStatus.PENDING:
        return 'Pending';
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1">
            View your task schedule and deadlines
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevMonth}
                leftIcon={<ChevronLeft size={16} />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                rightIcon={<ChevronRight size={16} />}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center font-medium text-gray-500 border-b">
                {day}
              </div>
            ))}

            {daysInMonth.map((date, i) => {
              const dayOfWeek = date.getDay();
              const isToday = isSameDay(date, new Date());
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const taskCount = getTaskCountForDate(date);
              const hasHighPriority = hasHighPriorityTask(date);
              const isOverdue = hasOverdueTask(date);

              return (
                <div
                  key={i}
                  className={`min-h-[100px] p-2 border-b border-r ${
                    dayOfWeek === 6 ? '' : 'border-r'
                  } ${isSelected ? 'bg-primary-50' : ''}`}
                  onClick={() => handleDateClick(date)}
                >
                  <div className="flex justify-between items-start">
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-full ${
                        isToday ? 'bg-primary-600 text-white' : ''
                      }`}
                    >
                      {format(date, 'd')}
                    </div>
                    {taskCount > 0 && (
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        isOverdue ? 'bg-error-100 text-error-800' : 
                        hasHighPriority ? 'bg-warning-100 text-warning-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {taskCount}
                      </span>
                    )}
                  </div>

                  {taskCount > 0 && (
                    <div className="mt-2 space-y-1">
                      {tasks
                        .filter(task => isSameDay(new Date(task.dueDate), date))
                        .slice(0, 2)
                        .map((task, idx) => (
                          <div 
                            key={idx} 
                            className="text-xs truncate flex items-center"
                          >
                            <span 
                              className={`inline-block w-2 h-2 rounded-full mr-1 ${getPriorityColor(task.priority)}`}
                            ></span>
                            <span className="truncate">{task.title}</span>
                          </div>
                        ))}
                      {taskCount > 2 && (
                        <div className="text-xs text-gray-500">
                          +{taskCount - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedDate && dateDetails.length > 0 && (
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="font-medium text-lg mb-4">
            Tasks for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          <div className="space-y-3">
            {dateDetails.map((task) => (
              <div 
                key={task._id} 
                className="p-3 border border-gray-200 rounded-md hover:border-primary-300 transition-colors"
              >
                <div className="flex justify-between">
                  <h4 className="font-medium">{task.title}</h4>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    task.status === TaskStatus.COMPLETED ? 'bg-success-100 text-success-800' :
                    task.status === TaskStatus.PENDING ? 'bg-error-100 text-error-800' :
                    task.status === TaskStatus.IN_PROGRESS ? 'bg-primary-100 text-primary-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusLabel(task.status)}
                  </span>
                </div>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                )}
                <div className="flex items-center mt-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></span>
                  <span className="text-xs text-gray-500 ml-1 capitalize">{task.priority} Priority</span>
                  <span className="text-xs text-gray-500 ml-3">Due at {format(new Date(task.dueDate), 'h:mm a')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;