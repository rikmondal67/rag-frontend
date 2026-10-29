"use client";

import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import ChatFeed from '../components/ChatFeed';
import ChatInput from '../components/ChatInput';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';

export default function ChatAppHome() {
  const { user, hasHydrated } = useAuthStore();
  const { setChatHistory } = useChatStore();
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      router.replace('/login');
    }
  }, [hasHydrated, user, router]);

  useEffect(() => {
    if (!hasHydrated || !user?.username) return;

    const fetchChats = async () => {
      try {
        const res = await fetch(
          `/api/chats?username=${encodeURIComponent(user.username)}`
        );

        if (!res.ok) {
          throw new Error(`Failed to load chats (${res.status})`);
        }

        const data = await res.json();

        if (data.success) {
          setChatHistory(data.chats);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };

    fetchChats();
  }, [hasHydrated, user, setChatHistory]);

  if (!hasHydrated || !user) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f4f6f8',
        }}
      >
        <p
          style={{
            fontFamily: 'sans-serif',
            color: '#666',
            fontSize: '1.2rem',
          }}
        >
          Loading...
        </p>
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