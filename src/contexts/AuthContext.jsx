import React, { createContext, useContext, useState } from 'react';
import { donors, receivers, adminUsers } from '../data/mockData';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'donor', 'receiver', 'admin'
  const [customUsers, setCustomUsers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('foodbridge_custom_users') || '[]');
    } catch (e) {
      return [];
    }
  });

  const registerUser = (userObj) => {
    setCustomUsers(prev => {
      const updated = [...prev, userObj];
      localStorage.setItem('foodbridge_custom_users', JSON.stringify(updated));
      return updated;
    });
  };

  const login = async (emailOrUser, password, selectedRole) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    let foundUser = null;
    if (typeof emailOrUser === 'object' && emailOrUser !== null) {
      // Direct login from onboarding wizard
      const u = emailOrUser;
      // Map to proper mock structure if needed or just use the user object
      const formattedRole = u.role.toLowerCase();
      
      // Let's check if the user is already in our list of customUsers
      const matched = customUsers.find(item => item.email === u.email && item.role.toLowerCase() === formattedRole);
      foundUser = matched || u;
      setRole(formattedRole);
    } else {
      const email = emailOrUser;
      // 1. Check custom users
      const matchedCustom = customUsers.find(
        u => u.email === email && u.password === password && u.role.toLowerCase() === selectedRole.toLowerCase()
      );

      if (matchedCustom) {
        foundUser = matchedCustom;
        setRole(matchedCustom.role.toLowerCase());
      } else {
        // 2. Fallback to mock users
        if (selectedRole === 'Donor' && email === 'donor@food.com' && password === 'donor123') {
          foundUser = donors.find(d => d.email === email);
          setRole('donor');
        } else if (selectedRole === 'Receiver' && email === 'receiver@food.com' && password === 'receiver123') {
          foundUser = receivers.find(r => r.email === email);
          setRole('receiver');
        } else if (selectedRole === 'Admin' && email === 'admin@food.com' && password === 'admin123') {
          foundUser = adminUsers[0];
          setRole('admin');
        }
      }
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
    <AuthContext.Provider value={{ user, role, login, logout, updateCurrentUser, registerUser, customUsers }}>
      {children}
    </AuthContext.Provider>
  );
};
