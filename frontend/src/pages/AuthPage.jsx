import React, { useState } from 'react';
import '../styles/AuthPage.scss';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Sign in to continue' : 'Join our healthcare platform'}
          </p>
        </div>
        <div className="auth-content">
          {isLogin ? <LoginForm /> : <SignupForm />}
          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                className="toggle-auth"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 