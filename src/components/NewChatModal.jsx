"use client";

import React, { useState } from 'react';
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
    const selectedFile = e.target.files?.[0];

    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid PDF file.');
    }

    // Allow selecting the same file again.
    e.target.value = '';
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
      const trimmedChatName = chatName.trim();

      const formData = new FormData();
      formData.append('file', file);
      formData.append(
        'upload_preset',
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      );

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      if (!cloudName || !process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
        throw new Error('Cloudinary configuration is missing.');
      }

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const cloudinaryData = await cloudinaryRes.json();

      if (!cloudinaryRes.ok) {
        throw new Error(
          cloudinaryData.error?.message || 'Cloudinary upload failed'
        );
      }

      const backendRes = await fetch('/api/pdf-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: newChatId,
          chatName: trimmedChatName,
          cloudinaryUrl: cloudinaryData.secure_url,
          username: user.username,
        }),
      });

      const backendData = await backendRes.json().catch(() => ({}));

      if (!backendRes.ok) {
        throw new Error(
          backendData.error || 'Failed to process PDF on the server'
        );
      }

      addChatToHistory({
        id: newChatId,
        name: trimmedChatName,
      });

      setCurrentChatId(newChatId);

      setChatName('');
      setFile(null);
      setError('');
      onClose();
    } catch (err) {
      console.error('Failed to create chat:', err);
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-chat-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Modal header */}
        <div className="border-b border-gray-200 px-6 py-5">
          <h2
            id="new-chat-title"
            className="text-xl font-bold text-gray-900"
          >
            Create New Chat
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Give your chat a name and upload a PDF document.
          </p>
        </div>

        {/* Modal form */}
        <form id="new-chat-form" onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-5">
            <div>
              <label
                htmlFor="chat-name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Chat Name
              </label>

              <input
                id="chat-name"
                type="text"
                autoFocus
                required
                maxLength={100}
                placeholder="e.g. Machine Learning Notes"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                disabled={isUploading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#f7690a] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="pdf-file"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                PDF Document
              </label>

              <label
                htmlFor="pdf-file"
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
                  isUploading
                    ? 'cursor-not-allowed border-gray-200 bg-gray-50'
                    : file
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <svg
                  className="mb-3 h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16V4m0 0L8 8m4-4 4 4M4 16.5v2A1.5 1.5 0 005.5 20h13a1.5 1.5 0 001.5-1.5v-2"
                  />
                </svg>

                <span className="break-all text-sm font-medium text-gray-800">
                  {file ? file.name : 'Click to upload a PDF'}
                </span>

                <span className="mt-1 text-xs text-gray-500">
                  PDF files only
                </span>

                <input
                  id="pdf-file"
                  type="file"
                  accept=".pdf,application/pdf"
                  disabled={isUploading}
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}
          </div>

          {/* Modal actions */}
          <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUploading || !chatName.trim() || !file}
              className="flex min-w-36 items-center justify-center gap-2 rounded-lg bg-[#f7690a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#f7690a] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isUploading && (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  role="status"
                  aria-label="Uploading"
                />
              )}

              {isUploading ? 'Processing...' : 'Create Chat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}