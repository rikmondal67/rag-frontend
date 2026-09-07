"use client";

import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import ChatFeed from '../components/ChatFeed';
import ChatInput from '../components/ChatInput';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore'; 

export default function ChatAppHome() {
  const { user } = useAuthStore();
  const { setChatHistory } = useChatStore(); 
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);

  // 1. The Bouncer (Authentication Check)
  useEffect(() => {
    setIsMounted(true);
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

 
  useEffect(() => {
    const fetchChats = async () => {
      
      if (user && user.username) {
        try {
          const res = await fetch(`/api/chats?username=${user.username}`);
          const data = await res.json();
          
          if (data.success) {
            setChatHistory(data.chats); 
          }
        } catch (error) {
          console.error("Failed to load chat history:", error);
        }
      }
    };

    fetchChats();
  }, [user, setChatHistory]); 

  
  if (!isMounted || !user) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f6f8' }}>
        <p style={{ fontFamily: 'sans-serif', color: '#666', fontSize: '1.2rem' }}>Loading...</p>
      </div>
    );
  }

  
  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f4f6f8' }}>
      <Sidebar />
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <ChatFeed />
        <ChatInput />
      </Box>
    </Box>
  );
}