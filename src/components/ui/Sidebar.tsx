import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  CheckCircle, 
  Calendar, 
  Users, 
  Settings, 
  LogOut,
  BarChart2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();

  const navItems = [
    { icon: <Home size={20} />, name: 'Dashboard', path: '/dashboard' },
    { icon: <CheckCircle size={20} />, name: 'Tasks', path: '/tasks' },
    { icon: <Calendar size={20} />, name: 'Calendar', path: '/calendar' },
    { icon: <Users size={20} />, name: 'Team', path: '/team' },
    { icon: <BarChart2 size={20} />, name: 'Analytics', path: '/analytics' },
    { icon: <Settings size={20} />, name: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="bg-white border-r border-gray-200 w-64 min-h-screen fixed top-0 left-0 z-10 transition-all duration-300 ease-in-out">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <div className="flex items-center space-x-2 px-4">
          <CheckCircle className="h-6 w-6 text-primary-600" />
          <span className="text-xl font-semibold text-gray-900">Taskify</span>
        </div>
      </div>
      
      <nav className="px-4 py-6">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-full border-t border-gray-200 py-4 px-4">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
        >
          <LogOut size={20} className="mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;