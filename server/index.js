import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

dotenv.config();

// Database connection
const connectDB = async () => {
  try {
    // For demonstration purposes, we'll use a mock connection
    // In a real application, you would connect to MongoDB:
    // await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB would be connected in a production app');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default development server
  credentials: true
}));
app.use(helmet());
app.use(compression());
app.use(cookieParser());

// Mock data store for demo purposes
const users = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: bcrypt.hashSync('password123', 10),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const tasks = [
  {
    _id: '1',
    title: 'Complete project proposal',
    description: 'Finish the detailed project proposal for the client meeting',
    status: 'in-progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedBy: '1'
  },
  {
    _id: '2',
    title: 'Weekly team meeting',
    description: 'Prepare agenda for the weekly team sync-up',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedBy: '1'
  },
  {
    _id: '3',
    title: 'Research new technologies',
    description: 'Look into new frameworks for the upcoming project',
    status: 'todo',
    priority: 'low',
    dueDate: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedBy: '1'
  },
  {
    _id: '4',
    title: 'Code review session',
    description: 'Review pull requests from the development team',
    status: 'completed',
    priority: 'medium',
    dueDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedBy: '1'
  },
  {
    _id: '5',
    title: 'Project deadline',
    description: 'Final submission for the client project',
    status: 'pending',
    priority: 'high',
    dueDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedBy: '1'
  }
];

// Authentication middleware
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // In a real app, you would verify with your JWT_SECRET
    const decoded = jwt.verify(token, 'demo_secret_key');
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user (in a real app, this would be saved to the database)
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: (users.length + 1).toString(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    // Create token
    const token = jwt.sign({ id: newUser._id }, 'demo_secret_key', { expiresIn: '1d' });
    
    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign({ id: user._id }, 'demo_secret_key', { expiresIn: '1d' });
    
    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = users.find(u => u._id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  const { password, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// Task routes
app.get('/api/tasks', auth, (req, res) => {
  try {
    // In a real app, you would filter tasks by user ID
    const userTasks = tasks.filter(task => task.assignedBy === req.user.id || task.assignedTo === req.user.id);
    res.json(userTasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/tasks/:id', auth, (req, res) => {
  try {
    const task = tasks.find(t => t._id === req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user is authorized to access this task
    if (task.assignedBy !== req.user.id && task.assignedTo !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/tasks', auth, (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;
    
    if (!title || !status || !priority || !dueDate) {
      return res.status(400).json({ message: 'Required fields missing' });
    }
    
    const newTask = {
      _id: (tasks.length + 1).toString(),
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      assignedBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/tasks/:id', auth, (req, res) => {
  try {
    const taskIndex = tasks.findIndex(t => t._id === req.params.id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user is authorized to update this task
    if (tasks[taskIndex].assignedBy !== req.user.id && tasks[taskIndex].assignedTo !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updatedTask = {
      ...tasks[taskIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    tasks[taskIndex] = updatedTask;
    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/tasks/:id', auth, (req, res) => {
  try {
    const taskIndex = tasks.findIndex(t => t._id === req.params.id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user is authorized to delete this task
    if (tasks[taskIndex].assignedBy !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Remove task
    tasks.splice(taskIndex, 1);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});