"use client"
import React, { useState, useEffect } from 'react';
import { MessageSquare, Hash, Send, User } from 'lucide-react';
import useWebSocket from '../../../hooks/useWebSocket';
import useNotifications from '../../../hooks/useNotifications';

interface UserProfile {
  name: string;
  regNumber: string;
  batch: string;
  section: string;
}

interface Message {
  action?: string;
  room: string;
  text: string;
}

const ChatPage = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const { messages, sendMessage } = useWebSocket(
    token ? 'ws://localhost:8080/api/chat' : '',
    token || undefined
  );
  const { showNotification } = useNotifications();
  const [newMessage, setNewMessage] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [rooms, setRooms] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      const res = await fetch('/api/profile', {
        headers: {
          'X-CSRF-Token': token,
        },
      });
      const data = await res.json();
      setProfile(data);
    };

    const fetchRooms = async () => {
      if (!token) return;
      const res = await fetch('/api/rooms', {
        headers: {
          'X-CSRF-Token': token,
        },
      });
      const data = await res.json();
      setRooms(data);
    };

    fetchProfile();
    fetchRooms();
  }, [token]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const message: Message = JSON.parse(lastMessage);
      if (message.room !== selectedRoom) {
        showNotification(`New message in ${message.room}`, message.text);
      }
    }
  }, [messages, selectedRoom, showNotification]);

  const handleRoomSelect = (room: string) => {
    setSelectedRoom(room);
    const joinMessage = {
      action: 'join',
      room: room,
    };
    sendMessage(JSON.stringify(joinMessage));
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== '' && selectedRoom) {
      const message: Message = {
        action: 'message',
        room: selectedRoom,
        text: newMessage,
      };
      sendMessage(JSON.stringify(message));
      setNewMessage('');
    }
  };

  if (!token) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare className="text-blue-600" /> Online Rooms
        </h1>
        <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
          <User className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            Section: {profile?.section.toUpperCase()}
          </span>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar: Room Selection Grid */}
        <aside className="w-80 bg-white border-r p-6 overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Hash className="w-4 h-4" /> Available Sections
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {rooms.map((room) => (
              <button
                key={room}
                onClick={() => handleRoomSelect(room)}
                className={`relative group flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedRoom === room
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className={`p-2 rounded-lg ${
                    profile?.section === room ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {profile?.section === room ? <User className="w-5 h-5" /> : <Hash className="w-5 h-5" />}
                  </div>
                  {selectedRoom === room && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </div>
                <span className={`text-lg font-bold ${
                  selectedRoom === room ? 'text-blue-900' : 'text-gray-700'
                }`}>
                  {room.toUpperCase()}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  {profile?.section === room ? 'Your primary class' : `Join ${room.toUpperCase()} chat`}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Chat Area */}
        <section className="flex-1 flex flex-col bg-white">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {selectedRoom[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedRoom.toUpperCase()} Room</h3>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Live Chat
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                {messages.filter(msg => JSON.parse(msg).room === selectedRoom).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                    <MessageSquare className="w-12 h-12 opacity-20" />
                    <p>No messages here yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const message: Message = JSON.parse(msg);
                    if (message.room === selectedRoom) {
                      return (
                        <div key={index} className="flex flex-col">
                          <div className="max-w-[80%] bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
                            <p className="text-gray-800">{message.text}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 mt-1 ml-2">Just now</span>
                        </div>
                      );
                    }
                    return null;
                  })
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t bg-white">
                <div className="max-w-4xl mx-auto flex gap-3">
                  <input
                    type="text"
                    className="flex-1 p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                    placeholder={`Message #${selectedRoom.toUpperCase()}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button
                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-blue-200"
                    onClick={handleSendMessage}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4 border border-gray-100">
                <MessageSquare className="w-10 h-10 text-blue-200" />
              </div>
              <h3 className="text-xl font-bold text-gray-700">Select a room to start</h3>
              <p className="text-sm">Join your class section or talk to the whole campus</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ChatPage;
