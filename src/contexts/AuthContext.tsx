import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, sendCode as apiSendCode, getMe as apiGetMe, logout as apiLogout } from '../apis';
import type { LoginRequest, RegisterRequest, User, SendCodeRequest } from '../apis/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearLocalSession: () => void;
  register: (data: RegisterRequest) => Promise<void>;
  sendCode: (data: SendCodeRequest) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      try {
        const response = await apiGetMe();
        if (response.data) {
          setUser(response.data);
        }
      } catch {
        // Session invalid
      } finally {
        setIsLoading(false);
      }
    };
    validateSession();
  }, []);

  const login = async (data: LoginRequest) => {
    await apiLogin(data);
    try {
      const me = await apiGetMe();
      if (me.data) {
        setUser(me.data);
      }
    } catch {
      void 0;
    }
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  const clearLocalSession = () => {
    setUser(null);
  };

  const register = async (data: RegisterRequest) => {
    await apiRegister(data);
    // 注册后可以根据业务需求选择是否自动登录
  };

  const sendCode = async (data: SendCodeRequest) => {
    await apiSendCode(data);
  };

  const refreshUser = async () => {
    try {
      const me = await apiGetMe();
      if (me.data) {
        setUser(me.data);
      }
    } catch {
      void 0;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    clearLocalSession,
    register,
    sendCode,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;