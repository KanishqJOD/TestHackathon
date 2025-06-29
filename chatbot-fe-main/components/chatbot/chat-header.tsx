"use client"

import { CreditCard, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"

interface ChatHeaderProps {
  onReset: () => void
  isLoading: boolean
}

export function ChatHeader({ onReset, isLoading }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[#4379FF]/20 dark:border-[#4379FF]/30 bg-gradient-to-r from-background to-[#4379FF]/5 dark:from-background dark:to-[#4379FF]/10 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#4379FF]/10 dark:bg-[#4379FF]/20 ring-1 ring-[#4379FF]/30 dark:ring-[#4379FF]/40">
          <Image
            src="/cashfree.png"
            alt="Cashfree logo"
            width={32}
            height={32}
            className="text-primary"
          />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-green-700 dark:text-green-600">Cashfree Assistant</h1>
          <p className="text-sm text-yellow-600 dark:text-yellow-500 text-muted-foreground">
            Your Analytics Assistant 
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={isLoading}
          className="gap-2 border-[#4379FF]/30 dark:border-[#4379FF]/40 hover:bg-[#4379FF]/10 dark:hover:bg-[#4379FF]/20"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Chat
        </Button>
        <ThemeToggle />
      </div>
    </div>
  )
}