"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Phone, User as UserIcon } from "lucide-react";
import { ContactInfo, ContactFormData } from "@/types/contact";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Cześć! Jestem asystentem EVA Premium. Jak mogę Ci pomóc w wyborze dywaników samochodowych?",
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
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${
          isOpen
            ? "bg-red-600 hover:bg-red-700"
            : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
        }`}
        aria-label={isOpen ? "Zamknij chat" : "Otwórz chat"}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white mx-auto" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white mx-auto" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">EVA Premium</h3>
                <p className="text-red-100 text-xs">Asystent online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Zamknij chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-800">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                    message.sender === "user"
                      ? "bg-red-500 text-white rounded-br-md"
                      : "bg-gray-700 text-gray-100 rounded-bl-md border border-gray-600"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === "bot" && (
                      <Bot className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
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
                <div className="bg-gray-700 text-gray-100 rounded-2xl rounded-bl-md border border-gray-600 px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-red-500" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Contact Form */}
          {showContactForm && (
            <div className="p-4 bg-gray-900 border-t border-gray-700">
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <div className="text-sm text-gray-300 mb-3">
                  Wypełnij dane kontaktowe:
                </div>
                
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={contactData.name}
                        onChange={(e) => handleContactInputChange('name', e.target.value)}
                        placeholder="Imię"
                        className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <div className="flex-1">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={contactData.phone}
                        onChange={(e) => handleContactInputChange('phone', e.target.value)}
                        placeholder="Numer telefonu"
                        className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={!contactData.name.trim() || !contactData.phone.trim() || isSubmittingContact}
                    className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-full text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    {isSubmittingContact ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Wysyłanie...
                      </>
                    ) : (
                      'Wyślij dane kontaktowe'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full text-sm transition-colors"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Input */}
          {!showContactForm && (
            <form onSubmit={handleSendMessage} className="p-4 bg-gray-900 border-t border-gray-700">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Napisz wiadomość..."
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="w-10 h-10 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors"
                aria-label="Wyślij wiadomość"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
          )}
        </div>
      )}
    </>
  );
}
