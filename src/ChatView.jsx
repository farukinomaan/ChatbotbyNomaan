/**
 * @copyright Nomaan Faruki - 2025
 */

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useUserData } from '@nhost/react';
import { formatInTimeZone } from 'date-fns-tz';
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Use QUERY instead of SUBSCRIPTION for better user switching support
const GET_MESSAGES_QUERY = gql`
  query GetMessages($chatId: uuid!) {
    messages(where: { chat_id: { _eq: $chatId } }, order_by: { created_at: asc }) {
      id
      content
      created_at
      is_from_bot
      user_id
    }
  }
`;

const INSERT_MESSAGE_MUTATION = gql`
  mutation InsertMessage($chatId: uuid!, $content: String!, $is_from_bot: Boolean!) {
    insert_messages_one(object: { chat_id: $chatId, content: $content, is_from_bot: $is_from_bot }) {
      id
      content
      created_at
      is_from_bot
      user_id
    }
  }
`;

const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($chatId: uuid!, $content: String!) {
    sendMessage(input: { chatId: $chatId, content: $content }) {
      content
    }
  }
`;

export default function ChatView({ chatId, userId }) {
    const user = useUserData();
    const [messageContent, setMessageContent] = useState('');
    const messagesEndRef = useRef(null);

    // Add custom styles for animations
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeIn {
                animation: fadeIn 0.3s ease-out forwards;
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    // Debug logging
    useEffect(() => {
        console.log('ChatView props:', { chatId, userId, userFromHook: user?.id });
    }, [chatId, userId, user?.id]);

    // Use query with polling for real-time updates instead of subscription
    const { data, loading, error, refetch } = useQuery(GET_MESSAGES_QUERY, {
        variables: { chatId },
        skip: !chatId,
        fetchPolicy: 'cache-and-network', // Always fetch from network first
        errorPolicy: 'all',
        pollInterval: 2000, // Poll every 2 seconds for new messages
        notifyOnNetworkStatusChange: true,
        onError: (err) => {
            console.error('Messages query error:', err);
        },
    });

    // Reset message content when chat changes
    useEffect(() => {
        setMessageContent('');
    }, [chatId]);

    const [insertMessage] = useMutation(INSERT_MESSAGE_MUTATION, {
        onError: (error) => {
            console.error('Insert message error:', error);
        },
        onCompleted: () => {
            // Refetch messages after inserting
            refetch();
        }
    });

    const [sendMessageMutation, { loading: sendingMessage }] = useMutation(SEND_MESSAGE_MUTATION, {
        onError: (error) => {
            console.error('Send message mutation error:', error);
        }
    });

    useEffect(() => {
        if (data?.messages?.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [data?.messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageContent.trim() || !chatId || !user?.id) {
            console.log('Cannot send message:', { 
                messageContent: messageContent.trim(), 
                chatId, 
                userId: user?.id 
            });
            return;
        }

        const currentMessage = messageContent.trim();
        setMessageContent('');

        try {
            console.log('Sending message:', { chatId, content: currentMessage });
            
            // Insert user message
            await insertMessage({ 
                variables: { 
                    chatId, 
                    content: currentMessage, 
                    is_from_bot: false 
                } 
            });

            // Send message to get bot response
            const { data: actionResponse } = await sendMessageMutation({ 
                variables: { 
                    chatId, 
                    content: currentMessage 
                } 
            });

            if (actionResponse?.sendMessage?.content) {
                // Insert bot response
                await insertMessage({
                    variables: { 
                        chatId, 
                        content: actionResponse.sendMessage.content, 
                        is_from_bot: true 
                    },
                });
            }

            // Force refetch to ensure we have the latest messages
            setTimeout(() => {
                refetch();
            }, 500);
        } catch (err) {
            console.error('Error sending message:', err);
            setMessageContent(currentMessage); // Restore message on error
        }
    };

    // Early returns with better error handling
    if (!chatId) {
        return (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-zinc-900 to-slate-900">
                <div className="text-center text-zinc-400">
                    <p className="text-lg mb-2">No chat selected</p>
                    <p className="text-sm">Select a chat to start messaging.</p>
                </div>
            </div>
        );
    }

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-zinc-900 to-slate-900">
                <div className="text-center text-zinc-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-400 border-t-transparent mx-auto mb-4"></div>
                    <p>Loading messages...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-zinc-900 to-slate-900">
                <div className="text-center text-red-400">
                    <p className="text-lg mb-2">Error loading messages</p>
                    <p className="text-sm mb-4">{error.message}</p>
                    <button 
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const messages = data?.messages || [];

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-zinc-900 to-slate-900">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-zinc-500">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-6 relative">
                                {/* Animated chat bubble icon */}
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-20 animate-pulse"></div>
                                <div className="absolute inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-zinc-300 mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Ready to Chat!
                            </h3>
                            <p className="text-sm">Start a conversation by sending a message below.</p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isBot = msg.is_from_bot;
                        const isCurrentUser = msg.user_id === user?.id && !isBot;

                        return (
                            <div 
                                key={msg.id} 
                                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div
                                    className={`p-3 rounded-2xl max-w-[75%] relative transition-all duration-300 hover:scale-[1.02] ${isCurrentUser
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-md shadow-lg hover:shadow-xl'
                                            : isBot
                                                ? 'bg-gradient-to-r from-zinc-700 to-slate-700 text-zinc-100 rounded-bl-md shadow-lg border border-zinc-600/30 hover:border-zinc-500/50 hover:shadow-xl'
                                                : 'bg-gradient-to-r from-zinc-800 to-slate-800 text-zinc-200 rounded-bl-md shadow-lg hover:shadow-xl'
                                        }`}
                                >
                                    {/* Bot indicator */}
                                    {isBot && (
                                        <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-zinc-600/30">
                                            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-pulse"></div>
                                            <span className="text-xs text-zinc-400 font-medium">AI Assistant</span>
                                        </div>
                                    )}

                                    {/* Message content */}
                                    <p className="text-sm leading-relaxed">{msg.content}</p>

                                    {/* Timestamp */}
                                    <p className={`text-xs mt-2 ${isCurrentUser ? 'text-blue-100/80' : 'text-zinc-400'}`}>
                                        {formatInTimeZone(msg.created_at, userTimeZone, 'hh:mm a')}
                                    </p>

                                    {/* Message tail */}
                                    <div className={`absolute bottom-0 w-0 h-0 ${isCurrentUser
                                            ? 'right-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-blue-500 transform translate-x-[8px]'
                                            : 'left-0 border-r-[8px] border-r-transparent border-t-[8px] border-t-zinc-700 transform -translate-x-[8px]'
                                        }`}></div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-zinc-800/50 bg-gradient-to-r from-zinc-800/50 to-slate-800/50 p-4 backdrop-blur-sm relative">
                {/* Typing indicator overlay */}
                {sendingMessage && (
                    <div className="absolute top-0 left-4 right-4 flex items-center space-x-2 bg-zinc-800/90 rounded-lg px-3 py-2 text-zinc-400 text-sm transform -translate-y-full">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span>AI is thinking...</span>
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="flex gap-3 relative">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full px-4 py-3 pr-12 bg-gradient-to-r from-zinc-800 to-slate-800 border border-zinc-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent text-zinc-100 placeholder-zinc-400 shadow-inner transition-all duration-200 hover:border-zinc-600/50"
                            disabled={sendingMessage}
                        />
                        
                        {/* Character count indicator */}
                        {messageContent.length > 0 && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className={`text-xs px-2 py-1 rounded-full ${messageContent.length > 500 ? 'bg-red-500/20 text-red-400' : 'bg-zinc-700/50 text-zinc-400'}`}>
                                    {messageContent.length}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-purple-800 to-pink-800 hover:from-purple-700 hover:to-pink-700 disabled:from-purple-600 disabled:to-pink-600 text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 font-medium min-w-[80px] relative overflow-hidden group"
                        disabled={sendingMessage || !messageContent.trim()}
                    >
                        {/* Button shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        
                        {sendingMessage ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <span>Send</span>
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.429a1 1 0 001.17-1.409l-7-14z"></path>
                                </svg>
                            </div>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
