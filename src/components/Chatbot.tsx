"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { MessageCircle, X, Send, Bot, User, Phone, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ContactInfo, ContactFormData } from "@/types/contact";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function Chatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  
  // Sprawdź czy jesteśmy na urządzeniu mobilnym i na stronie konfiguratora
  const isConfiguratorPage = useMemo(() => pathname?.startsWith('/konfigurator') ?? false, [pathname]);
  const shouldHideChatbot = useMemo(() => isMobile && isConfiguratorPage, [isMobile, isConfiguratorPage]);
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

  // Listen for cart modal state changes
  useEffect(() => {
    const handleCartStateChange = (event: CustomEvent) => {
      setIsCartOpen(event.detail.isOpen);
    };

    // Listen for custom cart events
    window.addEventListener('cartModalStateChange', handleCartStateChange as EventListener);
    
    // Also listen for the existing openCartModal event
    const handleOpenCartModal = () => {
      setIsCartOpen(true);
    };

    window.addEventListener('openCartModal', handleOpenCartModal);
    
    return () => {
      window.removeEventListener('cartModalStateChange', handleCartStateChange as EventListener);
      window.removeEventListener('openCartModal', handleOpenCartModal);
    };
  }, []);

  // Listen for openChatbot event
  useEffect(() => {
    const handleOpenChatbot = () => {
      setIsOpen(true);
    };

    window.addEventListener('openChatbot', handleOpenChatbot);
    
    return () => {
      window.removeEventListener('openChatbot', handleOpenChatbot);
    };
  }, []);

  // Sprawdź rozmiar ekranu i czy jesteśmy na mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint w Tailwind
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Zapobiegaj automatycznemu scrollowaniu przy focus na input
  useEffect(() => {
    if (!isMobile || !inputRef.current || !isOpen) return;

    const input = inputRef.current;

    const handleFocus = () => {
      // Zapobiegaj automatycznemu scrollowaniu strony
      requestAnimationFrame(() => {
        if (chatWindowRef.current) {
          chatWindowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    };

    input.addEventListener('focus', handleFocus);

    return () => {
      input.removeEventListener('focus', handleFocus);
    };
  }, [isMobile, isOpen]);

  // Ukryj chatbota jeśli jesteśmy na mobile w konfiguratorze
  useEffect(() => {
    if (shouldHideChatbot && isOpen) {
      setIsOpen(false);
    }
  }, [shouldHideChatbot, isOpen]);

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
      // Validate input
      if (contactData.name.trim().length < 2) {
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: "Imię musi mieć co najmniej 2 znaki.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsSubmittingContact(false);
        return;
      }

      // Send data to API
      const response = await fetch('/api/bitrix24/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactData.name.trim(),
          phone: contactData.phone.trim(),
          message: contactData.message || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const errorMessage = result?.error || 'Failed to submit contact form';
        throw new Error(errorMessage);
      }

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
        text: error instanceof Error && error.message.includes('disabled')
          ? "Przepraszam, system kontaktowy jest obecnie niedostępny. Proszę spróbować później."
          : "Wystąpił błąd podczas przesyłania danych. Spróbuj ponownie.",
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

  // Nie renderuj chatbota na mobile w konfiguratorze
  if (shouldHideChatbot) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button with Tooltip */}
      <div className={`fixed bottom-4 md:bottom-6 z-50 transition-all duration-300 pb-safe ${isCartOpen ? 'left-4 md:left-6' : 'right-4 md:right-6'}`}>
        {/* Tooltip - ukryty na bardzo małych ekranach */}
        {showTooltip && !isOpen && (
          <div className={`absolute bottom-20 md:bottom-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-3 py-2 md:px-5 md:py-3 rounded-xl shadow-2xl border border-gray-600 max-w-[200px] sm:max-w-sm animate-bounce sm:block ${isCartOpen ? 'left-0' : 'right-0'}`}>
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src="/chat.webp"
                  alt="EVA Premium Chat"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-semibold text-white">Potrzebujesz pomocy?</p>
                <p className="text-[10px] md:text-xs text-gray-200 hidden sm:block">Kliknij aby porozmawiać z Klaudią</p>
                <p className="text-[10px] md:text-xs text-gray-200 sm:hidden">Kliknij tutaj</p>
              </div>
            </div>
            {/* Arrow pointing down */}
            <div className={`absolute top-full w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-gray-800 ${isCartOpen ? 'left-6' : 'right-6'}`}></div>
          </div>
        )}
        
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`w-16 h-16 md:w-20 md:h-20 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 relative overflow-hidden border-2 border-white/20 min-w-[64px] min-h-[64px] md:min-w-[80px] md:min-h-[80px] ${
            isOpen
              ? "bg-red-600 hover:bg-red-700 shadow-red-500/50"
              : "bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 shadow-red-500/30"
          }`}
          aria-label={isOpen ? "Zamknij chat" : "Otwórz chat"}
        >
          {isOpen ? (
            <X className="w-6 h-6 md:w-8 md:h-8 text-white mx-auto drop-shadow-lg" />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-2">
              <Image
                src="/chat.webp"
                alt="EVA Premium Chat"
                width={48}
                height={48}
                className="rounded-full drop-shadow-lg w-10 h-10 md:w-12 md:h-12"
                style={{ width: "auto", height: "auto" }}
              />
            </div>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div 
          ref={chatWindowRef}
          className={`fixed z-50 bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-600 flex flex-col overflow-hidden backdrop-blur-sm transition-all duration-300 pb-safe ${
            isMobile 
              ? '' 
              : `bottom-24 md:bottom-28 w-full max-w-[calc(100vw-2rem)] sm:w-96 h-[500px] md:h-[500px] max-h-[calc(100vh-150px)] md:max-h-[calc(100vh-200px)] ${isCartOpen ? 'left-4 md:left-6' : 'right-4 md:right-6'}`
          }`}
          style={isMobile ? {
            left: '1rem',
            right: '1rem',
            top: '4rem',
            bottom: '1rem',
            width: 'calc(100vw - 2rem)',
            maxWidth: 'none',
            height: 'auto',
            maxHeight: 'calc(100dvh - 5rem)',
            position: 'fixed',
            transform: 'none'
          } : undefined}
        >
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
              className="text-white/80 hover:text-white active:text-white active:bg-white/20 transition-colors p-2 hover:bg-white/10 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                      className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm md:text-sm transition-all duration-200 min-h-[48px]"
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
                      className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm md:text-sm transition-all duration-200 min-h-[48px]"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={!contactData.name.trim() || !contactData.phone.trim() || isSubmittingContact}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 active:scale-95 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-red-500/25 min-h-[44px]"
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
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 active:scale-95 text-gray-300 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-gray-500/25 min-h-[44px]"
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
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-base md:text-sm transition-all duration-200 min-h-[48px]"
                style={{ fontSize: '16px', touchAction: 'manipulation' }}
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="w-12 h-12 md:w-12 md:h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 active:scale-95 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-red-500/25 min-h-[48px] min-w-[48px]"
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
