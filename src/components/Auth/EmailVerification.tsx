import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { generateVerificationCode, getVerificationCode } from '../../utils/verification';

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ email, onVerified, onBack }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [showDemo, setShowDemo] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    sendVerificationCode();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendVerificationCode = () => {
    const newCode = generateVerificationCode(email);
    setVerificationCode(newCode);
    setShowDemo(true);
    setCountdown(60);
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6 - index).split('');
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else if (/^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const digits = pastedData.split('');
    const newCode = [...code];
    digits.forEach((digit, i) => {
      if (i < 6) {
        newCode[i] = digit;
      }
    });
    setCode(newCode);
    
    if (digits.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  const verifyCode = () => {
    const enteredCode = code.join('');
    const verification = getVerificationCode();
    
    if (!verification) {
      setError('验证码已过期，请重新获取');
      return;
    }
    
    if (enteredCode.length !== 6) {
      setError('请输入完整的6位验证码');
      return;
    }
    
    if (enteredCode !== verification.code) {
      setError('验证码错误，请重试');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      return;
    }
    
    onVerified();
  };

  const isCodeComplete = code.every(digit => digit !== '');

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-spotify-lightGray hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        返回修改邮箱
      </button>

      <div className="text-center">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">验证邮箱</h2>
        <p className="text-spotify-lightGray">
          我们已向 <span className="text-white font-medium">{email}</span> 发送验证码
        </p>
      </div>

      <div className="flex justify-center gap-3" onPaste={handlePaste}>
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={index === 0 ? 6 : 1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-14 text-center text-2xl font-bold bg-spotify-gray border-2 border-transparent rounded-lg text-white focus:border-spotify-green focus:outline-none transition-all"
          />
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-400 text-center">{error}</p>
        </div>
      )}

      <button
        onClick={verifyCode}
        disabled={!isCodeComplete}
        className="w-full py-3 bg-spotify-green text-black font-semibold rounded-lg hover:bg-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        验证
      </button>

      <div className="flex justify-center gap-2">
        <button
          onClick={sendVerificationCode}
          disabled={countdown > 0}
          className="text-sm text-spotify-lightGray hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {countdown > 0 ? `${countdown}秒后可重新发送` : '重新发送验证码'}
        </button>
      </div>

      {showDemo && (
        <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
          <p className="text-xs text-yellow-400 text-center mb-2">
            🎯 演示模式：验证码将显示在下方
          </p>
          <p className="text-center text-2xl font-bold text-white tracking-widest">
            {verificationCode}
          </p>
          <p className="text-xs text-yellow-400 text-center mt-2">
            验证码有效期：5分钟
          </p>
        </div>
      )}
    </div>
  );
};

export default EmailVerification;
