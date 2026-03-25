import React, { useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import chatService from "../services/chatService";

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

    const { currentUser, socket } = useContext(AuthContext);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

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
                const data = await chatService.fetchMessages(selectedChat._id, currentUser.token);
                setMessages(data);
                setLoading(false);
                socket.emit("join-chat", selectedChat._id);
                
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
    }, [selectedChat]);

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
                // Update unread count for non-selected chat
                setChats(prev => prev.map(c => 
                    c._id === newMessageReceived.chat._id ? { ...c, unreadCount: (c.unreadCount || 0) + 1, lastMessage: newMessageReceived } : c
                ));
            } else {
                setMessages([...messages, newMessageReceived]);
            }
        };
        socket.on("message-received", messageListener);
        return () => socket.off("message-received", messageListener);
    }, [socket, messages]);

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
                setMessages([...messages, data]);
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

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        try {
            const data = await chatService.deleteMessage(messageId, currentUser.token);
            socket.emit("message-deleted", { messageId, chatId: selectedChat._id });
            setMessages(messages.filter(m => m._id !== messageId));
        } catch (error) {
            console.error("Error deleting message", error);
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
            setMessages([...messages, data]);
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
        <div className="chat-container">
            {/* Sidebar */}
            <div className="chat-sidebar">
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
                            </div>
                        </div>
                        <div className="chat-messages">
                            {loading && messages.length === 0 ? (
                                <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>
                            ) : (
                                filteredMessages.map((m, i) => {
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
                                            className={`message-bubble ${m.sender._id === currentUser._id ? 'message-sent' : 'message-received'}`}
                                        >
                                            {selectedChat.isGroupChat && m.sender._id !== currentUser._id && (
                                                <div style={{ fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '4px', opacity: 0.8 }}>
                                                    {m.sender.name}
                                                </div>
                                            )}
                                            
                                            {editMessageId === m._id ? (
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
                                                    <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                                                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </>
                                            )}

                                            {m.fileUrl && (
                                                m.fileType === 'image' ? (
                                                    <img 
                                                        src={`${ENDPOINT}${m.fileUrl}`} 
                                                        alt="uploaded" 
                                                        className="message-image" 
                                                        style={{ cursor: 'zoom-in' }}
                                                        onClick={() => setPreviewImage(`${ENDPOINT}${m.fileUrl}`)}
                                                    />
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

                                            {m.sender._id === currentUser._id && !editMessageId && (
                                                <div className="message-actions">
                                                    <button className="action-btn" onClick={() => {
                                                        setEditMessageId(m._id);
                                                        setEditContent(m.content);
                                                    }}>✎ Edit</button>
                                                    <button className="action-btn" onClick={() => handleDeleteMessage(m._id)}>🗑 Delete</button>
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
                            <input
                                type="text"
                                placeholder="Type a message..."
                                className="input-field"
                                style={{ marginBottom: 0 }}
                                value={newMessage}
                                onChange={typingHandler}
                                onKeyDown={sendMessage}
                            />
                            <button 
                                className="btn-primary" 
                                style={{ padding: '8px 20px' }}
                                onClick={sendMessage}
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
        </div>
    );
};

export default ChatPage;
