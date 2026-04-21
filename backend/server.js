require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({
  origin: ['https://terminal-joo8.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 3001;
const SECRET_KEY = process.env.SECRET_KEY || 'supersecretkey123';

// In-memory user database
const users = [];

// Setup user disk area
const USER_FILES_DIR = path.join(__dirname, 'user_files');
if (!fs.existsSync(USER_FILES_DIR)) {
  fs.mkdirSync(USER_FILES_DIR);
}

// Simple Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/signup', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  users.push({ email, password });
  
  // Create user specific directory
  const userDir = path.join(USER_FILES_DIR, email);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir);
  }

  res.json({ message: 'User created' });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token, email: user.email });
});

// File System Routes
app.get('/api/files', authenticateToken, (req, res) => {
  const userDir = path.join(USER_FILES_DIR, req.user.email);
  try {
    const files = fs.readdirSync(userDir).map(file => {
      const stats = fs.statSync(path.join(userDir, file));
      return {
        name: file,
        isDirectory: stats.isDirectory(),
        size: stats.size
      };
    });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list files' });
  }
});

app.post('/api/files', authenticateToken, (req, res) => {
  const { name, isDirectory } = req.body;
  const userPath = path.join(USER_FILES_DIR, req.user.email, name);

  try {
    if (isDirectory) {
      fs.mkdirSync(userPath);
    } else {
      fs.writeFileSync(userPath, '');
    }
    res.json({ message: 'Created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create' });
  }
});

app.delete('/api/files/:name', authenticateToken, (req, res) => {
  const { name } = req.params;
  const userPath = path.join(USER_FILES_DIR, req.user.email, name);

  try {
    const stats = fs.statSync(userPath);
    if (stats.isDirectory()) {
      fs.rmdirSync(userPath, { recursive: true });
    } else {
      fs.unlinkSync(userPath);
    }
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// Terminal execution (for basic mocked bash-like logic)
app.post('/api/terminal', authenticateToken, (req, res) => {
  const { command } = req.body;
  const userPath = path.join(USER_FILES_DIR, req.user.email);
  
  // Basic mock parser
  const parts = command.trim().split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);

  try {
    let output = '';
    
    if (cmd === 'ls') {
      const files = fs.readdirSync(userPath);
      output = files.join('  ');
    } else if (cmd === 'touch') {
      if (!args[0]) return res.json({ output: 'touch: missing file operand' });
      fs.writeFileSync(path.join(userPath, args[0]), '');
      output = '';
    } else if (cmd === 'mkdir') {
      if (!args[0]) return res.json({ output: 'mkdir: missing operand' });
      fs.mkdirSync(path.join(userPath, args[0]));
      output = '';
    } else if (cmd === 'rm') {
      if (!args[0]) return res.json({ output: 'rm: missing operand' });
      fs.unlinkSync(path.join(userPath, args[0]));
      output = '';
    } else if (cmd === 'echo') {
      output = args.join(' ');
      // no file write for simple echo in this stub unless we implement full redirect
    } else if (cmd === 'pwd') {
      output = '/home/' + req.user.email;
    } else {
      output = `command not found: ${cmd}`;
    }
    
    res.json({ output });
  } catch (error) {
    res.json({ output: `error executing ${cmd}: ` + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
