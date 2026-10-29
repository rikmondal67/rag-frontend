"use client";

import React, { useState } from 'react';
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
    setChatHistory,
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

    const updatedHistory = chatHistory.filter(
      (chat) => chat.id !== chatId
    );

    setChatHistory(updatedHistory);

    if (currentChatId === chatId) {
      setCurrentChatId(null);
      clearMessages();
    }

    try {
      const res = await fetch(
        `/api/chats?chatId=${encodeURIComponent(chatId)}`,
        { method: 'DELETE' }
      );

      if (!res.ok) {
        throw new Error('Failed to delete chat from server');
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  return (
    <aside className="flex h-screen w-[280px] shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="p-4">
        <h1 className="mb-5 text-xl font-bold tracking-tight text-[#ff6c0a]">
          My RAG App
        </h1>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff6c0a] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#f7690a] focus:ring-offset-2"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 5v14m-7-7h14"
            />
          </svg>
          New Chat
        </button>
      </div>

      <div className="border-t border-gray-200" />

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto p-2">
        {!chatHistory || chatHistory.length === 0 ? (
          <p className="mt-8 px-3 text-center text-sm text-gray-500">
            No chats found.
          </p>
        ) : (
          <ul className="space-y-1">
            {chatHistory.map((chat) => {
              const isActive = currentChatId === chat.id;

              return (
                <li key={chat.id}>
                  <div
                    className={`group flex items-center gap-1 rounded-lg transition ${
                      isActive
                        ? 'bg-blue-50'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectChat(chat.id)}
                      title={chat.name}
                      aria-current={isActive ? 'page' : undefined}
                      className={`min-w-0 flex-1 truncate px-3 py-3 text-left text-sm ${
                        isActive
                          ? 'font-semibold text-blue-700'
                          : 'font-normal text-gray-700'
                      }`}
                    >
                      {chat.name}
                    </button>

                    <button
                      type="button"
                      aria-label={`Delete ${chat.name}`}
                      title="Delete chat"
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      className="mr-1 rounded-md p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2m-5 4v6m4-6v6"
                        />
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-gray-200" />

      {/* User profile and logout */}
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500">Signed in as</p>
          <p
            className="truncate text-sm font-semibold text-gray-800"
            title={user?.username || 'Guest'}
          >
            {user?.username || 'Guest'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 17l5-5-5-5m5 5H3m9-9h6a2 2 0 012 2v14a2 2 0 01-2 2h-6"
            />
          </svg>
          Logout
        </button>
      </div>

      <NewChatModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </aside>
  );
}