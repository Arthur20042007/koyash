import { createContext, useContext } from 'react';

// Context object + hook live here (a non-component module) so the provider
// file can stay component-only and keep React Fast Refresh happy.
export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
