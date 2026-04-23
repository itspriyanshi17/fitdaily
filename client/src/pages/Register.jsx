import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await register(name, email, password);
      if (!res.success) {
        toast.error(res.error || 'Registration failed');
      } else {
        toast.success('Account created successfully!');
      }
    } catch {
      toast.error('Registration failed');
    }
  };

  return (
    <div className="app-shell-bg flex h-screen items-center justify-center p-4">
      <div className="glass-card w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold">
            <span className="bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-blue)] bg-clip-text text-transparent">Fit</span>Daily
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">Create an account to get started</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Name</label>
            <input 
              type="text" 
              required
              className="w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Email</label>
            <input 
              type="email" 
              required
              className="w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Password</label>
            <input 
              type="password" 
              required
              className="w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full btn-primary py-3 mt-4">
            Register
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          Already have an account? <Link to="/login" className="text-[var(--color-primary)] hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
