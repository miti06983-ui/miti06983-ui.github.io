export interface VerificationCode {
  code: string;
  email: string;
  expiresAt: number;
  createdAt: number;
}

const VERIFICATION_STORAGE_KEY = 'music_player_verification';

export const generateVerificationCode = (email: string): string => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const verification: VerificationCode = {
    code,
    email,
    expiresAt: Date.now() + 5 * 60 * 1000,
    createdAt: Date.now()
  };
  
  localStorage.setItem(VERIFICATION_STORAGE_KEY, JSON.stringify(verification));
  
  return code;
};

export const verifyCode = (email: string, code: string): boolean => {
  const stored = localStorage.getItem(VERIFICATION_STORAGE_KEY);
  
  if (!stored) {
    return false;
  }
  
  try {
    const verification: VerificationCode = JSON.parse(stored);
    
    if (verification.email !== email) {
      return false;
    }
    
    if (verification.code !== code) {
      return false;
    }
    
    if (Date.now() > verification.expiresAt) {
      localStorage.removeItem(VERIFICATION_STORAGE_KEY);
      return false;
    }
    
    localStorage.removeItem(VERIFICATION_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
};

export const getVerificationCode = (): VerificationCode | null => {
  const stored = localStorage.getItem(VERIFICATION_STORAGE_KEY);
  
  if (!stored) {
    return null;
  }
  
  try {
    const verification: VerificationCode = JSON.parse(stored);
    
    if (Date.now() > verification.expiresAt) {
      localStorage.removeItem(VERIFICATION_STORAGE_KEY);
      return null;
    }
    
    return verification;
  } catch (error) {
    return null;
  }
};

export const clearVerificationCode = () => {
  localStorage.removeItem(VERIFICATION_STORAGE_KEY);
};
