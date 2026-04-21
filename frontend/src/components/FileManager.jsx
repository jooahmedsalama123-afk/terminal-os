import { API_URL } from '../config';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { File, Folder, Trash2, FilePlus, FolderPlus, RefreshCw } from 'lucide-react';

export default function FileManager() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFileName, setNewFileName] = useState('');

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(API_URL + '/api/files', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleCreate = async (isDirectory) => {
    if (!newFileName.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(API_URL + '/api/files', 
        { name: newFileName, isDirectory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewFileName('');
      fetchFiles();
      // Notify custom event for desktop
      window.dispatchEvent(new Event('refreshDesktopFiles'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (name) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/files/${name}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFiles();
      window.dispatchEvent(new Event('refreshDesktopFiles'));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="file-explorer">
      <div className="file-explorer-toolbar">
        <input 
          type="text" 
          className="input-field" 
          style={{ width: 'auto', flex: 1 }}
          placeholder="New file or folder name..." 
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
        />
        <button className="btn btn-primary" onClick={() => handleCreate(false)} title="Create File">
          <FilePlus size={18} />
        </button>
        <button className="btn" style={{ background: 'var(--border)', color: 'white' }} onClick={() => handleCreate(true)} title="Create Folder">
          <FolderPlus size={18} />
        </button>
        <button className="btn btn-icon-only" onClick={fetchFiles} title="Refresh">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="file-explorer-grid">
        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
        ) : files.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', marginTop: '2rem' }}>Directory is empty. Create a file!</div>
        ) : (
          files.map(f => (
            <div key={f.name} className="file-grid-item" onDoubleClick={() => f.isDirectory ? alert('Navigation inside folders not yet implemented') : alert(`Opened ${f.name}`)}>
              {f.isDirectory ? 
                <Folder className="item-icon" size={48} fill="currentColor" fillOpacity={0.5} /> : 
                <File className="item-icon" size={48} />
              }
              <div className="item-name">{f.name}</div>
              <div 
                style={{ position: 'absolute', top: 5, right: 5, color: '#ff5f56', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '2px', cursor: 'pointer', display: 'none' }}
                onClick={(e) => { e.stopPropagation(); handleDelete(f.name); }}
                className="delete-hover"
              >
                <Trash2 size={14} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
