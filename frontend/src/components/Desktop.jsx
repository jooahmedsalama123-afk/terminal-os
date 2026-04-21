import { API_URL } from '../config';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Terminal, FolderOpen, LogOut, Code, Clock, Globe } from 'lucide-react';
import Window from './Window';
import TerminalSimulator from './TerminalSimulator';
import FileManager from './FileManager';
import Browser from './Browser';
import Draggable from 'react-draggable';

const INSTALLED_APPS = [
  { id: 'terminal', name: 'Terminal', icon: Terminal },
  { id: 'files', name: 'File Explorer', icon: FolderOpen },
  { id: 'browser', name: 'Web Browser', icon: Globe },
];

const DesktopIcon = ({ icon, label, onDoubleClick }) => {
  const nodeRef = useRef(null);
  return (
    <Draggable nodeRef={nodeRef} bounds="parent">
      <div ref={nodeRef} className="desktop-icon" onDoubleClick={onDoubleClick}>
        <div className="icon-img-wrapper">
          {icon}
        </div>
        <div className="icon-label">{label}</div>
      </div>
    </Draggable>
  );
};

export default function Desktop() {
  const [openWindows, setOpenWindows] = useState([]);
  const [activeWindow, setActiveWindow] = useState(null);
  const [desktopFiles, setDesktopFiles] = useState([]);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const navigate = useNavigate();

  useEffect(() => {
    setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    
    fetchDesktopFiles();

    const handleRefresh = () => fetchDesktopFiles();
    window.addEventListener('refreshDesktopFiles', handleRefresh);
    return () => window.removeEventListener('refreshDesktopFiles', handleRefresh);
  }, []);

  const fetchDesktopFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(API_URL + '/api/files', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDesktopFiles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleApp = (appId) => {
    if (openWindows.includes(appId)) {
      if (activeWindow === appId) {
        // Minimize it (close for simplicity in this version, or we can just keep it open)
        // Let's just make it active if it wasn't
      } else {
        setActiveWindow(appId);
      }
    } else {
      setOpenWindows([...openWindows, appId]);
      setActiveWindow(appId);
    }
  };

  const closeApp = (appId) => {
    setOpenWindows(openWindows.filter(id => id !== appId));
    if (activeWindow === appId) setActiveWindow(null);
  };

  const focusWindow = (appId) => {
    setActiveWindow(appId);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    navigate('/login');
  };

  return (
    <div className="desktop-layout">
      {/* Desktop Area with Draggable Icons */}
      <div className="desktop-area">
        {INSTALLED_APPS.map(app => (
          <DesktopIcon 
            key={app.id}
            icon={<app.icon size={32} color={app.id === 'browser' ? '#60a5fa' : app.id === 'terminal' ? '#a7f3d0' : '#fcd34d'} />} 
            label={app.name} 
            onDoubleClick={() => toggleApp(app.id)} 
          />
        ))}

        {/* Sync Files onto Desktop visually */}
        {desktopFiles.map((file) => (
          <DesktopIcon 
            key={file.name}
            icon={
              file.isDirectory ? 
                <FolderOpen size={32} fill="currentColor" fillOpacity={0.8} color="#fcd34d" /> : 
                <Code size={32} color="#bae6fd" />
            }
            label={file.name}
            onDoubleClick={() => alert(`Opened ${file.name}`)}
          />
        ))}
      </div>

      {/* OS Windows Rendering */}
      {openWindows.includes('terminal') && (
        <div onClick={() => focusWindow('terminal')} style={{ position: 'absolute', zIndex: activeWindow === 'terminal' ? 100 : 10 }}>
          <Window 
            title="Terminal" 
            icon={<Terminal size={14} />} 
            onClose={() => closeApp('terminal')}
            defaultPosition={{ x: 100, y: 100 }}
          >
            <TerminalSimulator onCommandExecute={() => fetchDesktopFiles()} />
          </Window>
        </div>
      )}

      {openWindows.includes('files') && (
        <div onClick={() => focusWindow('files')} style={{ position: 'absolute', zIndex: activeWindow === 'files' ? 100 : 10 }}>
          <Window 
            title="File Explorer" 
            icon={<FolderOpen size={14} />} 
            onClose={() => closeApp('files')}
            defaultPosition={{ x: 200, y: 150 }}
            defaultSize={{ width: 700, height: 500 }}
          >
            <FileManager />
          </Window>
        </div>
      )}

      {openWindows.includes('browser') && (
        <div onClick={() => focusWindow('browser')} style={{ position: 'absolute', zIndex: activeWindow === 'browser' ? 100 : 10 }}>
          <Window 
            title="Web Browser" 
            icon={<Globe size={14} />} 
            onClose={() => closeApp('browser')}
            defaultPosition={{ x: 300, y: 50 }}
            defaultSize={{ width: 800, height: 600 }}
          >
            <Browser />
          </Window>
        </div>
      )}

      {/* Taskbar */}
      <div className="taskbar">
        <div className="taskbar-system" onClick={handleLogout} title="Logout OS" style={{ cursor: 'pointer', padding: '0 0.5rem' }}>
          <LogOut size={20} color="var(--danger)" />
        </div>
        
        <div className="taskbar-divider"></div>

        <div className="taskbar-apps">
          {INSTALLED_APPS.map(app => {
            const isRunning = openWindows.includes(app.id);
            const isActive = activeWindow === app.id;
            return (
              <div 
                key={app.id} 
                className={`taskbar-app ${isRunning ? 'is-running' : ''} ${isActive ? 'is-active' : ''}`} 
                onClick={() => toggleApp(app.id)}
                title={app.name}
              >
                <app.icon size={22} color={app.id === 'browser' ? '#60a5fa' : app.id === 'terminal' ? '#a7f3d0' : '#fcd34d'} />
              </div>
            );
          })}
        </div>

        <div className="taskbar-divider"></div>

        <div className="taskbar-system">
          <div className="taskbar-clock">
            {time}
          </div>
        </div>
      </div>
    </div>
  );
}
