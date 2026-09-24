#!/usr/bin/env node
/**
 * Fail if UI color hex literals exist outside tokens.css (except pin colors).
 * Gate: #RGB / #RRGGBB / #RRGGBBAA only (UX-1 clarifications).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const src = join(root, 'src')
const HEX = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g

const ALLOW_FILES = new Set([
  'src/styles/tokens.css',
])

/** Line-level allow: pin content exceptions */
function lineAllowed(rel, line) {
  if (ALLOW_FILES.has(rel)) return true
  if (/PIN_COLOR_/.test(line)) return true
  if (/cor_pin/.test(line)) return true
  if (/--pin-color/.test(line) || /pin-color/.test(line)) return true
  if (/pinColor/.test(line)) return true
  return false
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, out)
    else if (/\.(css|ts|tsx)$/.test(name)) out.push(p)
  }
  return out
}

const offenders = []
for (const file of walk(src)) {
  const rel = relative(root, file).replaceAll('\\', '/')
  const text = readFileSync(file, 'utf8')
  const lines = text.split(/\r?\n/)
  lines.forEach((line, i) => {
    if (lineAllowed(rel, line)) return
    const matches = line.match(HEX)
    if (matches) {
      offenders.push(`${rel}:${i + 1}: ${matches.join(', ')}`)
    }
  })
}

if (offenders.length) {
  console.error('lint:tokens failed — hex outside tokens (except pin):\n')
  for (const o of offenders) console.error('  ' + o)
  process.exit(1)
}

console.log('lint:tokens OK — no forbidden #hex outside tokens.css')
