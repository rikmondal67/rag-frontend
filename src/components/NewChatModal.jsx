"use client";

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  CircularProgress, 
  Typography, 
  Box 
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';

export default function NewChatModal({ open, onClose }) {
  const [chatName, setChatName] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const { addChatToHistory, setCurrentChatId } = useChatStore();
  const { user } = useAuthStore(); 

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid PDF file.');
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setChatName('');
      setFile(null);
      setError('');
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Security check: Must be logged in
    if (!user || !user.username) {
      setError('You must be logged in to create a chat.');
      return;
    }

    if (!chatName.trim() || !file) {
      setError('Please provide both a chat name and a PDF file.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const newChatId = uuidv4();
      
      addChatToHistory({ id: newChatId, name: chatName });
      setCurrentChatId(newChatId);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: 'POST',
        body: formData,
      });

      const cloudinaryData = await cloudinaryRes.json();

      if (!cloudinaryRes.ok) {
        throw new Error(cloudinaryData.error?.message || 'Cloudinary upload failed');
      }

      const backendRes = await fetch('/api/pdf-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: newChatId,
          chatName: chatName,
          cloudinaryUrl: cloudinaryData.secure_url,
          username: user.username, 
        }),
      });

      if (!backendRes.ok) {
        throw new Error('Failed to process PDF on the server');
      }

      handleClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>Create New Chat</DialogTitle>
      <DialogContent>
        <Box component="form" id="new-chat-form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Chat Name"
            type="text"
            fullWidth
            variant="outlined"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            disabled={isUploading}
            sx={{ mb: 3 }}
          />
          
          <Button
            variant="outlined"
            component="label"
            fullWidth
            disabled={isUploading}
            sx={{ mb: 1, textTransform: 'none' }}
          >
            {file ? file.name : 'Upload PDF Document'}
            <input
              type="file"
              hidden
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </Button>

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isUploading} color="inherit">
          Cancel
        </Button>
        <Button 
          type="submit" 
          form="new-chat-form" 
          variant="contained" 
          color="primary"
          disabled={isUploading || !chatName.trim() || !file}
          startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isUploading ? 'Processing...' : 'Create Chat'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}