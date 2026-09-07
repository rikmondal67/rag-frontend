"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../store/useAuthStore';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const router = useRouter();
  const loginUser = useAuthStore((state) => state.loginUser);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      loginUser(data.user); 

      router.push('/'); 
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f6f8' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
          Welcome Back
        </Typography>
        
        <Box component="form" onSubmit={handleLogin}>
          <TextField 
            fullWidth 
            label="Email" 
            variant="outlined" 
            margin="normal" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
          <TextField 
            fullWidth 
            label="Password" 
            type="password" 
            variant="outlined" 
            margin="normal" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
          
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          
          <Button 
            fullWidth 
            type="submit" 
            variant="contained" 
            color="primary" 
            sx={{ mt: 3, py: 1.5, textTransform: 'none', fontSize: '1rem' }}
          >
            Log In
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}