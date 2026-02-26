import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import './ChatPage.css';

const ChatPage = () => {
    const [message, setMessage] = useState('');
    const [messageList, setMessageList] = useState([]);
    const [isAiTyping, setIsAiTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messageList]);

    const sendMessage = async (text) => {
        const msgText = text || message;
        if (msgText.trim() === '') return;

        const userMsg = {
            author: 'You',
            message: msgText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessageList((list) => [...list, userMsg]);
        setMessage('');
        setIsAiTyping(true);

        try {
            const response = await api.post('/retrieve', {
                query: msgText,
                userId: "demo-user",
                k: 3
            });

            const combinedText = response.data
                .map((item, index) => `🔹 Result ${index + 1}:\n${item.text}`)
                .join("\n\n");

            const aiMsg = {
                author: 'AI Assistant',
                message: combinedText || "No relevant information found.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setMessageList((list) => [...list, aiMsg]);

        } catch (error) {
            const errMsg = {
                author: 'AI Assistant',
                message: '⚠️ Error connecting to AI server. Please try again.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessageList((list) => [...list, errMsg]);
        } finally {
            setIsAiTyping(false);
        }
    };

    const suggestions = [
        "What's my total spending this month?",
        "Summarize my uploaded documents",
        "Explain AML compliance rules",
        "What risks are in my transactions?"
    ];

    return (
        <div className="page-layout">
            <Sidebar />
            <div className="chat-page">

                {/* Header */}
                <div className="chat-top-bar">
                    <h2>AI Financial Assistant</h2>
                </div>

                {/* Messages */}
                <div className="chat-messages-area">
                    {messageList.length === 0 && !isAiTyping && (
                        <div className="chat-welcome">
                            <h3>How can I help you today?</h3>
                            <div className="suggestions-grid">
                                {suggestions.map((s, i) => (
                                    <button key={i} onClick={() => sendMessage(s)}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messageList.map((msg, index) => (
                        <div key={index} className={`chat-msg ${msg.author === 'You' ? 'user-msg' : 'ai-msg'}`}>
                            <div className="msg-bubble">
                                <p style={{ whiteSpace: "pre-line" }}>{msg.message}</p>
                                <span className="msg-time">{msg.time}</span>
                            </div>
                        </div>
                    ))}

                    {isAiTyping && (
                        <div className="chat-msg ai-msg">
                            <div className="msg-bubble typing-bubble">
                                AI is thinking...
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="chat-input-bar">
                    <input
                        type="text"
                        value={message}
                        placeholder="Ask about your finances..."
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button onClick={() => sendMessage()} disabled={!message.trim()}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;