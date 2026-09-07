"use client";

import React, { useState } from 'react';
import { Box, TextField, Button, CircularProgress } from '@mui/material';
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';

export default function ChatInput() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

 
  const { addMessage, currentChatId } = useChatStore();
  const { user } = useAuthStore();

  const handleSend = async () => {
    if (!text.trim() || isLoading) return;

    
    const query = text;
    addMessage({ text: query, sender: 'user' });
    
    setText(''); 
    setIsLoading(true); 

    try {
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user?.username || 'Guest',
          query: query,
          chatId: currentChatId, 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch AI response');
      }

      // 3. Display the AI's reply in the UI
      addMessage({ text: data.reply, sender: 'ai' });

    } catch (error) {
      console.error(error);
      addMessage({ text: "Error: Could not reach the AI.", sender: 'ai' });
    } finally {
      setIsLoading(false);
    }
  };

  // Allow sending with the Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ p: 2, backgroundColor: '#fff', borderTop: '1px solid #e0e0e0', display: 'flex', gap: 1 }}>
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder={currentChatId ? "Type your message here..." : "Select or create a chat to begin"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading || !currentChatId} 
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSend}
        disabled={!text.trim() || isLoading || !currentChatId}
        sx={{ minWidth: '100px' }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Send'}
      </Button>
    </Box>
  );
}