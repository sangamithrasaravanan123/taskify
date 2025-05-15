// User related types
export interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Task related types
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  PENDING = 'pending',
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  assignedBy: string;
}

export interface TaskGroup {
  title: string;
  tasks: Task[];
}

// Dashboard related types
export interface DashboardSummary {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  upcomingTasks: number;
  completionRate: number;
}