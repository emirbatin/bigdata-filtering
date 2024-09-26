import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import CustomButton from './CustomButton';
import CustomTextBox from './CustomTextBox';
import CustomSelectBox from './CustomSelectBox';
import { Alert, AlertDescription } from './Alert';

const Modal = ({ isOpen, onClose, onSave, user, tempPassword }) => {
  const [username, setUsername] = useState(user?.username || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [gender, setGender] = useState(user?.gender || 'male');
  const [permission, setPermission] = useState(user?.permission || 'user');

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setFullName(user.fullName);
      setGender(user.gender);
      setPermission(user.permission);
    }
  }, [user]);

  const handleSubmit = () => {
    const newUser = { username, fullName, gender, permission };
    onSave(newUser);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
          <h2 className="text-2xl font-bold text-white">{user ? 'Edit User' : 'Add User'}</h2>
          <CustomButton
            label=""
            onClick={onClose}
            className="p-1 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors duration-200"
            icon={X}
          />
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Username</label>
              <CustomTextBox
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-gray-50 text-gray-800 border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Full Name</label>
              <CustomTextBox
                id="fullName"
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                className="w-full bg-gray-50 text-gray-800 border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Gender</label>
              <CustomSelectBox
                id="gender"
                name="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                options={['male', 'female']}
                className="w-full bg-gray-50 text-gray-800 border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Permission</label>
              <CustomSelectBox
                id="permission"
                name="permission"
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                options={['admin', 'user']}
                className="w-full bg-gray-50 text-gray-800 border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          {tempPassword && (
            <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-700 rounded-md">
              <AlertDescription>
                Temporary Password: <strong className="font-mono">{tempPassword}</strong>
              </AlertDescription>
            </Alert>
          )}
        </div>
        <div className="flex justify-end p-6 space-x-3 border-t border-gray-200 bg-gray-50">
          <CustomButton
            label="Cancel"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors duration-200"
          />
          <CustomButton
            label="Save"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Modal;