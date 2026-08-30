'use client';

import { useEffect, useRef, useState } from 'react';
import {
  GREETING_DELAY_MS,
  GREETING_TEXT,
  HELP_INTERVAL_MS,
  NUDGE_VISIBLE_MS,
  getHelpPrompt,
  nextHelpPromptIndex,
  type LauncherNudge,
} from './launcher-nudge';

const GREETING_STORAGE_KEY = 'eva-chat-greeting-shown';

const markGreetingShown = () => {
  try {
    sessionStorage.setItem(GREETING_STORAGE_KEY, '1');
  } catch {
    // Private mode may block sessionStorage.
  }
};

const hasGreetingBeenShown = (): boolean => {
  try {
    return sessionStorage.getItem(GREETING_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

export const useLauncherNudge = (isChatOpen: boolean): LauncherNudge | null => {
  const [nudge, setNudge] = useState<LauncherNudge | null>(null);
  const helpIndexRef = useRef(0);

  useEffect(() => {
    if (isChatOpen) {
      setNudge(null);
      return;
    }

    const timeouts: number[] = [];
    let intervalId: number | null = null;
    let greetingShown = hasGreetingBeenShown();

    const hideLater = () => {
      timeouts.push(
        window.setTimeout(() => {
          setNudge(null);
        }, NUDGE_VISIBLE_MS),
      );
    };

    const showHelp = () => {
      setNudge({
        kind: 'help',
        text: getHelpPrompt(helpIndexRef.current),
      })
      helpIndexRef.current = nextHelpPromptIndex(helpIndexRef.current)
      hideLater()
    }

    const armHelpInterval = () => {
      intervalId = window.setInterval(showHelp, HELP_INTERVAL_MS)
    }

    const startHelpLoop = (delay: number) => {
      timeouts.push(
        window.setTimeout(() => {
          showHelp()
          armHelpInterval()
        }, delay),
      )
    }

    if (!greetingShown) {
      timeouts.push(
        window.setTimeout(() => {
          greetingShown = true
          markGreetingShown()
          setNudge({
            kind: 'greeting',
            text: GREETING_TEXT,
          })
          hideLater()
          startHelpLoop(NUDGE_VISIBLE_MS + HELP_INTERVAL_MS)
        }, GREETING_DELAY_MS),
      )
    } else {
      startHelpLoop(HELP_INTERVAL_MS)
    }

    return () => {
      timeouts.forEach((id) => window.clearTimeout(id));
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [isChatOpen]);

  return nudge;
};
