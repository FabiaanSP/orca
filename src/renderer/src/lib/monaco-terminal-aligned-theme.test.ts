import { describe, expect, it, vi } from 'vitest'
import type { ITheme } from '@xterm/xterm'
import type * as monacoEditor from 'monaco-editor'
import { ensureMonacoTerminalAlignedTheme } from './monaco-terminal-aligned-theme'

const darkTheme: ITheme = {
  background: '#000000',
  foreground: '#ffffff',
  green: '#00ff00'
}

function makeMonacoStub(): { monaco: typeof monacoEditor; defineTheme: ReturnType<typeof vi.fn> } {
  const defineTheme = vi.fn()
  const monaco = { editor: { defineTheme } } as unknown as typeof monacoEditor
  return { monaco, defineTheme }
}

describe('ensureMonacoTerminalAlignedTheme', () => {
  it('slugifies built-in theme names (spaces are illegal Monaco theme-name characters)', () => {
    const { monaco, defineTheme } = makeMonacoStub()
    const name = ensureMonacoTerminalAlignedTheme(monaco, 'Ghostty Default Style Dark', darkTheme)
    expect(name).toBe('orca-terminal-aligned-Ghostty-Default-Style-Dark')
    expect(defineTheme).toHaveBeenCalledWith(name, expect.anything())
  })

  it('slugifies custom theme selections (the "custom:" prefix colon is illegal too)', () => {
    const { monaco } = makeMonacoStub()
    const name = ensureMonacoTerminalAlignedTheme(monaco, 'custom:af12-9c', darkTheme)
    expect(name).toMatch(/^[a-z0-9-]+$/i)
    expect(name).toBe('orca-terminal-aligned-custom-af12-9c')
  })
})
