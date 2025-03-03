import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from './components/Sidebar';
import './App.css'

function App() {
  const [query, setQuery] = useState("");
  const [chats, setChats] = useState([{ id: 1, responses: [] }]); // Store multiple chats
  const [currentChatId, setCurrentChatId] = useState(1); // Track current chat
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const getCurrentChat = () => {
    return chats.find(chat => chat.id === currentChatId) || chats[0];
  };

  const typeText = async (text, responseIndex, field) => {
    const words = text.split(" ");
    let displayedText = "";
    
    for (let i = 0; i < words.length; i++) {
      displayedText += words[i] + " ";
      setChats(currentChats => 
        currentChats.map(chat => {
          if (chat.id === currentChatId) {
            const updatedResponses = chat.responses.map((resp, index) => {
              if (index === responseIndex) {
                return { ...resp, [field]: displayedText };
              }
              return resp;
            });
            return { ...chat, responses: updatedResponses };
          }
          return chat;
        })
      );
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  const handleSubmit = async () => {
    if (!query) return;

    setLoading(true);
    setIsTyping(true);
    
    // Add new response to current chat
    setChats(currentChats => 
      currentChats.map(chat => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            responses: [{
              query: query,
              description: "",
              advice: "",
              error: null
            }, ...chat.responses]
          };
        }
        return chat;
      })
    );

    try {
      const response = await axios.post("http://144.126.138.83/get_verse", {
        query: query,
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
      });
      
      if (response.data) {
        await typeText(response.data.description, 0, "description");
        await typeText(response.data.advice, 0, "advice");
      }
    } catch (error) {
      console.error("API call failed:", error);
      setChats(currentChats => 
        currentChats.map(chat => {
          if (chat.id === currentChatId) {
            const updatedResponses = [...chat.responses];
            updatedResponses[0] = {
              query: query,
              error: "Failed to fetch data. Please try again."
            };
            return { ...chat, responses: updatedResponses };
          }
          return chat;
        })
      );
    }

    setLoading(false);
    setIsTyping(false);
    setQuery(""); // Clear input after submission
  };

  const handleNewChat = () => {
    const newChatId = Math.max(...chats.map(chat => chat.id)) + 1;
    setChats(prev => [...prev, { id: newChatId, responses: [] }]);
    setCurrentChatId(newChatId);
    setQuery("");
  };

  const switchChat = (chatId) => {
    setCurrentChatId(chatId);
    setQuery("");
  };

  const handleDeleteChat = (chatId) => {
    if (chats.length === 1) {
      // If it's the last chat, create a new empty one first
      handleNewChat();
    }
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      // Switch to another chat if we're deleting the current one
      const remainingChat = chats.find(chat => chat.id !== chatId);
      if (remainingChat) {
        setCurrentChatId(remainingChat.id);
      }
    }
  };

  const handleRenameChat = (chatId, newTitle) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Remove sidebar closing from handleSwitchChat
  const handleSwitchChat = (chatId) => {
    switchChat(chatId);
    // Removed setIsSidebarOpen(false) to keep sidebar open
  };

  const currentChat = getCurrentChat();

  return (
    <div className="app-wrapper">
      <button 
        className="btn btn-dark mobile-menu-button"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? '←' : '☰'}
      </button>
      
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <Sidebar 
          chats={chats}
          currentChatId={currentChatId}
          onNewChat={handleNewChat}
          onSwitchChat={handleSwitchChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
        />
      </div>

      <div className={`main-content ${!isSidebarOpen ? 'expanded' : ''}`}>
        <div className="container-fluid py-4">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-8">
              <h1 className="text-center mb-4">Quran Chatbot</h1>
              
              <div className="input-group mb-4">
                <input
                  type="text"
                  className="form-control custom-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about the Quran..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSubmit();
                  }}
                />
                <button 
                  className="btn btn-primary"
                  onClick={handleSubmit} 
                  disabled={loading || isTyping}
                >
                  {loading ? "Loading..." : "Ask"}
                </button>
              </div>

              {loading && (
                <div className="alert alert-info text-center">
                  Loading response...
                </div>
              )}
              
              <div className="responses">
                {currentChat.responses.map((response, index) => (
                  <div key={index} className="card mb-3 response-item">
                    <div className="card-body">
                      <div className="query-text mb-2">
                        <strong>Q: {response.query}</strong>
                      </div>
                      {!response.error ? (
                        <div className="result">
                          <h3 className="h5 mb-3">{response.description}</h3>
                          <p className="mb-0">{response.advice}</p>
                        </div>
                      ) : (
                        <div className="alert alert-danger">
                          <p className="mb-0">{response.error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
