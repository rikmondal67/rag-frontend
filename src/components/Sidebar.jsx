"use client";

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText,
  Divider,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';
import NewChatModal from './NewChatModal';

export default function Sidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { user, logoutUser } = useAuthStore();
  const { 
    chatHistory, 
    setCurrentChatId, 
    currentChatId, 
    clearMessages,
    setChatHistory 
  } = useChatStore();
  
  const router = useRouter();

  const handleLogout = () => {
    logoutUser();
    clearMessages();
    setChatHistory([]);
    setCurrentChatId(null);
    router.push('/login');
  };

  const handleSelectChat = (id) => {
    setCurrentChatId(id);
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation(); 
    
    
    const updatedHistory = chatHistory.filter((chat) => chat.id !== chatId);
    setChatHistory(updatedHistory);
    
    
    if (currentChatId === chatId) {
      setCurrentChatId(null);
      clearMessages();
    }

    
    try {
      await fetch(`/api/chats?chatId=${chatId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  return (
    <Box 
      sx={{ 
        width: 280, 
        backgroundColor: '#ffffff', 
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh'
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>
          My RAG App
        </Typography>
        <Button 
          variant="contained" 
          fullWidth 
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
          sx={{ textTransform: 'none', py: 1 }}
        >
          New Chat
        </Button>
      </Box>
      
      <Divider />

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List>
          {(!chatHistory || chatHistory.length === 0) ? (
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 4 }}>
              No chats found.
            </Typography>
          ) : (
            chatHistory.map((chat) => (
              <ListItem 
                key={chat.id} 
                disablePadding
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    aria-label="delete" 
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    sx={{ color: '#d32f2f', '&:hover': { backgroundColor: '#ffebee' } }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemButton 
                  selected={currentChatId === chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  sx={{
                    pr: 6, // Adds padding on the right so text doesn't overlap the trash icon
                    backgroundColor: currentChatId === chat.id ? '#e3f2fd' : 'transparent',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                >
                  <ListItemText 
                    disableTypography
                    primary={
                      <Typography 
                        variant="body1" 
                        noWrap 
                        sx={{ fontWeight: currentChatId === chat.id ? 'bold' : 'normal' }}
                      >
                        {chat.name}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </Box>

      <Divider />

      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', noWrap: true, maxWidth: '150px' }}>
          {user?.username || 'Guest'}
        </Typography>
        <Button 
          size="small" 
          color="error" 
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      <NewChatModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Box>
  );
}