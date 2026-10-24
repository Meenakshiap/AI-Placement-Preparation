import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser, ISkillProfile } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  skillProfile: ISkillProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: any) => Promise<{ success: boolean; message?: string }>;
  demoLogin: () => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (updatedUser: IUser) => void;
  updateProfileState: (profile: ISkillProfile) => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const readStoredValue = <T,>(key: string): T | null => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : null;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

const getAuthErrorMessage = (err: unknown): string => {
  if (err instanceof TypeError) {
    return 'Cannot reach the login server. Start the backend and try again; your saved session will remain available.';
  }
  return err instanceof Error ? err.message : 'Authentication request failed.';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(() => readStoredValue<IUser>('prep_auth_user'));
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('prep_auth_token'));
  const [skillProfile, setSkillProfile] = useState<ISkillProfile | null>(
    () => readStoredValue<ISkillProfile>('prep_skill_profile')
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUserData = async () => {
    try {
      if (!token) {
        setUser(null);
        setSkillProfile(null);
        setIsLoading(false);
        return;
      }
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        setSkillProfile(res.skillProfile ?? null);
        localStorage.setItem('prep_auth_user', JSON.stringify(res.user));
        if (res.skillProfile) {
          localStorage.setItem('prep_skill_profile', JSON.stringify(res.skillProfile));
        } else {
          localStorage.removeItem('prep_skill_profile');
        }
      } else if (res.status === 401 || res.status === 403 || res.status === 404) {
        logout();
      }
    } catch (err) {
      console.warn('Unable to refresh the saved session; keeping the cached session until the API is reachable.', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUserData();
  }, [token]);

  const handleAuthSuccess = (resToken: string, resUser: IUser, resProfile?: ISkillProfile) => {
    localStorage.setItem('prep_auth_token', resToken);
    localStorage.setItem('prep_auth_user', JSON.stringify(resUser));
    if (resProfile) {
      localStorage.setItem('prep_skill_profile', JSON.stringify(resProfile));
    } else {
      localStorage.removeItem('prep_skill_profile');
    }
    setToken(resToken);
    setUser(resUser);
    setSkillProfile(resProfile || null);
  };

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.success && res.token) {
        handleAuthSuccess(res.token, res.user, res.skillProfile);
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed.' };
    } catch (err: any) {
      return { success: false, message: getAuthErrorMessage(err) };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      if (res.success && res.token) {
        handleAuthSuccess(res.token, res.user, res.skillProfile);
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed.' };
    } catch (err: any) {
      return { success: false, message: getAuthErrorMessage(err) };
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async () => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin();
      if (res.success && res.token) {
        handleAuthSuccess(res.token, res.user, res.skillProfile);
        return { success: true };
      }
      return { success: false, message: res.message || 'Demo login failed.' };
    } catch (err: any) {
      return { success: false, message: getAuthErrorMessage(err) };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('prep_auth_token');
    localStorage.removeItem('prep_auth_user');
    localStorage.removeItem('prep_skill_profile');
    setToken(null);
    setUser(null);
    setSkillProfile(null);
  };

  const updateUser = (updatedUser: IUser) => {
    localStorage.setItem('prep_auth_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const updateProfileState = (profile: ISkillProfile) => {
    localStorage.setItem('prep_skill_profile', JSON.stringify(profile));
    setSkillProfile(profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        skillProfile,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        updateUser,
        updateProfileState,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
