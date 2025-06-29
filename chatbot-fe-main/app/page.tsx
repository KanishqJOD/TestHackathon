"use client"
import { useEffect } from "react"
import { ChatHeader } from "@/components/chatbot/chat-header"
import { ChatContainer } from "@/components/chatbot/chat-container"
import { ChatInput } from "@/components/chatbot/chat-input"
import { useChatbot } from "@/hooks/use-chatbot"

export default function Home() {
  const { messages, sendMessage, resetChat, initializeChat, isLoading } = useChatbot();

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <ChatHeader onReset={resetChat} isLoading={isLoading} />
      <ChatContainer messages={messages} isLoading={isLoading} />
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
    </div>
  )
}