'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { EVA_CHAT_ICON_SRC } from '../lib/evaWidgetPlugin'
import { EVA_CHAT_GREETING_TEXT, useEvaChatGreeting } from '../hooks/useEvaChatGreeting'
import { usePrivacyWindowAccepted } from '../hooks/usePrivacyWindowAccepted'
import { mountEvaChatWidget } from '../lib/mountEvaChatWidget'

const launcherChromeClassName =
  'shrink-0 overflow-hidden rounded-full border-2 border-[#e10600] bg-black p-0 shadow-[0_0_24px_rgba(225,6,0,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e10600]'

const launcherButtonClassName = `relative h-16 w-16 ${launcherChromeClassName}`

const launcherIconStyle = {
  width: '64px',
  height: '64px',
  maxWidth: '64px',
  minWidth: '64px',
  objectFit: 'cover',
} as const

const openLauncherIconStyle = {
  width: '100%',
  height: '100%',
  maxWidth: 'none',
  minWidth: '0',
  objectFit: 'cover',
} as const

export const EvaChatWidget = () => {
  const shellRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const showGreeting = !isOpen && !hasOpened
  const privacyAccepted = usePrivacyWindowAccepted()
  const greeting = useEvaChatGreeting(showGreeting && isReady && privacyAccepted)
  const showBubble = showGreeting && greeting.phase !== 'idle'
  const [greetingTitle, greetingBody = ''] = greeting.written.split('\n')
  const isGreetingComplete = greeting.written === EVA_CHAT_GREETING_TEXT

  useEffect(() => {
    setIsReady(true)
  }, [])

  const embeddedInProductWindow = isReady && window.parent !== window

  useEffect(() => {
    if (!hasOpened) {
      return undefined
    }

    return mountEvaChatWidget(document)
  }, [hasOpened])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    if (typeof window.matchMedia !== 'function') {
      return undefined
    }

    const mobile = window.matchMedia('(max-width: 767px)')
    if (!mobile.matches) {
      return undefined
    }

    const { body } = document
    const shell = shellRef.current
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    }
    const scrollY = window.scrollY
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'

    const viewport = window.visualViewport
    const pinToVisibleScreen = () => {
      if (!shell) {
        return
      }
      shell.style.top = `${viewport?.offsetTop ?? 0}px`
      shell.style.height = `${viewport?.height ?? window.innerHeight}px`
      shell.style.bottom = 'auto'
      shell.style.left = '0px'
      shell.style.right = '0px'
    }
    pinToVisibleScreen()
    viewport?.addEventListener('resize', pinToVisibleScreen)
    viewport?.addEventListener('scroll', pinToVisibleScreen)

    return () => {
      viewport?.removeEventListener('resize', pinToVisibleScreen)
      viewport?.removeEventListener('scroll', pinToVisibleScreen)
      if (shell) {
        shell.style.top = ''
        shell.style.height = ''
        shell.style.bottom = ''
        shell.style.left = ''
        shell.style.right = ''
      }
      body.style.overflow = previous.overflow
      body.style.position = previous.position
      body.style.top = previous.top
      body.style.width = previous.width
      if (scrollY !== 0) {
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  const handleToggle = () => {
    setIsOpen((current) => {
      if (!current) {
        setHasOpened(true)
      }
      return !current
    })
  }

  const shellClassName = isOpen
    ? 'fixed inset-0 z-[80] flex h-dvh w-dvw flex-col overflow-hidden max-md:bg-black md:inset-auto md:bottom-4 md:right-4 md:h-auto md:w-auto md:items-end md:gap-3 md:overflow-visible md:bg-transparent'
    : 'fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-3'

  const slotClassName = isOpen
    ? 'min-h-0 w-full flex-1 md:h-[min(640px,calc(100dvh-7rem))] md:w-[min(420px,calc(100vw-2rem))] md:flex-none'
    : 'hidden'

  const openLauncherClassName = `absolute top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] z-10 h-11 w-11 md:static md:h-16 md:w-16 ${launcherChromeClassName}`

  if (!isReady || embeddedInProductWindow) {
    return null
  }

  return createPortal(
    <div ref={shellRef} className={shellClassName}>
      <div data-eva-chat-slot className={slotClassName} />
      {showBubble ? (
        <p
          id="eva-chat-greeting"
          role="status"
          className="relative min-h-11 min-w-16 max-w-[16rem] animate-fade-in rounded-2xl border border-[#e10600]/50 bg-[#141414] px-4 py-3 text-sm leading-snug text-white shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          <span className="sr-only">
            {greeting.phase === 'typing' ? 'EvaBot pisze' : isGreetingComplete ? greeting.written : ''}
          </span>
          {greeting.phase === 'typing' ? (
            <span className="flex h-5 items-center gap-1" aria-hidden="true">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:300ms]" />
            </span>
          ) : (
            <span aria-hidden="true">
              {greetingTitle ? <span className="block font-semibold">{greetingTitle}</span> : null}
              {greetingBody ? <span className="block">{greetingBody}</span> : null}
              {isGreetingComplete ? null : (
                <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[#e10600]" />
              )}
            </span>
          )}
          <span
            aria-hidden="true"
            className="absolute -bottom-1.5 right-8 h-3 w-3 rotate-45 border-b border-r border-[#e10600]/50 bg-[#141414]"
          />
        </p>
      ) : null}
      <button
        type="button"
        className={isOpen ? openLauncherClassName : launcherButtonClassName}
        aria-label={isOpen ? 'Zamknij czat EvaBot' : 'Otwórz czat EvaBot'}
        aria-expanded={isOpen}
        aria-describedby={showBubble ? 'eva-chat-greeting' : undefined}
        onClick={handleToggle}
      >
        <img
          src={EVA_CHAT_ICON_SRC}
          alt=""
          width={64}
          height={64}
          className="pointer-events-none block h-full w-full max-w-none object-cover"
          style={isOpen ? openLauncherIconStyle : launcherIconStyle}
        />
      </button>
    </div>,
    document.body
  )
}
