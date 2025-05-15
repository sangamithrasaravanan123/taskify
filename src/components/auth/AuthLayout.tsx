import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AuthLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-primary-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 text-center">
              Taskify
            </h2>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Modern task and productivity management
            </p>
          </div>
          <Outlet />
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm">
            <div className="h-full flex flex-col justify-center items-center px-12">
              <h2 className="text-4xl font-bold text-white mb-8">Manage your tasks with ease</h2>
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-8 max-w-lg">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-white text-primary-600 mr-3">
                      <CheckCircle className="h-4 w-4" />
                    </span>
                    <p className="text-white">Create and organize tasks effortlessly</p>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-white text-primary-600 mr-3">
                      <CheckCircle className="h-4 w-4" />
                    </span>
                    <p className="text-white">Track your progress with intuitive interfaces</p>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-white text-primary-600 mr-3">
                      <CheckCircle className="h-4 w-4" />
                    </span>
                    <p className="text-white">Collaborate with your team seamlessly</p>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-white text-primary-600 mr-3">
                      <CheckCircle className="h-4 w-4" />
                    </span>
                    <p className="text-white">Visualize your schedule with calendar integration</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;