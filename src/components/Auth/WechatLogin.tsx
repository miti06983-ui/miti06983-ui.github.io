import React, { useState, useEffect } from 'react';
import { QrCode, Wechat, X, ExternalLink } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WechatLoginProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

const WechatLogin: React.FC<WechatLoginProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<'qrcode' | 'scanning' | 'success'>('qrcode');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = () => {
    const appId = 'YOUR_WECHAT_APPID';
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/wechat/callback');
    const state = Math.random().toString(36).substring(7);
    
    const wechatAuthUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;
    
    setQrCodeUrl(wechatAuthUrl);
    setStep('qrcode');
  };

  const simulateScan = () => {
    setStep('scanning');
    
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wechat className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">微信登录</h2>
            <p className="text-gray-500 text-sm">使用微信账号快速登录</p>
          </div>

          <div className="flex flex-col items-center">
            {step === 'qrcode' && (
              <>
                <div className="bg-gray-100 rounded-2xl p-6 mb-4">
                  {qrCodeUrl ? (
                    <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <QrCode className="w-32 h-32 text-gray-400" />
                      <div className="absolute text-xs text-gray-400 mt-2 text-center px-4">
                        <p>请配置您的微信 AppID</p>
                        <p className="mt-1">查看 src/components/Auth/WechatLogin.tsx</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 rounded-lg animate-pulse" />
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  请使用微信扫描二维码登录
                </p>
                
                <button
                  onClick={simulateScan}
                  className="text-sm text-green-500 hover:text-green-600 flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  演示模式 - 点击模拟扫码
                </button>
              </>
            )}

            {step === 'scanning' && (
              <div className="flex flex-col items-center py-8">
                <div className="relative w-48 h-48 mb-4">
                  <div className="absolute inset-0 border-4 border-green-500 rounded-lg animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Wechat className="w-24 h-24 text-green-500 animate-bounce" />
                  </div>
                </div>
                <p className="text-lg font-medium text-gray-700 mb-2">扫描成功</p>
                <p className="text-sm text-gray-500">请在手机上确认登录</p>
              </div>
            )}

            {step === 'success' && (
              <div className="flex flex-col items-center py-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-700">登录成功</p>
                <p className="text-sm text-gray-500 mt-2">正在跳转...</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">
              登录即表示同意我们的
              <a href="#" className="text-blue-500 hover:underline mx-1">服务条款</a>
              和
              <a href="#" className="text-blue-500 hover:underline mx-1">隐私政策</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WechatLogin;
