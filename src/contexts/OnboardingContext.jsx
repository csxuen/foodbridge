import React, { createContext, useContext, useState, useEffect } from 'react';

const OnboardingContext = createContext();

export const useOnboarding = () => useContext(OnboardingContext);

const initialFormData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  avatarFile: null,
  avatarPreviewUrl: '',
  donorType: 'Household', // Default selected type
  receiverType: 'Individual', // Default selected type
  location: '',
  radiusKm: 5,
  language: 'English',
  foodCategories: [],
  allergyTags: [],
  donationFrequency: '',
  travelDistance: 5,
  situation: '',
  notificationsEmail: true,
  agreedToGuidelines: false,
  heardFrom: ''
};

export const OnboardingProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState('forward');
  const [isNewUser, setIsNewUser] = useState(true);
  const [role, setRoleState] = useState(null); // 'donor' | 'receiver' | null
  const [formData, setFormData] = useState(initialFormData);

  // Check on mount of LoginPage instead of here, or check here
  useEffect(() => {
    const onboarded = localStorage.getItem('foodbridge_onboarded') === 'true';
    if (onboarded) {
      setIsNewUser(false);
      setCurrentStep(1);
    } else {
      setIsNewUser(true);
      setCurrentStep(1);
    }
  }, []);

  const resetOnboarding = () => {
    setFormData(initialFormData);
    setRoleState(null);
    const onboarded = localStorage.getItem('foodbridge_onboarded') === 'true';
    setIsNewUser(!onboarded);
    setCurrentStep(1);
    setDirection('forward');
  };

  const nextStep = () => {
    setDirection('forward');
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setDirection('backward');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const jumpToStep = (n) => {
    setDirection(n > currentStep ? 'forward' : 'backward');
    setCurrentStep(n);
  };

  const setRole = (selectedRole) => {
    setRoleState(selectedRole);
  };

  const updateFormData = (fields) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const completeOnboarding = (appData, auth, navigate) => {
    // 1. Save to AppDataContext
    const userInitials = formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'FB';
    const userId = (role === 'donor' ? 'd' : 'r') + Date.now();
    
    const newUser = {
      id: userId,
      name: formData.name,
      initials: userInitials,
      email: formData.email,
      trustScore: 100,
      role: role,
      language: formData.language,
      location: formData.location,
      radiusKm: formData.radiusKm
    };

    if (role === 'donor') {
      newUser.donationCount = 0;
      newUser.points = 0;
      newUser.rank = 11;
      newUser.vouchers = [];
      newUser.certificates = [];
      newUser.donorType = formData.donorType;
      newUser.foodCategories = formData.foodCategories;
      newUser.allergyTags = formData.allergyTags;
      newUser.donationFrequency = formData.donationFrequency;
      
      // Update appData donors
      appData.setDonors(prev => [...prev, newUser]);
    } else {
      newUser.completedPickups = 0;
      newUser.receiverType = formData.receiverType;
      newUser.allergyProfile = formData.allergyTags; // populate receiver allergies
      newUser.situation = formData.situation;
      newUser.heardFrom = formData.heardFrom;
      
      // Update appData receivers
      appData.setReceivers(prev => [...prev, newUser]);
    }

    // Add to AppDataContext.users list
    if (appData.setUsers) {
      appData.setUsers(prev => [...prev, newUser]);
    }

    // Register user in AuthContext
    if (auth.registerUser) {
      auth.registerUser({
        ...newUser,
        password: formData.password // store password for mock auth
      });
    }

    // Save onboarding completion state
    localStorage.setItem('foodbridge_onboarded', 'true');
    setIsNewUser(false);
  };

  return (
    <OnboardingContext.Provider value={{
      currentStep,
      direction,
      isNewUser,
      role,
      formData,
      nextStep,
      prevStep,
      jumpToStep,
      setRole,
      updateFormData,
      completeOnboarding,
      resetOnboarding
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};
