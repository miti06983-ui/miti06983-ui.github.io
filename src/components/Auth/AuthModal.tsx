import React, { useState } from 'react';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';

type AuthView = 'login' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialView = 'login' }) => {
  const [view, setView] = useState<AuthView>(initialView);

  if (!isOpen) return null;

  if (view === 'login') {
    return (
      <LoginPage 
        onSwitchToRegister={() => setView('register')}
      />
    );
  }

  return (
    <RegisterPage 
      onSwitchToLogin={() => setView('login')}
    />
  );
};

export default AuthModal;
