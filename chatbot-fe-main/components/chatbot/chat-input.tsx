"use client"

import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim())
      setMessage("")
      // Keep focus after sending
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 0)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Autofocus on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // Focus textarea after assistant reply (when loading finishes)
  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus()
    }
  }, [isLoading])

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-[#4379FF]/20 dark:border-[#4379FF]/30 bg-gradient-to-b from-background to-[#4379FF]/5 dark:from-background dark:to-[#4379FF]/10 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex gap-2 items-end">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about any merchant's sr"
          className="min-h-[52px] max-h-32 resize-none focus-visible:ring-[#4379FF]/40 border-[#4379FF]/20 dark:border-[#4379FF]/30"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          size="icon"
          disabled={!message.trim() || isLoading}
          className="h-[52px] w-[52px] shrink-0 bg-[#4379FF] hover:bg-[#4379FF]/90 dark:bg-[#5f8aff] dark:hover:bg-[#5f8aff]/90"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  )
}