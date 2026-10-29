"use client";

import React, { useState } from 'react';
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';

export default function ChatInput() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { addMessage, currentChatId } = useChatStore();
  const { user } = useAuthStore();

  const handleSend = async () => {
    if (!text.trim() || isLoading || !currentChatId) return;

    const query = text.trim();

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

      addMessage({ text: data.reply, sender: 'ai' });
    } catch (error) {
      console.error(error);
      addMessage({
        text: 'Error: Could not reach the AI.',
        sender: 'ai',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isDisabled = !currentChatId || isLoading;

  return (
    <div className="flex items-end gap-3 border-t border-gray-200 bg-white p-4">
      <textarea
        rows={1}
        placeholder={
          currentChatId
            ? 'Type your message here...'
            : 'Select or create a chat to begin'
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        className="max-h-32 min-h-12 flex-1 resize-none overflow-y-auto rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#f7690a] focus:ring-2 focus:ring-[#f7690a] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
        style={{ fieldSizing: 'content' }}
      />

      <button
        type="button"
        onClick={handleSend}
        disabled={!text.trim() || isDisabled}
        className="flex min-h-12 min-w-24 items-center justify-center gap-2 rounded-xl bg-[#f7690a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#f7690a] focus:outline-none focus:ring-2 focus:ring-[#f7690a] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#ff9854]"
      >
        {isLoading ? (
          <>
            <span
              className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
              role="status"
              aria-label="Sending message"
            />
            <span>Sending</span>
          </>
        ) : (
          'Send'
        )}
      </button>
    </div>
  );
}