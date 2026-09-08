import type { ITheme } from '@xterm/xterm'
import type * as monacoEditor from 'monaco-editor'
import { isTerminalBackgroundLight } from './terminal-title-contrast'

const THEME_NAME_PREFIX = 'orca-terminal-aligned-'

/** Monaco's `defineTheme` requires `/^[a-z0-9-]+$/i` — terminal theme names (built-in labels with
 *  spaces, or `custom:<uuid>` selections) don't qualify, so collapse anything else to `-`. */
function slugifyThemeName(themeName: string): string {
  return themeName.replace(/[^a-z0-9-]/gi, '-')
}

function buildEditorColors(theme: ITheme): monacoEditor.editor.IColors {
  const colorSources: [string, string | undefined][] = [
    ['editor.background', theme.background],
    ['editor.foreground', theme.foreground],
    ['editorCursor.foreground', theme.cursor],
    ['editor.selectionBackground', theme.selectionBackground],
    ['editorLineNumber.foreground', theme.brightBlack],
    ['editorLineNumber.activeForeground', theme.foreground]
  ]
  const entries = colorSources.filter((entry): entry is [string, string] => Boolean(entry[1]))
  return Object.fromEntries(entries)
}

/** Defines (redefining on every call, so edited custom theme colors stay current) and returns the
 *  Monaco theme name that mirrors `theme`'s colors. Cheap and synchronous — safe to call from a
 *  render-time memo. */
export function ensureMonacoTerminalAlignedTheme(
  monaco: typeof monacoEditor,
  themeName: string,
  theme: ITheme
): string {
  const monacoThemeName = `${THEME_NAME_PREFIX}${slugifyThemeName(themeName)}`
  const base = isTerminalBackgroundLight(theme.background) ? 'vs' : 'vs-dark'
  monaco.editor.defineTheme(monacoThemeName, {
    base,
    inherit: true,
    rules: [], // token colors inherit from `base`; only editor chrome is overridden below
    colors: buildEditorColors(theme)
  })
  return monacoThemeName
}
