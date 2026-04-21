import { API_URL } from '../config';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Cpu, Mail, Lock, ArrowRight } from 'lucide-react';
import EpicBackground from './EpicBackground';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await axios.post(API_URL + '/api/signup', { email, password });
      setTimeout(() => navigate('/login'), 300);
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <EpicBackground />
      
      <div className={`auth-card ${mounted ? 'card-entered' : ''}`} style={{ '--theme-color': '#10b981', '--theme-glow': 'rgba(16, 185, 129, 0.4)' }}>
        <div className="auth-logo-wrapper">
          <div className="auth-logo-epic" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)' }}>
            <Cpu size={36} className="logo-pulse" />
          </div>
        </div>
        <div className="auth-header">
          <h1 className="auth-title">Initialize System</h1>
          <p className="auth-subtitle">Create your root identity</p>
        </div>
        
        {error && <div className="auth-error-msg" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>{error}</div>}
        
        <form className="auth-form" onSubmit={handleSignup}>
          <div className="input-group-epic">
            <Mail className="input-icon" size={18} />
            <input 
              type="email" 
              className="input-field-epic focus-emerald" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="input-group-epic">
            <Lock className="input-icon" size={18} />
            <input 
              type="password" 
              className="input-field-epic focus-emerald" 
              placeholder="Security key" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn-epic btn-emerald" disabled={loading}>
            {loading ? <span className="loader"></span> : 'Generate Keypair'}
            {!loading && <ArrowRight size={18} className="btn-arrow" />}
          </button>
        </form>
        
        <div className="auth-toggle">
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Identity exists?</span> <Link to="/login" className="link-epic" style={{ color: '#34d399' }}>Establish Connection</Link>
        </div>
      </div>
    </div>
  );
}
