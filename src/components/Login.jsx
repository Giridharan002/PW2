import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to dashboard...');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form submitted with:', { email, name });

    if (!email || !name) {
      alert('Please fill in both email and name');
      return;
    }

    console.log('Starting login process...');
    setLoading(true);

    try {
      const result = await login(email, name);
      console.log('Login result:', result);
      setLoading(false);

      if (!result.success) {
        console.error('Login failed:', result.error);
        alert('Login failed: ' + result.error);
      } else {
        console.log('Login successful!');
        console.log('Navigating to dashboard...');
        // Navigate to dashboard immediately after successful login
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      alert('An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Portfolio Builder
          </h1>
          <p className="text-gray-600">
            Sign in or create an account to build your portfolio
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            {loading ? 'Signing in...' : 'Sign In / Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            New users will automatically get an account created.
          </p>
          <p className="mt-2">
            Existing users will be signed in automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
