#!/usr/bin/env node
/**
 * Contrast gate for each genre palette in light and dark modes.
 * Keep in sync with frontend/src/styles/tokens.css
 */
function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function lin(c) {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(a, b) {
  const L1 = luminance(a)
  const L2 = luminance(b)
  const hi = Math.max(L1, L2)
  const lo = Math.min(L1, L2)
  return (hi + 0.05) / (lo + 0.05)
}

/** Mirrored from tokens.css — update both together */
const themes = {
  'fantasia-dark': {
    bg: '#191610',
    card: '#211d17',
    elevated: '#302b22',
    text: '#efeeec',
    textSecondary: '#b4afa7',
    textTertiary: '#958f83',
    borderField: '#7a7261',
    accent: '#d8aa5a',
    accentHover: '#e0bb7b',
    onAccent: '#1b160e',
    accentFill: '#d8aa5a',
    vinculoAfinidade: '#6fbfa1',
    vinculoLaco: '#da91b2',
    vinculoHostil: '#e2736e',
    vinculoNeutro: '#b2ada5',
  },
  'fantasia-light': {
    bg: '#f3ecd9',
    card: '#faf5e8',
    elevated: '#ffffff',
    text: '#1d180b',
    textSecondary: '#594f37',
    textTertiary: '#6c6246',
    borderField: '#8a7d5c',
    accent: '#7c5110',
    accentHover: '#68440d',
    onAccent: '#fff8ec',
    accentFill: '#7c5110',
    vinculoAfinidade: '#2d784c',
    vinculoLaco: '#a94775',
    vinculoHostil: '#ab3832',
    vinculoNeutro: '#6e6447',
  },
  'gotico-light': {
    bg: '#f4e9eb',
    card: '#fcf5f6',
    elevated: '#ffffff',
    text: '#28191c',
    textSecondary: '#594449',
    textTertiary: '#69545a',
    borderField: '#866b72',
    accent: '#873f52',
    accentHover: '#713344',
    onAccent: '#fff8f9',
    accentFill: '#873f52',
    vinculoAfinidade: '#2d784c',
    vinculoLaco: '#a94775',
    vinculoHostil: '#ab3832',
    vinculoNeutro: '#6e6447',
  },
  'gotico-dark': {
    bg: '#191011',
    card: '#211719',
    elevated: '#342528',
    text: '#efecec',
    textSecondary: '#b4a7a9',
    textTertiary: '#958386',
    borderField: '#8a6a70',
    accent: '#de7384',
    accentHover: '#e694a1',
    onAccent: '#1b0e10',
    accentFill: '#de7384',
    vinculoAfinidade: '#6fbfa1',
    vinculoLaco: '#da91b2',
    vinculoHostil: '#e2736e',
    vinculoNeutro: '#b2ada5',
  },
  'scifi-light': {
    bg: '#e8f2f4',
    card: '#f4fafb',
    elevated: '#ffffff',
    text: '#14262a',
    textSecondary: '#405b61',
    textTertiary: '#526a70',
    borderField: '#58777d',
    accent: '#176579',
    accentHover: '#105365',
    onAccent: '#f6fcfd',
    accentFill: '#176579',
    vinculoAfinidade: '#2d784c',
    vinculoLaco: '#a94775',
    vinculoHostil: '#ab3832',
    vinculoNeutro: '#6e6447',
  },
  'scifi-dark': {
    bg: '#101719',
    card: '#171f21',
    elevated: '#263236',
    text: '#eceeef',
    textSecondary: '#a7b2b4',
    textTertiary: '#839295',
    borderField: '#6a8084',
    accent: '#51c0d6',
    accentHover: '#73ccde',
    onAccent: '#0e181b',
    accentFill: '#51c0d6',
    vinculoAfinidade: '#6fbfa1',
    vinculoLaco: '#da91b2',
    vinculoHostil: '#e2736e',
    vinculoNeutro: '#b2ada5',
  },
  'urbano-light': {
    bg: '#eaf0f7',
    card: '#f5f8fc',
    elevated: '#ffffff',
    text: '#172334',
    textSecondary: '#43556b',
    textTertiary: '#526277',
    borderField: '#647c97',
    accent: '#315d8e',
    accentHover: '#274d77',
    onAccent: '#f7faff',
    accentFill: '#315d8e',
    vinculoAfinidade: '#2d784c',
    vinculoLaco: '#a94775',
    vinculoHostil: '#ab3832',
    vinculoNeutro: '#6e6447',
  },
  'urbano-dark': {
    bg: '#101419',
    card: '#171c21',
    elevated: '#262d34',
    text: '#ecedef',
    textSecondary: '#a7adb4',
    textTertiary: '#838c95',
    borderField: '#6a7684',
    accent: '#73a5de',
    accentHover: '#94bae6',
    onAccent: '#0e141b',
    accentFill: '#73a5de',
    vinculoAfinidade: '#6fbfa1',
    vinculoLaco: '#da91b2',
    vinculoHostil: '#e2736e',
    vinculoNeutro: '#b2ada5',
  },
}

const failures = []

function check(theme, name, fg, bg, min) {
  const ratio = contrast(fg, bg)
  if (ratio + 1e-6 < min) {
    failures.push(`${theme} ${name}: ${ratio.toFixed(2)}:1 < ${min}:1 (${fg} on ${bg})`)
  } else {
    console.log(`OK ${theme} ${name}: ${ratio.toFixed(2)}:1`)
  }
}

for (const [theme, t] of Object.entries(themes)) {
  check(theme, 'text/card', t.text, t.card, 4.5)
  check(theme, 'textSecondary/card', t.textSecondary, t.card, 4.5)
  check(theme, 'textTertiary/card', t.textTertiary, t.card, 4.5)
  check(theme, 'text/bg', t.text, t.bg, 4.5)
  check(theme, 'accent/card', t.accent, t.card, 3)
  check(theme, 'onAccent/accentFill', t.onAccent, t.accentFill, 4.5)
  check(theme, 'borderField/card', t.borderField, t.card, 3)
  check(theme, 'accentHover/card', t.accentHover, t.card, 3)
  check(theme, 'elevated text check', t.text, t.elevated, 4.5)
  check(theme, 'vinculoAfinidade/bg', t.vinculoAfinidade, t.bg, 3)
  check(theme, 'vinculoLaco/bg', t.vinculoLaco, t.bg, 3)
  check(theme, 'vinculoHostil/bg', t.vinculoHostil, t.bg, 3)
  check(theme, 'vinculoNeutro/bg', t.vinculoNeutro, t.bg, 3)
}

if (failures.length) {
  console.error('\nContrast failures:')
  for (const f of failures) console.error('  ' + f)
  process.exit(1)
}

console.log('\ntest:contrast OK — genre palettes')
