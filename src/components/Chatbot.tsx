"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Phone, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { ContactInfo, ContactFormData } from "@/types/contact";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Cześć! Jestem Klaudia, konsultantka EVA Premium. Jak mogę Ci pomóc w wyborze dywaników samochodowych?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactData, setContactData] = useState<ContactFormData>({
    name: "",
    phone: "",
    message: ""
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Show tooltip after 3 seconds if chat is not open
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowTooltip(false);
    }
  }, [isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setContactData(prev => ({ ...prev, message: inputValue.trim() }));
    setInputValue("");
    setIsTyping(true);

    // Simulate bot response and show contact form
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Dziękuję za wiadomość! Aby móc Ci pomóc, zostaw proszę swoje dane kontaktowe:",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
      setShowContactForm(true);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactData.name.trim() || !contactData.phone.trim()) return;

    setIsSubmittingContact(true);

    try {
      // Create contact info object
      const contactInfo: ContactInfo = {
        id: Date.now().toString(),
        name: contactData.name.trim(),
        phone: contactData.phone.trim(),
        message: contactData.message,
        timestamp: new Date(),
        source: 'chatbot'
      };

      // Here you can send the data to your API or parent component
      console.log('Contact data to be sent:', contactInfo);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Add success message
      const successMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: `Dziękuję ${contactData.name}! Odezwę się do Ciebie pod numerem ${contactData.phone} w ciągu 24 godzin.`,
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, successMessage]);
      setShowContactForm(false);
      setContactData({ name: "", phone: "", message: "" });

    } catch (error) {
      console.error('Error submitting contact form:', error);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: "Wystąpił błąd podczas przesyłania danych. Spróbuj ponownie.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleContactInputChange = (field: keyof ContactFormData, value: string) => {
    setContactData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* Floating Chat Button with Tooltip */}
      <div className="fixed bottom-6 left-6 z-50">
        {/* Tooltip */}
        {showTooltip && !isOpen && (
          <div className="absolute bottom-20 left-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 py-3 rounded-xl shadow-2xl border border-gray-600 max-w-sm animate-bounce">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src="/chat.webp"
                  alt="EVA Premium Chat"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Potrzebujesz pomocy?</p>
                <p className="text-xs text-gray-200">Kliknij aby porozmawiać z Klaudią</p>
              </div>
            </div>
            {/* Arrow pointing down */}
            <div className="absolute top-full left-6 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-gray-800"></div>
          </div>
        )}
        
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`w-20 h-20 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 relative overflow-hidden border-2 border-white/20 ${
            isOpen
              ? "bg-red-600 hover:bg-red-700 shadow-red-500/50"
              : "bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 shadow-red-500/30"
          }`}
          aria-label={isOpen ? "Zamknij chat" : "Otwórz chat"}
        >
          {isOpen ? (
            <X className="w-8 h-8 text-white mx-auto drop-shadow-lg" />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-2">
              <Image
                src="/chat.webp"
                alt="EVA Premium Chat"
                width={48}
                height={48}
                className="rounded-full drop-shadow-lg"
              />
            </div>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-28 left-6 z-50 w-96 h-[500px] bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-600 flex flex-col overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 px-6 py-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center overflow-hidden border-2 border-white/30 shadow-lg">
                <Image
                  src="/chat.webp"
                  alt="EVA Premium Chat"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Klaudia</h3>
                <p className="text-red-100 text-sm font-medium">Konsultantka EVA Premium</p>
                <div className="flex items-center space-x-1 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-200 text-xs">Dostępna</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              aria-label="Zamknij chat"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-800 to-gray-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-lg ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white rounded-br-md"
                      : "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-100 rounded-bl-md border border-gray-500"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === "bot" && (
                      <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                        <Image
                          src="/chat.webp"
                          alt="EVA Premium Chat"
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      </div>
                    )}
                    {message.sender === "user" && (
                      <User className="w-4 h-4 text-white/80 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === "user"
                            ? "text-red-100"
                            : "text-gray-400"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-gray-700 to-gray-600 text-gray-100 rounded-2xl rounded-bl-md border border-gray-500 px-4 py-3 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src="/chat.webp"
                        alt="EVA Premium Chat"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-red-400 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-3 h-3 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    <span className="text-xs text-gray-300 ml-2">Klaudia pisze...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Contact Form */}
          {showContactForm && (
            <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-800 border-t border-gray-600">
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <div className="text-sm text-gray-200 mb-4 font-medium">
                  Wypełnij dane kontaktowe:
                </div>
                
                <div className="space-y-3">
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={contactData.name}
                      onChange={(e) => handleContactInputChange('name', e.target.value)}
                      placeholder="Imię"
                      className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={contactData.phone}
                      onChange={(e) => handleContactInputChange('phone', e.target.value)}
                      placeholder="Numer telefonu"
                      className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={!contactData.name.trim() || !contactData.phone.trim() || isSubmittingContact}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-red-500/25"
                  >
                    {isSubmittingContact ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Wysyłanie...
                      </>
                    ) : (
                      'Wyślij dane kontaktowe'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-gray-500/25"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Input */}
          {!showContactForm && (
            <form onSubmit={handleSendMessage} className="p-6 bg-gradient-to-r from-gray-900 to-gray-800 border-t border-gray-600">
            <div className="flex space-x-3">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Napisz wiadomość..."
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-red-500/25"
                aria-label="Wyślij wiadomość"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
          )}
        </div>
      )}
    </>
  );
}
