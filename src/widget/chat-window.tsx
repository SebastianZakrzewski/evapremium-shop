'use client';

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import './chat.css';
import { formatChatTime } from './format-chat-time';
import { useLauncherNudge } from './use-launcher-nudge';
import { useShopChat, type UseShopChatOptions } from './use-shop-chat';

const EVABOT_AVATAR = '/evabot.jpg';

export type ChatWindowProps = UseShopChatOptions & {
  title?: string;
  subtitle?: string;
  avatarSrc?: string;
  initiallyOpen?: boolean;
};

export function ChatWindow({
  title = 'EvaBot',
  subtitle = 'Konsultant EVA Premium',
  avatarSrc = EVABOT_AVATAR,
  initiallyOpen = false,
  ...chatOptions
}: ChatWindowProps) {
  const [open, setOpen] = useState(initiallyOpen);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { status, error, messages, draft, send, retry } = useShopChat(chatOptions);
  const nudge = useLauncherNudge(open);
  const listRef = useRef<HTMLUListElement>(null);
  const titleId = useId();
  const busy = status === 'loading' || status === 'streaming';

  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [messages, draft, open]);

  useEffect(() => {
    const handleOpenChatbot = () => {
      setOpen(true);
    };
    const handleOpenCart = () => {
      setIsCartOpen(true);
    };
    const handleCloseCart = () => {
      setIsCartOpen(false);
    };
    const handleCartStateChange = (event: Event) => {
      const detail = (event as CustomEvent<{ isOpen?: boolean }>).detail;
      if (typeof detail?.isOpen === 'boolean') {
        setIsCartOpen(detail.isOpen);
      }
    };

    window.addEventListener('openChatbot', handleOpenChatbot);
    window.addEventListener('openCartModal', handleOpenCart);
    window.addEventListener('closeCartModal', handleCloseCart);
    window.addEventListener('cartModalStateChange', handleCartStateChange);
    return () => {
      window.removeEventListener('openChatbot', handleOpenChatbot);
      window.removeEventListener('openCartModal', handleOpenCart);
      window.removeEventListener('closeCartModal', handleCloseCart);
      window.removeEventListener('cartModalStateChange', handleCartStateChange);
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const field = form.elements.namedItem('message');
    if (!(field instanceof HTMLTextAreaElement) && !(field instanceof HTMLInputElement)) {
      return;
    }
    void send(field.value);
    field.value = '';
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const handleOpenFromNudge = () => {
    setOpen(true);
  };

  const handleToggle = () => {
    setOpen((current) => !current);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className={`eva-chat${isCartOpen ? ' eva-chat--cart-open' : ''}`}>
      {open ? (
        <section className="eva-chat__panel" aria-labelledby={titleId}>
          <header className="eva-chat__header">
            <div className="eva-chat__identity">
              <img className="eva-chat__avatar" src={avatarSrc} alt="" width={48} height={48} />
              <div>
                <h2 className="eva-chat__title" id={titleId}>
                  {title}
                </h2>
                <p className="eva-chat__subtitle">{subtitle}</p>
                <div className="eva-chat__presence">
                  <span className="eva-chat__presence-dot" aria-hidden="true" />
                  <span className="eva-chat__presence-label">Dostępny</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="eva-chat__close"
              onClick={handleClose}
              aria-label="Zamknij chat"
            >
              <CloseIcon />
            </button>
          </header>
          <ul className="eva-chat__messages" ref={listRef} aria-live="polite">
            {messages.map((message) => (
              <li key={message.id} className={`eva-chat__row eva-chat__row--${message.role}`}>
                <div className={`eva-chat__bubble eva-chat__bubble--${message.role}`}>
                  <div className="eva-chat__bubble-inner">
                    {message.role === 'assistant' ? (
                      <img className="eva-chat__avatar eva-chat__avatar--sm" src={avatarSrc} alt="" width={24} height={24} />
                    ) : null}
                    <div>
                      <span>{message.content}</span>
                      {message.createdAt ? (
                        <span className="eva-chat__time">{formatChatTime(message.createdAt)}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {status === 'streaming' ? (
              <li className="eva-chat__row eva-chat__row--assistant">
                <div className="eva-chat__bubble eva-chat__bubble--assistant">
                  <div className="eva-chat__bubble-inner">
                    <img className="eva-chat__avatar eva-chat__avatar--sm" src={avatarSrc} alt="" width={24} height={24} />
                    {draft ? (
                      <span>{draft}</span>
                    ) : (
                      <div className="eva-chat__typing">
                        <span className="eva-chat__typing-dot" />
                        <span className="eva-chat__typing-dot" />
                        <span className="eva-chat__typing-dot" />
                        <span className="eva-chat__typing-label">EvaBot pisze...</span>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ) : null}
          </ul>
          {status === 'loading' ? <p className="eva-chat__status">Łączenie…</p> : null}
          {error ? (
            <p className="eva-chat__error">
              {error}{' '}
              <button type="button" className="eva-chat__retry" onClick={() => void retry()}>
                Ponów
              </button>
            </p>
          ) : null}
          <form className="eva-chat__composer" onSubmit={handleSubmit}>
            <textarea
              className="eva-chat__input"
              name="message"
              rows={1}
              maxLength={8000}
              disabled={busy}
              placeholder="Napisz wiadomość..."
              aria-label="Wiadomość"
              onKeyDown={handleKeyDown}
            />
            <button className="eva-chat__send" type="submit" disabled={busy} aria-label="Wyślij wiadomość">
              <SendIcon />
            </button>
          </form>
        </section>
      ) : null}
      <div className="eva-chat__dock">
        {!open && nudge ? (
          <button
            type="button"
            className={`eva-chat__nudge eva-chat__nudge--${nudge.kind}`}
            onClick={handleOpenFromNudge}
            aria-label={`${title}: ${nudge.text}`}
          >
            <span className="eva-chat__nudge-name">{title}</span>
            <span className="eva-chat__nudge-text">{nudge.text}</span>
          </button>
        ) : null}
        <button
          type="button"
          className={`eva-chat__toggle${!open && nudge ? ' eva-chat__toggle--nudge' : ''}`}
          aria-expanded={open}
          aria-label={open ? 'Zamknij chat' : 'Otwórz chat'}
          onClick={handleToggle}
        >
          {open ? <CloseIcon className="eva-chat__toggle-close" /> : (
            <img className="eva-chat__toggle-icon" src={avatarSrc} alt="" width={80} height={80} />
          )}
        </button>
      </div>
    </div>
  );
}

const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M22 2 11 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M22 2 15 22 11 13 2 9l20-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
