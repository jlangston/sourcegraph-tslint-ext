import * as sourcegraph from 'sourcegraph'
import { LintResult } from 'tslint'
import { lintToDecorations } from './decoration'
import { getLinterConfiguration } from './loadConfig'
import { resolveSettings, Settings } from './settings'

export function activate(): void {
    let tsLintConfig = null

    function afterActivate(): void {
        const langServerAddress = sourcegraph.configuration.get<Settings>().get('tslint.langserver.address')
        if (!langServerAddress) {
            console.log('No tslint.langserver-address was set, exiting.')
            return
        }

        function activeEditor(): sourcegraph.CodeEditor | undefined {
            return sourcegraph.app.activeWindow ? sourcegraph.app.activeWindow.visibleViewComponents[0] : undefined
        }

        async function decorate(editor: sourcegraph.CodeEditor | undefined = activeEditor()): Promise<void> {
            // TODO: Is there a better method to skip non typescript files and do TSX files get the same languageID ?
            if (!editor || editor.document.languageId !== 'typescript') {
                return
            }
            const settings = resolveSettings(sourcegraph.configuration.get<Settings>().value)
            try {
                if (!tsLintConfig) {
                    tsLintConfig = await getLinterConfiguration(editor.document.uri)
                }
                if (!tsLintConfig) {
                    return
                }
                const request = new Request(langServerAddress as RequestInfo, {
                    method: 'POST',
                    mode: 'cors',
                    cache: 'no-cache',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                    },
                    body: JSON.stringify({
                        doc: {
                            text: editor.document.text,
                            uri: editor.document.uri,
                        },
                        config: tsLintConfig,
                    }),
                })

                const resp = await fetch(request)
                const lintResult = (await resp.json()) as LintResult
                editor.setDecorations(null, lintToDecorations(settings, lintResult))
            } catch (err) {
                console.error('Decoration error:', err)
            }
        }
        sourcegraph.configuration.subscribe(() => decorate())
        sourcegraph.workspace.onDidOpenTextDocument.subscribe(() => decorate())
    }
    setTimeout(afterActivate, 0)
}
