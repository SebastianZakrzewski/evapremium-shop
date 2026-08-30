import { describe, expect, it } from 'vitest'
import {
  GREETING_TEXT,
  HELP_PROMPTS,
  getHelpPrompt,
  nextHelpPromptIndex,
} from './launcher-nudge'

describe('launcher nudge copy', () => {
  it('introduces EvaBot in the greeting', () => {
    expect(GREETING_TEXT).toContain('EvaBot')
    expect(GREETING_TEXT.toLowerCase()).toContain('cześć')
  })

  it('rotates help prompts in a loop', () => {
    expect(getHelpPrompt(0)).toBe(HELP_PROMPTS[0])
    expect(getHelpPrompt(HELP_PROMPTS.length)).toBe(HELP_PROMPTS[0])
    expect(nextHelpPromptIndex(HELP_PROMPTS.length - 1)).toBe(0)
    expect(nextHelpPromptIndex(0)).toBe(1)
  })
})
