/**
 * @copyright Nomaan Faruki - 2025
 */

import React, { useState, useEffect, useRef } from 'react';
import { useUserData, useSignOut } from '@nhost/react';
import { useQuery, useMutation, useApolloClient, gql } from '@apollo/client';
import ChatView from './ChatView';
import { formatInTimeZone } from 'date-fns-tz';
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const GET_CHATS_QUERY = gql`
  query GetChats($userId: String!) {
    chats(where: { user_id: { _eq: $userId } }, order_by: { created_at: desc }) {
      id
      title
      created_at
      user_id
    }
  }
`;

const CREATE_CHAT_MUTATION = gql`
  mutation CreateChat($title: String!) {
    insert_chats_one(object: { title: $title }) {
      id
      title
      created_at
      user_id
    }
  }
`;


export default function MainApp() {
  const user = useUserData();
  const { signOut } = useSignOut();
  const client = useApolloClient();
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isUserReady, setIsUserReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // deleteConfirm state has been removed
  const [showNotification, setShowNotification] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const searchInputRef = useRef(null);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape to close sidebar on mobile
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  // Wait for user to be stable before making queries
  useEffect(() => {
    if (user?.id) {
      const timer = setTimeout(() => {
        setIsUserReady(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsUserReady(false);
      setSelectedChatId(null);
      setSidebarOpen(false);
    }
  }, [user?.id]);

  const { data: chatsData, loading: chatsLoading, error: chatsError, refetch } = useQuery(GET_CHATS_QUERY, {
    variables: { userId: user?.id || '' },
    skip: !user?.id || !isUserReady,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  const [createChat] = useMutation(CREATE_CHAT_MUTATION, {
    errorPolicy: 'all',
    onError: (error) => {
      showToast('Failed to create chat', 'error');
    },
  });

  // useMutation hook for deleteChat has been removed

  // Toast notification system
  const showToast = (message, type = 'info') => {
    setShowNotification({ message, type });
    setTimeout(() => setShowNotification(null), 3000);
  };

  // Enhanced sign out function
  const handleSignOut = async () => {
    try {
      setIsUserReady(false);
      setSelectedChatId(null);
      setSidebarOpen(false);
      await signOut();
      setTimeout(() => {
        client.clearStore();
      }, 100);
      showToast('Signed out successfully', 'success');
    } catch (error) {
      console.error('Error during sign out:', error);
      showToast('Error signing out', 'error');
    }
  };

  // handleDeleteChat function has been removed

  const handleCreateChat = async () => {
    if (!user?.id || !isUserReady) return;
    try {
      const { data } = await createChat({
        variables: { title: 'New Chat' },
      });
      if (data?.insert_chats_one?.id) {
        setSelectedChatId(data.insert_chats_one.id);
        refetch();
        setSidebarOpen(false);
        showToast('New chat created!', 'success');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  if (!user || chatsLoading || !isUserReady)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-900 to-slate-900 text-zinc-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="animate-pulse text-lg font-medium">Loading your chats...</div>
        </div>
      </div>
    );

  if (chatsError)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-900 to-slate-900 text-red-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div className="text-lg font-medium mb-4">Error loading chats</div>
          <div className="text-sm text-zinc-400 mb-4">
            {chatsError.networkError ? 'Network connection issue' : 'Authentication error'}
          </div>
          <button
            onClick={() => {
              setIsUserReady(false);
              setTimeout(() => setIsUserReady(true), 500);
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-200 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );

  const chats = chatsData?.chats || [];
  const filteredChats = chats.filter(chat =>
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-zinc-900 to-slate-900 text-zinc-200">
      {/* Toast Notifications */}
      {showNotification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          showNotification.type === 'error' ? 'bg-red-500 text-white' :
          showNotification.type === 'success' ? 'bg-green-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <span>{showNotification.message}</span>
            <button
              onClick={() => setShowNotification(null)}
              className="ml-2 text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-orange-500 text-white text-center py-2 text-sm font-medium">
          <span className="inline-block w-4 h-4 mr-2">⚡</span>
          You're offline. Some features may be limited.
        </div>
      )}

      {/* Modern Navbar */}
      <nav className="bg-gradient-to-r from-zinc-800 to-slate-800 border-b border-zinc-700/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex justify-between items-center p-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              <img
                src="/Untitled_design-5-removebg-preview.png"
                alt="Logo"
                className="w-8 h-8 rounded-lg object-cover"
              />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Chatbot
            </h1>
          </div>

          {/* Center - Quick Actions (Desktop) - Removed */}
          <div className="hidden lg:flex items-center space-x-2">
            {/* Keyboard shortcut hints removed */}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
                 title={isOnline ? 'Online' : 'Offline'} />

            {/* User email - Hidden on mobile */}
            <div className="hidden sm:block text-sm text-zinc-300">
              {user.email}
            </div>

            {/* Sign out button */}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg hover:from-red-500 hover:to-pink-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-sm"
            >
              Sign Out
            </button>

            {/* Hamburger Menu - Mobile Only */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg bg-gradient-to-r from-zinc-700 to-slate-700 hover:from-zinc-600 hover:to-slate-600 transition-all duration-200 border border-zinc-600/50 hover:border-zinc-500/50 shadow-lg"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1">
                <div className={`h-0.5 w-5 bg-zinc-300 transition-transform duration-300 ${sidebarOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                <div className={`h-0.5 w-5 bg-zinc-300 transition-opacity duration-300 ${sidebarOpen ? 'opacity-0' : ''}`}></div>
                <div className={`h-0.5 w-5 bg-zinc-300 transition-transform duration-300 ${sidebarOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
              </div>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar - Always visible on desktop */}
        <div className="hidden md:flex w-72 bg-gradient-to-b from-zinc-800 to-slate-800 border-r border-zinc-700/50 overflow-y-auto shadow-2xl backdrop-blur-sm">
          <div className="p-4 w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-zinc-200 to-zinc-300 bg-clip-text text-transparent">
                Chats ({chats.length})
              </h2>
              <button
                onClick={handleCreateChat}
                className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                title="Create new chat"
              >
                + New Chat
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-700/50 border border-zinc-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <div className="absolute right-3 top-2.5 text-zinc-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              {filteredChats.length === 0 && searchQuery ? (
                <div className="text-center text-zinc-500 py-8">
                  No chats found matching "{searchQuery}"
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 relative ${selectedChatId === chat.id
                      ? 'bg-gradient-to-r from-blue-700 to-purple-700 shadow-lg transform scale-[1.02]'
                      : 'hover:bg-gradient-to-r hover:from-zinc-700 hover:to-slate-700 hover:shadow-md hover:scale-[1.01]'
                      } border border-transparent ${selectedChatId === chat.id ? 'border-blue-500/30' : 'hover:border-zinc-600/30'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-zinc-100 truncate">{chat.title || 'New Chat'}</h4>
                        <p className="text-xs text-zinc-400 mt-1">
                          {formatInTimeZone(chat.created_at, userTimeZone, 'dd MMM yyyy, hh:mm a')}
                        </p>
                      </div>
                      
                      {/* Delete Button has been removed */}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sidebar - Slides in from left when hamburger is clicked */}
        <div
          className={`md:hidden fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            w-72 bg-gradient-to-b from-zinc-800 to-slate-800 border-r border-zinc-700/50 overflow-y-auto z-30 shadow-2xl backdrop-blur-sm`}
          style={{ top: '73px' }}
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-zinc-200 to-zinc-300 bg-clip-text text-transparent">
                Chat History
              </h2>
              <button
                onClick={handleCreateChat}
                className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                + New Chat
              </button>
            </div>

            {/* Mobile Search */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-700/50 border border-zinc-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    setSelectedChatId(chat.id);
                    setSidebarOpen(false);
                  }}
                  className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 relative ${selectedChatId === chat.id
                    ? 'bg-gradient-to-r from-blue-700 to-purple-700 shadow-lg transform scale-[1.02]'
                    : 'hover:bg-gradient-to-r hover:from-zinc-700 hover:to-slate-700 hover:shadow-md hover:scale-[1.01]'
                    } border border-transparent ${selectedChatId === chat.id ? 'border-blue-500/30' : 'hover:border-zinc-600/30'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-zinc-100 truncate">{chat.title || 'New Chat'}</h4>
                      <p className="text-xs text-zinc-400 mt-1">
                        {formatInTimeZone(chat.created_at, userTimeZone, 'dd MMM yyyy, hh:mm a')}
                      </p>
                    </div>
                    
                    {/* Delete button has been removed */}
                  </div>
                </div>
              ))}
            </div>

            {/* User info for mobile */}
            <div className="mt-8 pt-6 border-t border-zinc-700/50 sm:hidden">
              <div className="bg-gradient-to-r from-zinc-800/50 to-slate-800/50 rounded-lg p-3 border border-zinc-700/30">
                <p className="text-sm text-zinc-300 mb-2">Logged in as:</p>
                <p className="text-sm font-medium text-zinc-200 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-20"
            onClick={() => setSidebarOpen(false)}
            style={{ top: '73px' }}
          />
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChatId ? (
            <ChatView key={selectedChatId} chatId={selectedChatId} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  <img
                    src="/Untitled_design-5-removebg-preview.png"
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-zinc-300 mb-2">Welcome to Chatbot</h3>
                <p className="text-zinc-500 mb-4">Select a chat to start messaging or create a new one</p>

                {/* Quick Stats */}
                <div className="flex justify-center space-x-6 text-sm text-zinc-400">
                  <div className="text-center">
                    <div className="font-semibold text-blue-400">{chats.length}</div>
                    <div>Total Chats</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-400">{isOnline ? 'Online' : 'Offline'}</div>
                    <div>Status</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
