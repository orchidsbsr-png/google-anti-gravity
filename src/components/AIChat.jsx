import React, { useState } from 'react';
import './AIChat.css';

const AIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm your fruit expert. Ask me anything about our fruits!", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simple rule-based response
        setTimeout(() => {
            let responseText = "I'm not sure about that. Try asking about a specific fruit!";
            const lowerInput = input.toLowerCase();

            if (lowerInput.includes('apple')) {
                responseText = "Our apples are fresh from the orchard! We have Red Delicious, Granny Smith, and more. They are great for snacking or baking.";
            } else if (lowerInput.includes('pear')) {
                responseText = "Our pears are sweet and juicy. Try the Nashpati or Red Max!";
            } else if (lowerInput.includes('kiwi')) {
                responseText = "Kiwis are packed with Vitamin C. Perfect for a healthy boost.";
            } else if (lowerInput.includes('delivery')) {
                responseText = "We deliver within 24 hours. Delivery is free for orders above ₹500!";
            } else if (lowerInput.includes('price')) {
                responseText = "You can check the latest prices on the product pages. We offer competitive rates for fresh produce.";
            }

            const botMsg = { id: Date.now() + 1, text: responseText, sender: 'bot' };
            setMessages(prev => [...prev, botMsg]);
        }, 1000);
    };

    return (
        <>
            <div className={`chat-widget ${isOpen ? 'open' : ''} glass`}>
                <div className="chat-header" onClick={toggleChat}>
                    <span>🍏 Fruit Expert AI</span>
                    <button className="close-btn">×</button>
                </div>
                <div className="chat-body">
                    {messages.map(msg => (
                        <div key={msg.id} className={`message ${msg.sender}`}>
                            {msg.text}
                        </div>
                    ))}
                </div>
                <form className="chat-input" onSubmit={handleSend}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about fruits..."
                    />
                    <button type="submit">➤</button>
                </form>
            </div>

            {!isOpen && (
                <button className="chat-toggle-btn glass-strong" onClick={toggleChat}>
                    💬
                </button>
            )}
        </>
    );
};

export default AIChat;
