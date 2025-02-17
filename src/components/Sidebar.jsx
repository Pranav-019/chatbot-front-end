import React, { useState } from 'react';
import './Sidebar.css';

function Sidebar({ chats, currentChatId, onNewChat, onSwitchChat, onDeleteChat, onRenameChat }) {
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleRenameClick = (chatId, currentTitle) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle || `Chat ${chatId}`);
  };

  const handleRenameSubmit = (chatId) => {
    onRenameChat(chatId, editingTitle);
    setEditingChatId(null);
    setEditingTitle('');
  };

  return (
    <div className="sidebar-content">
      <div className="p-3 border-bottom">
        <button className="btn btn-primary w-100" onClick={onNewChat}>
          + New chat
        </button>
      </div>
      
      <div className="sidebar-chats p-2">
        {chats.map(chat => (
          <div 
            key={chat.id}
            className={`chat-item rounded p-2 mb-2 ${chat.id === currentChatId ? 'active' : ''}`}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div className="chat-item-content flex-grow-1" onClick={() => onSwitchChat(chat.id)}>
                {editingChatId === chat.id ? (
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => handleRenameSubmit(chat.id)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleRenameSubmit(chat.id);
                    }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <div className="chat-title">{chat.title || `Chat ${chat.id}`}</div>
                    {chat.responses.length > 0 && (
                      <small className="text-muted d-block text-truncate">
                        {chat.responses[0].query}
                      </small>
                    )}
                  </>
                )}
              </div>
              <div className="chat-actions ms-2">
                <button 
                  className="btn btn-sm btn-link text-decoration-none"
                  onClick={() => handleRenameClick(chat.id, chat.title)}
                  title="Rename chat"
                >
                  ✏️
                </button>
                <button 
                  className="btn btn-sm btn-link text-decoration-none"
                  onClick={() => onDeleteChat(chat.id)}
                  title="Delete chat"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="sidebar-footer p-3 border-top text-center">
      </div>
    </div>
  );
}

export default Sidebar; 