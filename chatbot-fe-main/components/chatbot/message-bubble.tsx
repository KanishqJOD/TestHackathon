"use client"

import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"

interface MessageBubbleProps {
  message: {
    id: string
    content: string
    role: "user" | "assistant"
    timestamp: Date
  }
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"
  
  return (
    <div className={cn(
      "flex gap-3 p-4 group",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser 
          ? "bg-[#3874e8] text-white" 
          : "bg-[#4379FF]/10 dark:bg-[#4379FF]/20 text-[#4379FF] dark:text-[#5f8aff]"
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      
      <div className={cn(
        "flex flex-col gap-1 max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "rounded-2xl px-4 py-2 text-sm shadow-sm",
          isUser
            ? "bg-gradient-to-br from-[#4379FF] to-[#5f8aff] text-white rounded-br-none"
            : "bg-[#4379FF]/5 dark:bg-[#4379FF]/10 border border-[#4379FF]/10 dark:border-[#4379FF]/20 text-foreground rounded-bl-none"
        )}>
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  code: ({ children }) => (
                    <code className="bg-[#4379FF]/10 dark:bg-[#4379FF]/20 px-1 py-0.5 rounded text-xs">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-[#4379FF]/10 dark:bg-[#4379FF]/20 p-2 rounded-md overflow-x-auto text-xs border border-[#4379FF]/10 dark:border-[#4379FF]/20">
                      {children}
                    </pre>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground px-1">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
    </div>
  )
}