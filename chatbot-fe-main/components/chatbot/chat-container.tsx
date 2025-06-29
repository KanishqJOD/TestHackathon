"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageBubble } from "./message-bubble"
import { TypingIndicator } from "./typing-indicator"
import Image from "next/image"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface ChatContainerProps {
  messages: Message[]
  isLoading: boolean
}

// Welcome message options that will rotate randomly
const welcomeMessages = [
  "Welcome to Cashfree Analytics Assistant",
  "Hi there! Ready to explore your analytics data?",
  "Ask me about merchant success rates and analytics",
  "How can I help with your analytics questions today?"
];

export function ChatContainer({ messages, isLoading }: ChatContainerProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Generate random welcome message on component mount
  const randomWelcomeMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center">
            <Image
              src="/cashfree.png"
              alt="Cashfree logo"
              width={64}
              height={64}
              className="text-primary"
            />
          </div>
          <h3 className="text-3xl font-semibold mb-4 text-green-700 dark:text-green-600"> 
            {randomWelcomeMessage}
          </h3>
          <p className="text-muted-foreground text-yellow-600 dark:text-yellow-500 text-md">
            Ask me anything about any merchant's success rate analytics, and I'll do my best to assist you.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 border-x border-[#4379FF]/10 dark:border-[#4379FF]/20" ref={scrollAreaRef}>
      <div className="min-h-full">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}