import { create } from 'zustand';

const useChatStore = create((set) => ({
  // ==========================================
  // 1. CHAT SESSION HISTORY (Sidebar State)
  // ==========================================
  chatHistory: [],
  currentChatId: null,
  
  setChatHistory: (chats) => set({ chatHistory: chats }),
  
  addChatToHistory: (chat) => set((state) => ({ 
    chatHistory: [chat, ...state.chatHistory] 
  })),
  
  setCurrentChatId: (id) => set({ currentChatId: id }),

  // ==========================================
  // 2. ACTIVE CHAT MESSAGES (Chat Feed State)
  // ==========================================
  messages: [], 
  
  // NEW: Bulk load messages when switching chats
  setMessages: (newMessages) => set({ messages: newMessages }),
  
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  
  clearMessages: () => set({ messages: [] }),
}));

export default useChatStore;