import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import EmailVerification from './EmailVerification';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RegisterPageProps {
  onSwitchToLogin: () => void;
  onClose?: () => void;
}

type RegisterStep = 'form' | 'verification';

const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin, onClose }) => {
  const [step, setStep] = useState<RegisterStep>('form');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  const { register, isLoading, error, clearError, user } = useAuthStore();

  useEffect(() => {
    if (user) {
      onClose?.();
    }
  }, [user, onClose]);

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};
    
    if (!email) {
      errors.email = '邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '邮箱格式不正确';
    }
    
    if (!username) {
      errors.username = '用户名不能为空';
    } else if (username.length < 3) {
      errors.username = '用户名至少3个字符';
    }
    
    if (!password) {
      errors.password = '密码不能为空';
    } else if (password.length < 6) {
      errors.password = '密码至少6个字符';
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = '请确认密码';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = '两次密码不一致';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    clearError();
    
    if (validateForm()) {
      setStep('verification');
    }
  };

  const handleVerificationSuccess = async () => {
    clearError();
    const success = await register(email, username, password);
    
    if (success) {
      onClose?.();
    } else {
      setStep('form');
    }
  };

  const handleBackToForm = () => {
    setStep('form');
  };

  if (step === 'verification') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-md bg-spotify-dark rounded-xl p-8 shadow-2xl">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-spotify-lightGray hover:text-white transition-colors"
          >
            ×
          </button>

          <EmailVerification 
            email={email}
            onVerified={handleVerificationSuccess}
            onBack={handleBackToForm}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-spotify-dark rounded-xl p-8 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-spotify-lightGray hover:text-white transition-colors"
        >
          ×
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">创建账户</h2>
          <p className="text-spotify-lightGray">填写信息完成注册</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-spotify-lightGray mb-2">
              邮箱地址
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-spotify-lightGray" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-3 bg-spotify-gray border rounded-lg text-white placeholder-spotify-lightGray focus:outline-none focus:ring-2 focus:ring-spotify-green transition-all",
                  formErrors.email ? "border-red-500" : "border-transparent"
                )}
                placeholder="you@example.com"
              />
            </div>
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-spotify-lightGray mb-2">
              用户名
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-spotify-lightGray" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-3 bg-spotify-gray border rounded-lg text-white placeholder-spotify-lightGray focus:outline-none focus:ring-2 focus:ring-spotify-green transition-all",
                  formErrors.username ? "border-red-500" : "border-transparent"
                )}
                placeholder="输入用户名"
              />
            </div>
            {formErrors.username && (
              <p className="mt-1 text-sm text-red-500">{formErrors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-spotify-lightGray mb-2">
              密码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-spotify-lightGray" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-12 py-3 bg-spotify-gray border rounded-lg text-white placeholder-spotify-lightGray focus:outline-none focus:ring-2 focus:ring-spotify-green transition-all",
                  formErrors.password ? "border-red-500" : "border-transparent"
                )}
                placeholder="至少6个字符"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-spotify-lightGray hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formErrors.password && (
              <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-spotify-lightGray mb-2">
              确认密码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-spotify-lightGray" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-3 bg-spotify-gray border rounded-lg text-white placeholder-spotify-lightGray focus:outline-none focus:ring-2 focus:ring-spotify-green transition-all",
                  formErrors.confirmPassword ? "border-red-500" : "border-transparent"
                )}
                placeholder="再次输入密码"
              />
            </div>
            {formErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{formErrors.confirmPassword}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-spotify-green text-black font-semibold rounded-lg hover:bg-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                注册中...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                继续
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-spotify-lightGray">
            已有账户？{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-spotify-green hover:underline font-medium"
            >
              立即登录
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
