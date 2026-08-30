export const GREETING_DELAY_MS = 2000
export const NUDGE_VISIBLE_MS = 9000
export const HELP_INTERVAL_MS = 40000

export const GREETING_TEXT =
  'Cześć! Jestem EvaBot, konsultant EVA Premium. Pomogę dobrać dywaniki do Twojego auta.'

export const HELP_PROMPTS = [
  'Mogę w czymś pomóc przy wyborze dywaników?',
  'Szukasz zestawu do konkretnego modelu auta?',
  'Chcesz, żebym podpowiedział konfigurację?',
  'Masz pytanie o dopasowanie albo dostawę?',
] as const

export type LauncherNudgeKind = 'greeting' | 'help'

export type LauncherNudge = {
  kind: LauncherNudgeKind
  text: string
}

export const getHelpPrompt = (index: number): string => {
  const normalized = ((index % HELP_PROMPTS.length) + HELP_PROMPTS.length) % HELP_PROMPTS.length
  return HELP_PROMPTS[normalized]
}

export const nextHelpPromptIndex = (index: number): number => {
  return (index + 1) % HELP_PROMPTS.length
}
