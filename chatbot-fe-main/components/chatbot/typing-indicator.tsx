"use client"

import { useEffect, useState } from "react"
import { Bot, Sparkles, BarChart2, Cpu } from "lucide-react"

export function TypingIndicator() {
  const loadingMessages = [
    "Fetching data for you...",
    "Crunching those numbers...",
    "Searching the transaction history...",
    "Finding patterns in your data...",
    "Almost there with your results..."
  ]

  const [currentMessage, setCurrentMessage] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrentMessage((prev) => (prev + 1) % loadingMessages.length)
        setVisible(true)
      }, 300)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Custom icons for different message types
  const icons = [
    <Sparkles key="sparkles" className="h-4 w-4 mr-2 text-[#4379FF]" />,
    <BarChart2 key="chart" className="h-4 w-4 mr-2 text-[#4379FF]" />,
    <Cpu key="cpu" className="h-4 w-4 mr-2 text-[#4379FF]" />
  ]

  const currentIcon = icons[currentMessage % icons.length]

  return (
    <div className="flex gap-3 p-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#4379FF]/10 dark:bg-[#4379FF]/20 text-[#4379FF] dark:text-[#5f8aff] ring-1 ring-[#4379FF]/30 dark:ring-[#4379FF]/40 animate-pulse">
        <Bot className="h-4 w-4" />
      </div>
      
      <div className="flex flex-col gap-1 max-w-[80%]">
        <div className="bg-[#4379FF]/5 dark:bg-[#4379FF]/10 border border-[#4379FF]/10 dark:border-[#4379FF]/20 text-foreground rounded-2xl rounded-bl-none px-4 py-3 shadow-sm relative overflow-hidden">
          {/* Shimmer effect using tailwind only */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#4379FF]/10 to-transparent opacity-70" 
               style={{
                 backgroundSize: '200% 100%',
                 animation: 'shimmer 3s infinite linear',
                 animationName: 'shimmer',
                 
               }}></div>
          
          <div className="relative z-10 flex flex-col">
            <div className="flex items-center">
              <div className="transition-all duration-300">
                <div className={`flex items-center text-sm ${visible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'}`}>
                  {currentIcon}
                  {loadingMessages[currentMessage]}
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-3">
              {/* Dots animation */}
              <div className="flex items-center gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="relative w-3 h-3"
                    style={{
                      animation: `bounce 1.4s infinite ease-in-out both`,
                      animationDelay: `${i * 0.16}s`,
                      animationName: 'bounce',
                    }}
                  >
                    <div className="absolute inset-0 bg-[#4379FF] rounded-full opacity-70"></div>
                    <div className="absolute inset-0 bg-[#4379FF] rounded-full animate-ping"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}