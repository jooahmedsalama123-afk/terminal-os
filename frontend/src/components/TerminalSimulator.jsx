import { API_URL } from '../config';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function TerminalSimulator({ onCommandExecute }) {
  const [history, setHistory] = useState([
    { type: 'output', text: 'Welcome to Advanced Terminal Emulator v1.0.0' },
    { type: 'output', text: 'Type commands like: ls, touch <file>, mkdir <dir>, rm <file>, pwd, echo' }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  const executeCommand = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim();
    setHistory(prev => [...prev, { type: 'input', text: cmd }]);
    setInput('');
    
    if (cmd === 'clear') {
      setHistory([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        API_URL + '/api/terminal', 
        { command: cmd },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.output) {
        setHistory(prev => [...prev, { type: 'output', text: res.data.output }]);
      }
      
      // Notify parent to refresh files if this was a filesystem mutating command
      if (['touch', 'mkdir', 'rm'].some(c => cmd.startsWith(c))) {
        if (onCommandExecute) onCommandExecute();
      }

    } catch (err) {
      setHistory(prev => [...prev, { type: 'output', text: 'Error connecting to server.' }]);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <div className="terminal-wrapper">
      <div className="terminal-history">
        {history.map((line, i) => (
          <div key={i} className="terminal-line">
            {line.type === 'input' ? (
              <div>
                <span className="terminal-prompt">{localStorage.getItem('email')}@workspace:~$</span>{' '}
                <span style={{ color: '#d8dee9' }}>{line.text}</span>
              </div>
            ) : (
              <div className="terminal-output">{line.text}</div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={executeCommand} className="terminal-input-row">
        <span className="terminal-prompt">{localStorage.getItem('email')}@workspace:~$</span>
        <input 
          type="text" 
          className="terminal-input" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          spellCheck="false"
        />
      </form>
    </div>
  );
}
