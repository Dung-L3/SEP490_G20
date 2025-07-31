import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  currentUser: string | null;
  setCurrentUser: (user: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<string | null>(localStorage.getItem('currentUser'));

  const logout = () => {
    // Xóa tất cả thông tin người dùng khỏi localStorage
    const keysToRemove = [
      'currentUser',
      'userRole',
      'token',
      'userId',
      'role',
      'user',
      'auth'
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    setCurrentUser(null);
    window.location.href = '/';
  };

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', currentUser);
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, logout }}>
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
