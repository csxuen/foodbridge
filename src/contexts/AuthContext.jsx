import React, { createContext, useContext, useState } from 'react';
import { donors, receivers, adminUsers } from '../data/mockData';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'donor', 'receiver', 'admin'

  const login = async (email, password, selectedRole) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    let foundUser = null;
    if (selectedRole === 'Donor' && email === 'donor@food.com' && password === 'donor123') {
      foundUser = donors.find(d => d.email === email);
      setRole('donor');
    } else if (selectedRole === 'Receiver' && email === 'receiver@food.com' && password === 'receiver123') {
      foundUser = receivers.find(r => r.email === email);
      setRole('receiver');
    } else if (selectedRole === 'Admin' && email === 'admin@food.com' && password === 'admin123') {
      foundUser = adminUsers[0]; // Just pick the first admin
      setRole('admin');
    }

    if (foundUser) {
      setUser(foundUser);
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
    setRole(null);
  };

  const updateCurrentUser = (updates) => {
    setUser(prev => ({...prev, ...updates}));
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
