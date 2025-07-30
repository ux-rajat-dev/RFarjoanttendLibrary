import React, { useState } from 'react';
import axios from 'axios';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post(
        'https://rlaijbartary1.onrender.com/api/user/login',
        formData
      );

      const token = res.data.token;
      localStorage.setItem('token', token);

      const payload = jwtDecode(token);
      console.log('Decoded JWT:', payload);

      const role = payload.role;
      localStorage.setItem('role', role);

      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'user') {
        navigate('/user/dashboard');
      } else {
        setMessage('Unknown role');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setMessage('Login failed ❌ Please check your credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9FAFB] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-heading font-bold text-center mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block mb-1 font-medium text-sm">Email</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <FaEnvelope className="text-gray-400 mr-2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full outline-none bg-transparent font-body"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block mb-1 font-medium text-sm">Password</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <FaLock className="text-gray-400 mr-2" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full outline-none bg-transparent font-body"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-heading text-sm hover:bg-indigo-700 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* Message */}
          {message && (
            <p className="text-center text-sm text-red-500 font-body">
              {message}
            </p>
          )}
        </form>

        {/* Register Redirect */}
        <p className="text-center text-sm mt-4 font-body">
          Don’t have an account?{' '}
          <Link
            to="/register"
            className="text-indigo-600 font-medium hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
