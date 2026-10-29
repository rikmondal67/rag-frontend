"use client";

import React, { useEffect, useState } from 'react';
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
        console.error('Failed to load messages:', error);
        setMessages([]);
      } finally {
        setIsFetching(false);
      }
    };

    fetchMessages();
  }, [currentChatId, setMessages]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6">
      {isFetching ? (
        <div className="mt-5 flex justify-center">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#f7690a]"
            role="status"
            aria-label="Loading messages"
          />
        </div>
      ) : !messages || messages.length === 0 ? (
        <p className="mt-5 text-center text-sm text-gray-500">
          No messages yet. Send a message to start!
        </p>
      ) : (
        messages.map((msg, index) => {
          const isUser = msg.sender === 'user' || msg.role === 'user';

          return (
            <div
              key={msg._id || msg.id || index}
              className={`mb-4 flex ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] whitespace-pre-wrap rounded-2xl px-4 py-3 shadow-sm ${
                  isUser
                    ? 'rounded-br-sm bg-[#f7690a] text-white'
                    : 'rounded-bl-sm border border-gray-200 bg-white text-gray-900'
                }`}
              >
                <p className="text-sm leading-6">
                  {msg.content || msg.text}
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}