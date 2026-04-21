import { useState } from 'react';
import { Globe, ArrowLeft, ArrowRight, RotateCw, Search } from 'lucide-react';

export default function Browser() {
  const [url, setUrl] = useState('https://www.wikipedia.org/');
  const [inputUrl, setInputUrl] = useState('https://www.wikipedia.org/');
  const [loading, setLoading] = useState(false);

  const handleNavigate = (e) => {
    e.preventDefault();
    let finalUrl = inputUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    setUrl(finalUrl);
    setInputUrl(finalUrl);
  };

  return (
    <div className="browser-app">
      {/* Browser Toolbar */}
      <div className="browser-toolbar">
        <div className="browser-nav-btns">
          <button className="btn-icon-only" title="Back"><ArrowLeft size={16} /></button>
          <button className="btn-icon-only" title="Forward"><ArrowRight size={16} /></button>
          <button className="btn-icon-only" title="Reload" onClick={() => setUrl(url + '#')}><RotateCw size={16} /></button>
        </div>
        
        <form onSubmit={handleNavigate} className="browser-address-bar">
          <Globe size={14} className="address-icon" />
          <input 
            type="text" 
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Search or enter web address"
            className="address-input"
          />
          <button type="submit" style={{ display: 'none' }}>Go</button>
        </form>
      </div>

      {/* Browser Content */}
      <div className="browser-content">
        <iframe 
          src={url} 
          title="web-browser"
          className="browser-iframe"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
}
