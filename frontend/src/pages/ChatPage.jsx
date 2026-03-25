import React, { useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import chatService from '../services/chatService';

const ENDPOINT = 'http://localhost:5000';
let socket, selectedChatCompare;

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

    const { currentUser } = useContext(AuthContext);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        socket = io(ENDPOINT, {
            transports: ['websocket'],
            upgrade: false
        });
        socket.emit("setup", currentUser);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop-typing", () => setIsTyping(false));

        return () => {
            socket.disconnect();
        };
    }, []);

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
            } catch (error) {
                console.error("Error fetching messages", error);
                setLoading(false);
            }
        };
        fetchMessages();
        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        const messageListener = (newMessageReceived) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
                // Future: notify user
            } else {
                setMessages([...messages, newMessageReceived]);
            }
        };
        socket.on("message-received", messageListener);
        return () => socket.off("message-received", messageListener);
    });

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
        if (!participants || participants.length === 0) return { name: "Unknown" };
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
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                                        {sender.name}
                                        {isGroup && <span className="group-badge">Group</span>}
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
                        <div className="chat-header">
                            <div className="user-avatar" style={selectedChat.isGroupChat ? { background: '#10b981' } : {}}>
                                {selectedChat.isGroupChat ? 'G' : getSender(selectedChat.participants).name.charAt(0)}
                            </div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                                {selectedChat.isGroupChat ? selectedChat.chatName : getSender(selectedChat.participants).name}
                            </h2>
                        </div>
                        <div className="chat-messages">
                            {loading && messages.length === 0 ? (
                                <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>
                            ) : (
                                messages.map((m, i) => (
                                    <div 
                                        key={m._id} 
                                        className={`message-bubble ${m.sender._id === currentUser._id ? 'message-sent' : 'message-received'}`}
                                    >
                                        {selectedChat.isGroupChat && m.sender._id !== currentUser._id && (
                                            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '4px', opacity: 0.8 }}>
                                                {m.sender.name}
                                            </div>
                                        )}
                                        <div>{m.content}</div>
                                        {m.fileUrl && (
                                            m.fileType === 'image' ? (
                                                <img 
                                                    src={`${ENDPOINT}${m.fileUrl}`} 
                                                    alt="uploaded" 
                                                    className="message-image" 
                                                    onClick={() => window.open(`${ENDPOINT}${m.fileUrl}`, '_blank')}
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
                                    </div>
                                ))
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
        </div>
    );
};

export default ChatPage;
