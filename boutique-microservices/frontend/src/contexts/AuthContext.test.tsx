import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

const AuthStatus: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <span>Loading session</span>;
  }
  return <span>{isAuthenticated ? 'Signed in' : 'Signed out'}</span>;
};

test('a session without a saved token stays signed out', async () => {
  localStorage.removeItem('accessToken');
  render(
    <AuthProvider>
      <AuthStatus />
    </AuthProvider>
  );

  expect(await screen.findByText('Signed out')).toBeInTheDocument();
});
