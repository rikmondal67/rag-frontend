"use client";

import React, { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

  
      router.push('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
          Create an Account
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Username" name="username" margin="normal" required value={formData.username} onChange={handleChange} />
          <TextField fullWidth label="Email" name="email" type="email" margin="normal" required value={formData.email} onChange={handleChange} />
          <TextField fullWidth label="Password" name="password" type="password" margin="normal" required value={formData.password} onChange={handleChange} />
          
          <Button fullWidth type="submit" variant="contained" color="primary" disabled={isLoading} sx={{ mt: 3, py: 1.5 }}>
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </Button>
        </form>
        
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Already have an account? <Button color="primary" onClick={() => router.push('/login')}>Log In</Button>
        </Typography>
      </Paper>
    </Box>
  );
}