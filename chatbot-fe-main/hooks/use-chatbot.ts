"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { addChat, getAllChats, clearChats } from "@/lib/chatHistoryDb";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface Chat {
  id: string;
  user: string;
  agent: string;
  timestamp: string;
}

interface UseChatbotReturn {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  resetChat: () => Promise<void>;
  initializeChat: () => Promise<void>;
}

const apiCall = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("API call failed:", error);
    throw error;
  }
};

export function useChatbot(): UseChatbotReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const initializingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const currentRequestRef = useRef<AbortController | null>(null);
  const lastRequestTimeRef = useRef(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // In-memory fallback
  const inMemoryChats = useRef<Chat[]>([]);
  const isIndexedDBBlocked = useRef(false);

  // Load chat history from IndexedDB on mount
  useEffect(() => {
    (async () => {
      try {
        const chats = await getAllChats();
        inMemoryChats.current = chats;
        const loadedMessages: Message[] = [];
        chats.forEach(chat => {
          loadedMessages.push({
            id: `${chat.id}-user`,
            content: chat.user,
            role: "user",
            timestamp: new Date(chat.timestamp),
          });
          loadedMessages.push({
            id: `${chat.id}-agent`,
            content: chat.agent,
            role: "assistant",
            timestamp: new Date(chat.timestamp),
          });
        });
        setMessages(loadedMessages);
        hasInitializedRef.current = loadedMessages.length > 0;
      } catch (err) {
        console.error("IndexedDB error:", err);
        toast.error("Chat history is unavailable in this environment (IndexedDB blocked). Using in-memory fallback.");
        isIndexedDBBlocked.current = true;
        inMemoryChats.current = [];
        setMessages([]);
        hasInitializedRef.current = false;
      }
    })();
  }, []);

  const initializeChat = useCallback(async () => {
    if (initializingRef.current || hasInitializedRef.current) {
      return;
    }
    try {
      initializingRef.current = true;
      setIsLoading(true);
      await apiCall("/api/chat/new", { method: "POST" });
      setMessages([]);
      if (isIndexedDBBlocked.current) {
        inMemoryChats.current = [];
      } else {
        await clearChats();
      }
      hasInitializedRef.current = true;
      toast.success("New chat session initialized");
    } catch (error: any) {
      console.error("Failed to initialize chat:", error);
      hasInitializedRef.current = false;
      if (error.name !== 'AbortError') {
        toast.error(`Failed to initialize chat: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    } finally {
      setIsLoading(false);
      initializingRef.current = false;
    }
  }, []);

  const sendMessageInternal = useCallback(async (content: string) => {
    try {
      let chats: Chat[] = [];
      if (isIndexedDBBlocked.current) {
        chats = inMemoryChats.current;
      } else {
        try {
          chats = await getAllChats();
        } catch (err) {
          console.error("IndexedDB error:", err);
          toast.error("Chat history is unavailable in this environment (IndexedDB blocked). Using in-memory fallback.");
          isIndexedDBBlocked.current = true;
          chats = inMemoryChats.current;
        }
      }
      const conversationHistory = chats
        .map(chat => `User: ${chat.user}\nAssistant: ${chat.agent}`)
        .join("\n");

      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        role: "user",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      const response = await apiCall("/api/chat/message", {
        method: "POST",
        body: JSON.stringify({
          message: content,
          conversationHistory,
        }),
      });

      if (response.success) {
        if (isIndexedDBBlocked.current) {
          inMemoryChats.current.push({
            id: Date.now().toString(),
            user: content,
            agent: response.response,
            timestamp: new Date().toISOString(),
          });
        } else {
          try {
            await addChat(content, response.response);
          } catch (err) {
            console.error("IndexedDB error:", err);
            isIndexedDBBlocked.current = true;
            inMemoryChats.current.push({
              id: Date.now().toString(),
              user: content,
              agent: response.response,
              timestamp: new Date().toISOString(),
            });
          }
        }
        setMessages(prev => [
          ...prev,
          {
            id: `${Date.now()}-agent`,
            content: response.response,
            role: "assistant",
            timestamp: new Date(),
          },
        ]);
      } else {
        toast.error(response.error || "Failed to send message");
      }
    } catch (error: any) {
      console.error("Failed to send message:", error);
      if (error.name !== 'AbortError') {
        toast.error("Failed to send message. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    await sendMessageInternal(content);
  }, [sendMessageInternal]);

  const resetChat = useCallback(async () => {
    if (initializingRef.current) return;

    // Cancel any ongoing request
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }

    // Clear debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    try {
      setIsLoading(true);
      await apiCall("/api/chat/reset", { method: "POST" });
      if (isIndexedDBBlocked.current) {
        inMemoryChats.current = [];
      } else {
        try {
          await clearChats();
        } catch (err) {
          console.error("IndexedDB error:", err);
          toast.error("Chat history could not be cleared (IndexedDB blocked).");
          isIndexedDBBlocked.current = true;
          inMemoryChats.current = [];
        }
      }
      setMessages([]);
      hasInitializedRef.current = false;
      toast.success("Chat reset successfully");
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast.error("Failed to reset chat");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    resetChat,
    initializeChat,
  };
}
