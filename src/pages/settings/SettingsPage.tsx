import React, { useState } from 'react';
import { User, Mail, Lock, Bell, Moon, Sun, Globe, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    teamUpdates: true,
  });
  const [appearance, setAppearance] = useState({
    theme: 'light',
    fontSize: 'medium',
    colorScheme: 'blue',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (setting: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleAppearanceChange = (setting: keyof typeof appearance, value: string) => {
    setAppearance(prev => ({ ...prev, [setting]: value }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile update logic here
    setIsEditing(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password change logic here
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            leftIcon={<User size={16} />}
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            leftIcon={<Mail size={16} />}
          />
          <Button type="submit">Save Changes</Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
      )}

      <div className="pt-6 border-t">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Current Password"
            name="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={handleInputChange}
            leftIcon={<Lock size={16} />}
          />
          <Input
            label="New Password"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleInputChange}
            leftIcon={<Lock size={16} />}
          />
          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            leftIcon={<Lock size={16} />}
          />
          <Button type="submit">Update Password</Button>
        </form>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
      <div className="space-y-4">
        {Object.entries(notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <Bell size={20} className="text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">
                  {key.split(/(?=[A-Z])/).join(' ')}
                </p>
                <p className="text-sm text-gray-500">
                  Receive notifications for {key.split(/(?=[A-Z])/).join(' ').toLowerCase()}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={value}
                onChange={() => handleNotificationToggle(key as keyof typeof notifications)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Theme</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              className={`p-4 border rounded-lg flex items-center space-x-3 ${
                appearance.theme === 'light' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
              }`}
              onClick={() => handleAppearanceChange('theme', 'light')}
            >
              <Sun size={20} className="text-warning-500" />
              <span className="font-medium">Light</span>
            </button>
            <button
              className={`p-4 border rounded-lg flex items-center space-x-3 ${
                appearance.theme === 'dark' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
              }`}
              onClick={() => handleAppearanceChange('theme', 'dark')}
            >
              <Moon size={20} className="text-gray-500" />
              <span className="font-medium">Dark</span>
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Font Size</label>
          <select
            className="input"
            value={appearance.fontSize}
            onChange={(e) => handleAppearanceChange('fontSize', e.target.value)}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Color Scheme</label>
          <div className="grid grid-cols-3 gap-4">
            {['blue', 'green', 'purple'].map(color => (
              <button
                key={color}
                className={`p-4 border rounded-lg capitalize ${
                  appearance.colorScheme === color ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                }`}
                onClick={() => handleAppearanceChange('colorScheme', color)}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Moon },
  ];

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </header>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4">
          <div className="border-b md:border-b-0 md:border-r border-gray-200">
            <nav className="p-4">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium ${
                    activeTab === id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </button>
              ))}
              <button
                onClick={logout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-error-600 hover:bg-error-50 mt-4"
              >
                <LogOut size={20} />
                <span>Log Out</span>
              </button>
            </nav>
          </div>

          <div className="p-6 md:col-span-3">
            {activeTab === 'profile' && renderProfileSettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'appearance' && renderAppearanceSettings()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;