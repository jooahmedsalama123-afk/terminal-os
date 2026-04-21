import React, { useRef } from 'react';
import Draggable from 'react-draggable';

export default function Window({ title, icon, onClose, children, defaultSize = { width: 600, height: 400 }, defaultPosition = { x: 50, y: 50 } }) {
  const nodeRef = useRef(null);
  return (
    <Draggable nodeRef={nodeRef} handle=".os-window-header" defaultPosition={defaultPosition}>
      <div ref={nodeRef} className="os-window" style={{ width: defaultSize.width, height: defaultSize.height }}>
        <div className="os-window-header">
          <div className="os-window-title">
            {icon} {title}
          </div>
          <div className="os-window-controls">
            <div className="window-control control-min" title="Minimize"></div>
            <div className="window-control control-max" title="Maximize"></div>
            <div className="window-control control-close" title="Close" onClick={onClose}></div>
          </div>
        </div>
        <div className="os-window-content">
          {children}
        </div>
      </div>
    </Draggable>
  );
}
