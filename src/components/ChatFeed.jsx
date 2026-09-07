"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import useChatStore from '../store/useChatStore';

export default function ChatFeed() {
  const { messages, currentChatId, setMessages } = useChatStore();
  const [isFetching, setIsFetching] = useState(false);

  
  useEffect(() => {
    const fetchMessages = async () => {
      
      if (!currentChatId) {
        setMessages([]);
        return;
      }

      setIsFetching(true);
      
      try {
        const res = await fetch(`/api/messages?chatId=${currentChatId}`);
        const data = await res.json();
        
        if (data.success) {
          setMessages(data.messages || []);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
        setMessages([]);
      } finally {
        setIsFetching(false);
      }
    };

    fetchMessages();
  }, [currentChatId, setMessages]); 
  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Show a spinner while the database is fetching old messages */}
      {isFetching ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (!messages || messages.length === 0) ? (
        <Typography variant="body1" color="textSecondary" sx={{ mt: 5, textAlign: 'center' }}>
          No messages yet. Send a message to start!
        </Typography>
      ) : (
        messages.map((msg, index) => {
          const isUser = msg.sender === 'user' || msg.role === 'user';
          
          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  backgroundColor: isUser ? '#1976d2' : '#ffffff',
                  color: isUser ? '#ffffff' : '#000000',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body1">{msg.content || msg.text}</Typography>
              </Paper>
            </Box>
          );
        })
      )}
    </Box>
  );
}