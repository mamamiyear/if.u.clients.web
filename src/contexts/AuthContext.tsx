import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, sendCode as apiSendCode, getMe as apiGetMe, logout as apiLogout } from '../apis';
import type { LoginRequest, RegisterRequest, User, SendCodeRequest } from '../apis/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
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
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    const validateSession = async () => {
      try {
        const response = await apiGetMe();
        if (response.data) {
          setUser(response.data);
        }
      } catch {
        setToken(null);
        localStorage.removeItem('token');
        void 0;
      }
    };
    validateSession();
  }, [token]);

  const login = async (data: LoginRequest) => {
    const response = await apiLogin(data);
    if (response.data?.token) {
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
    }
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
    setToken(null);
    localStorage.removeItem('token');
  };

  const clearLocalSession = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
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
    token,
    isAuthenticated: !!token || !!user,
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