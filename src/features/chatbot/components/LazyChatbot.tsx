"use client"

import dynamic from "next/dynamic"

const Chatbot = dynamic(() => import("@/features/chatbot/components/Chatbot"), {
  ssr: false,
  loading: () => null,
})

const LazyChatbot = () => <Chatbot />

export default LazyChatbot
