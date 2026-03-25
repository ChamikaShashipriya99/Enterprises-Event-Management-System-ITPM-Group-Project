import React, { useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import chatService from "../services/chatService";
import toast from 'react-hot-toast';
import axios from 'axios';

const ENDPOINT = "http://localhost:5000";
var selectedChatCompare;

const ChatPage = () => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editMessageId, setEditMessageId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [previewImage, setPreviewImage] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showMediaOnly, setShowMediaOnly] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const { currentUser, socket } = useContext(AuthContext);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
            setRecordingTime(0);
        }
        return () => clearInterval(timerRef.current);
    }, [isRecording]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!socket) return;

        setSocketConnected(true);
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop-typing", () => setIsTyping(false));

        socket.on("user-status-changed", (data) => {
            setChats(prevChats => 
                prevChats.map(chat => {
                    const updatedParticipants = chat.participants.map(p => 
                        p._id === data.userId ? { ...p, isOnline: data.isOnline, lastSeen: data.lastSeen } : p
                    );
                    return { ...chat, participants: updatedParticipants };
                })
            );
        });

        socket.on("message-updated", (updatedMessage) => {
            setMessages(prev => prev.map(m => m._id === updatedMessage._id ? updatedMessage : m));
        });

        socket.on("message-removed", (messageId) => {
            setMessages(prev => prev.filter(m => m._id !== messageId));
            toast("A message was deleted", {
                icon: '🗑️',
                style: {
                    background: '#1e293b',
                    color: '#f8fafc',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '12px',
                }
            });
        });

        return () => {
            socket.off("typing");
            socket.off("stop-typing");
            socket.off("user-status-changed");
            socket.off("message-updated");
            socket.off("message-removed");
        };
    }, [socket]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const fetchedChats = await chatService.fetchChats(currentUser.token);
                setChats(fetchedChats);

                // Auto-access global chat if no chat is selected
                if (!selectedChat) {
                    const global = await chatService.accessGlobalChat(currentUser.token);
                    if (!fetchedChats.find(c => c._id === global._id)) {
                        setChats([global, ...fetchedChats]);
                    }
                    setSelectedChat(global);
                }
            } catch (error) {
                console.error("Error fetching initial data", error);
            }
        };
        fetchInitialData();
    }, [currentUser]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedChat) return;

            try {
                setLoading(true);
                setPage(1);
                const data = await chatService.fetchMessages(selectedChat._id, currentUser.token, 1);
                setMessages(data.messages);
                setHasMore(data.hasMore);
                setLoading(false);
                socket.emit("join-chat", selectedChat._id);
                socket.emit("mark-as-read", { chatId: selectedChat._id, userId: currentUser._id });
                
                // Reset unread count for this chat locally
                setChats(prev => prev.map(c => c._id === selectedChat._id ? { ...c, unreadCount: 0 } : c));
            } catch (error) {
                console.error("Error fetching messages", error);
                setLoading(false);
            }
        };
        fetchMessages();
        selectedChatCompare = selectedChat;
        setSearchTerm("");
        setShowMediaOnly(false);
        // On mobile, close sidebar when a chat is selected
        if (window.innerWidth <= 768) setIsSidebarOpen(false);
    }, [selectedChat]);

    const fetchMoreMessages = async () => {
        if (!hasMore || loading) return;
        try {
            const nextPage = page + 1;
            const data = await chatService.fetchMessages(selectedChat._id, currentUser.token, nextPage);
            setMessages(prev => [...data.messages, ...prev]);
            setHasMore(data.hasMore);
            setPage(nextPage);
        } catch (error) {
            console.error("Error fetching more messages", error);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], "voice-message.webm", { type: 'audio/webm' });
                handleVoiceUpload(audioFile);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error starting recording:", error);
            toast.error("Microphone access denied");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleVoiceUpload = async (file) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("file", file);
            formData.append("chatId", selectedChat._id);

            const uploadRes = await chatService.uploadFile(formData, currentUser.token);

            const { data } = await chatService.sendMessage(
                "Voice Message",
                selectedChat._id,
                currentUser.token,
                uploadRes.fileUrl,
                'audio'
            );

            if (data) {
                console.log("Voice message sent successfully:", data);
                socket.emit("new-message", data);
                setMessages(prev => [...prev, data]);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error uploading voice message", error);
            setLoading(false);
            toast.error("Failed to send voice message");
        }
    };

    const filteredMessages = messages.filter(m => {
        const matchesSearch = m.content?.toLowerCase().includes(searchTerm.toLowerCase());
        const isMedia = m.fileUrl;
        if (showMediaOnly) return isMedia && matchesSearch;
        return matchesSearch;
    });

    useEffect(() => {
        if (!socket) return;
        const messageListener = (newMessageReceived) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
                // ... logic for unread count already exists
                setChats(prev => prev.map(c => 
                    c._id === newMessageReceived.chat._id ? { ...c, unreadCount: (c.unreadCount || 0) + 1, lastMessage: newMessageReceived } : c
                ));
            } else {
                setMessages(prev => [...prev, newMessageReceived]);
                socket.emit("mark-as-read", { chatId: selectedChatCompare._id, userId: currentUser._id });
            }
        };

        const readListener = (data) => {
            if (selectedChatCompare && selectedChatCompare._id === data.chatId && data.readerId !== currentUser._id) {
                setMessages(prev => prev.map(m => m.sender._id === currentUser._id ? { ...m, isRead: true } : m));
            }
        };

        const reactionListener = (updatedMessage) => {
            setMessages(prev => prev.map(m => m._id === updatedMessage._id ? updatedMessage : m));
        };

        const pinnedUpdateListener = (updatedChat) => {
            if (selectedChatCompare && selectedChatCompare._id === updatedChat._id) {
                setSelectedChat(updatedChat);
                // Update in chats list too
                setChats(prev => prev.map(c => c._id === updatedChat._id ? { ...c, pinnedMessages: updatedChat.pinnedMessages } : c));
            }
        };

        const chatClearedListener = ({ chatId }) => {
            if (selectedChatCompare && selectedChatCompare._id === chatId) {
                setMessages([]);
                setSelectedChat(prev => ({ ...prev, lastMessage: null, pinnedMessages: [] }));
                toast("Chat history was cleared by an admin", { icon: '🧹' });
            }
        };

        socket.on("message-received", messageListener);
        socket.on("messages-read", readListener);
        socket.on("reaction-updated", reactionListener);
        socket.on("chat-pinned-updated", pinnedUpdateListener);
        socket.on("chat-cleared", chatClearedListener);

        return () => {
            socket.off("message-received", messageListener);
            socket.off("messages-read", readListener);
            socket.off("reaction-updated", reactionListener);
            socket.off("chat-pinned-updated", pinnedUpdateListener);
            socket.off("chat-cleared", chatClearedListener);
        };
    }, [socket, currentUser]);

    const handleClearChat = async () => {
        if (!window.confirm("Are you sure you want to clear the entire chat history? This cannot be undone.")) return;
        
        try {
            await chatService.clearChat(selectedChat._id, currentUser.token);
            socket.emit("clear-chat", { chatId: selectedChat._id });
            setMessages([]);
            setSelectedChat(prev => ({ ...prev, lastMessage: null, pinnedMessages: [] }));
            toast.success("Chat history cleared");
        } catch (error) {
            console.error("Error clearing chat", error);
            toast.error("Failed to clear chat");
        }
    };

    const handleTogglePin = async (messageId) => {
        try {
            const data = await chatService.togglePinMessage(selectedChat._id, messageId, currentUser.token);
            socket.emit("message-pinned", data);
            setSelectedChat(data);
            setChats(prev => prev.map(c => c._id === data._id ? { ...c, pinnedMessages: data.pinnedMessages } : c));
            toast.success(data.pinnedMessages.some(m => m._id === messageId) ? "Message pinned" : "Message unpinned");
        } catch (error) {
            console.error("Error toggling pin", error);
            toast.error("Failed to pin message");
        }
    };

    const jumpToMessage = (messageId) => {
        const element = document.getElementById(`msg-${messageId}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.classList.add("highlight-pulse");
            setTimeout(() => element.classList.remove("highlight-pulse"), 2000);
        } else {
            toast("Searching for message...", { icon: '🔍' });
            // Advanced: If message not in DOM, we'd need to fetch more pages. 
            // For now, prompt to load more.
        }
    };

    const handleToggleReaction = async (messageId, emoji) => {
        try {
            const data = await chatService.toggleReaction(messageId, emoji, currentUser.token);
            socket.emit("message-reacted", data);
            setMessages(prev => prev.map(m => m._id === messageId ? data : m));
        } catch (error) {
            console.error("Error toggling reaction", error);
            toast.error("Failed to react to message");
        }
    };

    const handleSearch = async (e) => {
        setSearch(e.target.value);
        if (!e.target.value) {
            setSearchResult([]);
            return;
        }
        try {
            const data = await chatService.searchUsers(e.target.value, currentUser.token);
            setSearchResult(data);
        } catch (error) {
            console.error("Error searching users", error);
        }
    };

    const accessChat = async (userId) => {
        try {
            const data = await chatService.accessChat(userId, currentUser.token);
            if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
            setSelectedChat(data);
            setSearchResult([]);
            setSearch("");
        } catch (error) {
            console.error("Error accessing chat", error);
        }
    };

    const sendMessage = async (e) => {
        if ((e.key === "Enter" || e.type === "click") && newMessage) {
            socket.emit("stop-typing", selectedChat._id);
            try {
                const content = newMessage;
                setNewMessage("");
                const data = await chatService.sendMessage(content, selectedChat._id, currentUser.token);
                socket.emit("new-message", data);
                setMessages(prev => [...prev, data]);
            } catch (error) {
                console.error("Error sending message", error);
            }
        }
    };

    const handleEditMessage = async () => {
        if (!editContent) return;
        try {
            const data = await chatService.updateMessage(editMessageId, editContent, currentUser.token);
            socket.emit("message-edited", data);
            setMessages(messages.map(m => m._id === editMessageId ? data : m));
            setEditMessageId(null);
            setEditContent("");
        } catch (error) {
            console.error("Error updating message", error);
        }
    };

    const handleDeleteMessage = (messageId) => {
        setDeleteConfirmId(messageId);
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            const data = await chatService.deleteMessage(deleteConfirmId, currentUser.token);
            
            if (data.type === 'soft') {
                socket.emit("message-edited", data.updatedMessage);
                setMessages(prev => prev.map(m => m._id === deleteConfirmId ? data.updatedMessage : m));
                toast.success("Message removed by admin");
            } else {
                socket.emit("message-deleted", { messageId: deleteConfirmId, chatId: selectedChat._id });
                setMessages(prev => prev.filter(m => m._id !== deleteConfirmId));
                toast.success("Message deleted");
            }
            
            setDeleteConfirmId(null);
        } catch (error) {
            console.error("Error deleting message", error);
            toast.error("Failed to delete message");
            setDeleteConfirmId(null);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            const uploadRes = await chatService.uploadFile(formData, currentUser.token);
            const data = await chatService.sendMessage(
                "", 
                selectedChat._id, 
                currentUser.token, 
                uploadRes.fileUrl, 
                uploadRes.fileType
            );
            socket.emit("new-message", data);
            setMessages(prev => [...prev, data]);
            setLoading(false);
        } catch (error) {
            console.error("Error uploading file", error);
            setLoading(false);
        }
    };

    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop-typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    const getSender = (participants) => {
        if (!participants || participants.length === 0) return { name: "Unknown", isOnline: false };
        return participants[0]._id === currentUser._id ? participants[1] : participants[0];
    };

    return (
        <div className={`chat-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            {/* Sidebar Toggle (Mobile Only) */}
            <button 
                className="mobile-menu-btn"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? '✕' : '☰'}
            </button>

            {/* Sidebar Overlay (Mobile Only) */}
            {isSidebarOpen && window.innerWidth <= 768 && (
                <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <div className={`chat-sidebar ${isSidebarOpen ? 'active' : ''}`}>
                <div className="chat-search">
                    <input
                        type="text"
                        placeholder="Search students..."
                        className="input-field"
                        style={{ marginBottom: 0 }}
                        value={search}
                        onChange={handleSearch}
                    />
                    {searchResult.length > 0 && (
                        <div style={{ 
                            position: 'absolute', 
                            background: '#1e293b', 
                            width: '320px', 
                            zIndex: 10,
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            marginTop: '5px'
                        }}>
                            {searchResult.map(user => (
                                <div 
                                    key={user._id} 
                                    className="sidebar-item"
                                    onClick={() => accessChat(user._id)}
                                >
                                    <div className="user-avatar">{user.name.charAt(0)}</div>
                                    <div>{user.name}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {chats.map(chat => {
                        const isGroup = chat.isGroupChat;
                        const sender = isGroup ? { name: chat.chatName } : getSender(chat.participants);
                        return (
                            <div 
                                key={chat._id} 
                                className={`sidebar-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
                                onClick={() => setSelectedChat(chat)}
                            >
                                <div className="user-avatar" style={isGroup ? { background: '#10b981' } : {}}>
                                    {isGroup ? 'G' : sender.name.charAt(0)}
                                    {!isGroup && (
                                        <div 
                                            className={`status-dot ${sender.isOnline ? 'status-online' : 'status-offline'}`}
                                            style={{ position: 'absolute', bottom: 0, right: 0, border: '2px solid #0f172a', margin: 0 }}
                                        />
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                                        {sender.name}
                                        {isGroup && <span className="group-badge">Group</span>}
                                        {chat.unreadCount > 0 && <span className="unread-badge">{chat.unreadCount}</span>}
                                    </div>
                                    {chat.lastMessage && (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {chat.lastMessage.content}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Window */}
            <div className="chat-window">
                {selectedChat ? (
                    <>
                        <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div className="user-avatar" style={selectedChat.isGroupChat ? { background: '#10b981' } : {}}>
                                    {selectedChat.isGroupChat ? 'G' : getSender(selectedChat.participants).name.charAt(0)}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                                        {selectedChat.isGroupChat ? selectedChat.chatName : getSender(selectedChat.participants).name}
                                    </h2>
                                    {!selectedChat.isGroupChat && (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {getSender(selectedChat.participants).isOnline ? 'Online' : 
                                                `Last seen ${new Date(getSender(selectedChat.participants).lastSeen).toLocaleTimeString()}`}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input 
                                    type="text" 
                                    placeholder="Search messages..." 
                                    className="input-field" 
                                    style={{ marginBottom: 0, width: '200px', fontSize: '0.85rem', padding: '5px 10px' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button 
                                    className={`btn-primary ${showMediaOnly ? 'active' : ''}`} 
                                    style={{ padding: '6px 12px', fontSize: '0.8rem', background: showMediaOnly ? '#6366f1' : 'rgba(255,255,255,0.1)' }}
                                    onClick={() => setShowMediaOnly(!showMediaOnly)}
                                >
                                    {showMediaOnly ? 'Show All' : 'Gallery'}
                                </button>
                                {currentUser.role === 'admin' && selectedChat.chatName === 'Global Students' && (
                                    <button 
                                        className="btn-primary" 
                                        style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#ef4444' }}
                                        onClick={handleClearChat}
                                    >
                                        🧹 Clear Chat
                                    </button>
                                )}
                            </div>
                        </div>

                        {selectedChat.pinnedMessages && selectedChat.pinnedMessages.length > 0 && (
                            <div className="pinned-messages-bar">
                                <div className="pinned-icon">📌</div>
                                <div className="pinned-carousel">
                                    {selectedChat.pinnedMessages.map((pm, idx) => (
                                        <div key={pm._id} className="pinned-item" onClick={() => jumpToMessage(pm._id)}>
                                            <span className="pinned-sender">{pm.sender?.name}:</span>
                                            <span className="pinned-text">{pm.content?.substring(0, 40)}{pm.content?.length > 40 ? '...' : ''}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pinned-count">{selectedChat.pinnedMessages.length} pinned</div>
                            </div>
                        )}

                        <div className="chat-messages">
                            {hasMore && (
                                <div style={{ textAlign: 'center', padding: '10px' }}>
                                    <button 
                                        className="btn-primary" 
                                        style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.75rem', padding: '5px 15px' }}
                                        onClick={fetchMoreMessages}
                                    >
                                        Load Earlier Messages
                                    </button>
                                </div>
                            )}
                            {loading && messages.length === 0 ? (
                                <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>
                            ) : (
                                filteredMessages.map((m, i) => {
                                    if (!m || !m._id) return null;
                                    // Custom rendering for media gallery mode
                                    if (showMediaOnly && m.fileType === 'image') {
                                        return (
                                            <div key={m._id} className="gallery-item" onClick={() => setPreviewImage(`${ENDPOINT}${m.fileUrl}`)}>
                                                <img src={`${ENDPOINT}${m.fileUrl}`} alt="gallery" />
                                            </div>
                                        );
                                    }

                                    return (
                                        <div 
                                            key={m._id} 
                                            id={`msg-${m._id}`}
                                            className={`message-bubble ${m.sender._id === currentUser._id ? 'message-sent' : 'message-received'} ${m.sender.role === 'admin' ? 'message-admin' : ''}`}
                                        >
                                            {selectedChat.isGroupChat && (m.sender._id !== currentUser._id || m.sender.role === 'admin') && (
                                                <div style={{ fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '4px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    {m.sender._id !== currentUser._id ? m.sender.name : 'You (Admin)'}
                                                    {m.sender.role === 'admin' && <span className="admin-badge">ADMIN</span>}
                                                </div>
                                            )}
                                            
                                            {m.isDeletedByAdmin ? (
                                                <div className="admin-deleted-placeholder">
                                                    <i>⚠️ This message was removed by an administrator</i>
                                                </div>
                                            ) : editMessageId === m._id ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                    <input 
                                                        className="input-field" 
                                                        style={{ marginBottom: 0, padding: '5px' }}
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                    />
                                                    <div style={{ display: 'flex', gap: '5px' }}>
                                                        <button className="btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem' }} onClick={handleEditMessage}>Save</button>
                                                        <button className="btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)' }} onClick={() => setEditMessageId(null)}>Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div>
                                                        {m.content}
                                                        {m.isEdited && <span className="edited-tag">(edited)</span>}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px', marginTop: '4px' }}>
                                                        <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>
                                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {m.sender._id === currentUser._id && (
                                                            <span className={`read-receipt ${m.isRead ? 'read' : ''}`} style={{ fontSize: '0.8rem', lineHeight: 1 }}>
                                                                ✓✓
                                                            </span>
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            {m.fileUrl && !m.isDeletedByAdmin && (
                                                m.fileType === 'image' ? (
                                                    <img 
                                                        src={`${ENDPOINT}${m.fileUrl}`} 
                                                        alt="uploaded" 
                                                        className="message-image" 
                                                        style={{ cursor: 'zoom-in' }}
                                                        onClick={() => setPreviewImage(`${ENDPOINT}${m.fileUrl}`)}
                                                    />
                                                ) : m.fileType === 'audio' ? (
                                                    <div className="audio-message">
                                                        <audio src={`${ENDPOINT}${m.fileUrl}`} controls className="custom-audio-player" />
                                                    </div>
                                                ) : (
                                                    <a 
                                                        href={`${ENDPOINT}${m.fileUrl}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="message-file"
                                                    >
                                                        <span className="file-icon">📄</span>
                                                        <span>Download Attachment</span>
                                                    </a>
                                                )
                                            )}

                                            {!editMessageId && !m.isDeletedByAdmin && (
                                                <div className="message-actions">
                                                    <button className="action-btn" onClick={() => handleTogglePin(m._id)}>
                                                        {selectedChat.pinnedMessages?.some(p => p._id === m._id) ? '📍 Unpin' : '📌 Pin'}
                                                    </button>
                                                    {(m.sender._id === currentUser._id || currentUser.role === 'admin') && (
                                                        <>
                                                            {m.sender._id === currentUser._id && (
                                                                <button className="action-btn" onClick={() => {
                                                                    setEditMessageId(m._id);
                                                                    setEditContent(m.content);
                                                                }}>✎ Edit</button>
                                                            )}
                                                            <button className="action-btn" onClick={() => handleDeleteMessage(m._id)}>🗑 Delete</button>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {!m.isDeletedByAdmin && (
                                                <div className="reaction-picker">
                                                    {['👍', '❤️', '😂', '😮', '😢', '🔥'].map(emoji => (
                                                        <span 
                                                            key={emoji} 
                                                            className="reaction-emoji"
                                                            onClick={() => handleToggleReaction(m._id, emoji)}
                                                        >
                                                            {emoji}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {m.reactions && m.reactions.length > 0 && !m.isDeletedByAdmin && (
                                                <div className="message-reactions">
                                                    {Object.entries(
                                                        m.reactions.reduce((acc, r) => {
                                                            acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                                            return acc;
                                                        }, {})
                                                    ).map(([emoji, count]) => {
                                                        const hasReacted = m.reactions.some(r => r.emoji === emoji && r.user?._id === currentUser._id || r.user === currentUser._id);
                                                        return (
                                                            <div 
                                                                key={emoji} 
                                                                className={`reaction-badge ${hasReacted ? 'active' : ''}`}
                                                                onClick={() => handleToggleReaction(m._id, emoji)}
                                                            >
                                                                {emoji} {count > 1 ? count : ''}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                            {isTyping && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Typing...</div>}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="chat-input-area">
                            <input
                                type="file"
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                            <button 
                                className="btn-primary" 
                                style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.1)' }}
                                onClick={() => fileInputRef.current.click()}
                            >
                                📎
                            </button>
                            
                            {isRecording ? (
                                <div className="recording-status">
                                    <span className="recording-dot"></span>
                                    <span style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 600 }}>
                                        {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                                    </span>
                                    <button className="stop-btn" onClick={stopRecording}>⏹</button>
                                </div>
                            ) : (
                                <button 
                                    className="btn-primary" 
                                    style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.1)' }}
                                    onClick={startRecording}
                                >
                                    🎙️
                                </button>
                            )}

                            <input
                                type="text"
                                placeholder={isRecording ? "Recording..." : "Type a message..."}
                                className="input-field"
                                style={{ marginBottom: 0 }}
                                value={newMessage}
                                onChange={typingHandler}
                                onKeyDown={sendMessage}
                                disabled={isRecording}
                            />
                            <button 
                                className="btn-primary" 
                                style={{ padding: '8px 20px' }}
                                onClick={sendMessage}
                                disabled={isRecording}
                            >
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        Select a chat to start messaging
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {previewImage && (
                <div className="lightbox-overlay" onClick={() => setPreviewImage(null)}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <img src={previewImage} alt="preview" />
                        <button className="lightbox-close" onClick={() => setPreviewImage(null)}>&times;</button>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="lightbox-overlay" onClick={() => setDeleteConfirmId(null)}>
                    <div className="glass-card" onClick={(e) => e.stopPropagation()} style={{ padding: '30px', textAlign: 'center', maxWidth: '400px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚠️</div>
                        <h3 style={{ marginBottom: '10px' }}>Delete Message?</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '25px', fontSize: '0.9rem' }}>
                            Are you sure you want to remove this message? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <button 
                                className="btn-primary" 
                                style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 25px' }}
                                onClick={() => setDeleteConfirmId(null)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn-primary" 
                                style={{ background: '#ef4444', padding: '10px 25px' }}
                                onClick={handleConfirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatPage;
