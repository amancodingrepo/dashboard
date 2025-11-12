'use client'

import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sql?: string | null
  results?: any[] | null
  error?: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! I can help you analyze your invoice and vendor data. Try asking questions like:\n\n• \"What's the total spend in the last 90 days?\"\n• \"List top 5 vendors by spend\"\n• \"Show overdue invoices\"",
      sql: null,
      results: null,
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // Always use current origin to avoid CORS issues with multiple deployments
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await axios.post(`${apiUrl}/api/chat-with-data`, {
        query: input,
      })

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.answer || 'I found some results for your query.',
        sql: response.data.sql,
        results: response.data.results,
        error: response.data.error,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      console.error('Chat error:', error)
      let errorMessage = 'Sorry, I encountered an error processing your request.'
      let errorDetail = 'API Error'
      
      if (error.response?.data?.error) {
        errorDetail = error.response.data.error
      } else if (error.message) {
        errorDetail = error.message
      }
      
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        errorMessage = 'Unable to connect to the AI service. Please check if the service is running.'
        errorDetail = 'Connection Error'
      }
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessage,
          error: errorDetail,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex h-[calc(100vh-200px)] flex-col rounded-xl border border-custom-slate-200 bg-white shadow-sm transition-base">
      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        {/* Messages Container */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <img
                  src="https://ui-avatars.com/api/?name=AI+Assistant&size=32&background=4338CA&color=fff&bold=true"
                  alt="AI Assistant"
                  className="h-8 w-8 rounded-full flex-shrink-0"
                />
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-lg p-4 text-sm leading-relaxed',
                  message.role === 'user'
                    ? 'bg-custom-indigo text-white'
                    : 'bg-custom-slate-100 text-custom-slate-800'
                )}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>

                {message.sql && (
                  <div className="mt-3 overflow-x-auto rounded bg-custom-slate-900 p-2 font-mono text-xs text-green-400">
                    {message.sql}
                  </div>
                )}

                {message.results && message.results.length > 0 && (
                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full border border-custom-slate-200 text-xs">
                      <thead className="bg-custom-slate-50">
                        <tr>
                          {Object.keys(message.results[0]).map((key) => (
                            <th
                              key={key}
                              className="border border-custom-slate-200 px-2 py-1 text-left font-medium text-custom-slate-600 uppercase"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {message.results.map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).map((val: any, j) => (
                              <td
                                key={j}
                                className="border border-custom-slate-200 px-2 py-1 text-custom-slate-700"
                              >
                                {typeof val === 'object'
                                  ? JSON.stringify(val)
                                  : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {message.error && (
                  <div className="mt-2 text-xs text-red-600">
                    Error: {message.error}
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <img
                  src="https://i.pravatar.cc/150?img=12"
                  alt="User"
                  className="h-8 w-8 rounded-full flex-shrink-0 border-2 border-white"
                />
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-custom-slate-100 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-custom-slate-400"></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-custom-slate-400"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-custom-slate-400"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-custom-slate-200 bg-custom-slate-50 p-4"
        >
          <div className="flex gap-2">
            <Input
              type="text"
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              placeholder="Ask a question about your data..."
              className="flex-1 border-custom-slate-300 text-custom-slate-800 placeholder:text-custom-slate-500 focus-visible:ring-1 focus-visible:ring-custom-indigo"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-custom-indigo text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              Send
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
