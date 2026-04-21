import { API_URL } from '../config';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './LampLogin.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Lamp State
  const [isOn, setIsOn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post(API_URL + '/api/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('email', res.data.email);
      setTimeout(() => navigate('/dashboard'), 300);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className={`lamp-scene ${isOn ? 'scene-on' : 'scene-off'}`}>
      {/* Background Floor highlight */}
      <div className={`room-floor ${isOn ? 'on' : ''}`}></div>

      {/* Lamp Structure */}
      <div className="lamp-container">
        
        {/* Volumetric Light Beam */}
        <div className="light-beam"></div>
        
        {/* Lamp Shade */}
        <div className="lamp-shade">
          <div className="lamp-shade-inner"></div>
        </div>

        {/* Pull Cord - Framer Motion for Interaction */}
        <motion.div 
          className="pull-cord"
          drag="y"
          dragConstraints={{ top: 0, bottom: 60 }}
          dragElastic={0.4}
          onDragEnd={(e, info) => {
            // Trigger light when pulled down past a threshold
            if (info.offset.y > 20) {
              setIsOn(!isOn);
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ cursor: 'grabbing' }}
        >
          <div className="cord-string"></div>
          <div className="cord-handle"></div>
          
          {!isOn && (
            <div className="pull-tooltip">
              Grab & Pull
            </div>
          )}
        </motion.div>

        {/* Lamp Pole and Base */}
        <div className="lamp-pole-container">
          <div className="lamp-pole"></div>
          <div className="lamp-base"></div>
        </div>
      </div>

      {/* Login Card Container - Animates in when isOn is true */}
      <AnimatePresence>
        {isOn && (
          <motion.div 
            className="auth-container"
            initial={{ opacity: 0, x: 100, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          >
            <div className="login-card">
              <div className="auth-header">
                <h1 className="auth-title">Welcome</h1>
                <p className="auth-subtitle">Please enter your details to sign in</p>
                <div className="glow-line"></div>
              </div>
              
              {error && <div style={{background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '0.8rem', borderRadius: 10, fontSize: '0.9rem', border: '1px solid rgba(239,68,68,0.3)'}}>{error}</div>}
              
              <form className="auth-form" onSubmit={handleLogin}>
                <div className="input-group">
                  <Mail className="input-icon" size={20} />
                  <input 
                    type="email" 
                    className="input-field" 
                    placeholder="Username or Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="input-group">
                  <Lock className="input-icon" size={20} />
                  <input 
                    type="password" 
                    className="input-field" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={loading} 
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                  {!loading && <LogIn size={20} />}
                </button>
              </form>
              
              <div className="auth-toggle">
                <Link to="/signup" className="link-register">
                  Don't have an account? <span>Register now</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
