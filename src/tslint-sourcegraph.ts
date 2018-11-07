import * as sourcegraph from 'sourcegraph'
import { IConfigurationFile } from 'tslint/lib/configuration'
import { LintResultResponse, lintToDecorations } from './decoration'
import { getLinterConfiguration } from './loadConfig'
import { resolveSettings, Settings } from './settings'

export function activate(): void {
    let tsLintConfig: IConfigurationFile | null = null

    function afterActivate(): void {
        function activeEditor(): sourcegraph.CodeEditor | undefined {
            return sourcegraph.app.activeWindow ? sourcegraph.app.activeWindow.visibleViewComponents[0] : undefined
        }

        async function decorate(editor: sourcegraph.CodeEditor | undefined = activeEditor()): Promise<void> {
            const settings = resolveSettings(sourcegraph.configuration.get<Settings>().value)

            const langServerAddress = settings['tslint.langserver.address']
            if (!langServerAddress) {
                console.log('No tslint.langserver.address was set, exiting.')
                return
            }

            const tslintConfigPath = settings['tslint.config.path']
            // TODO: Is there a better method to skip non typescript/javascript files ?
            if (!editor || !['typescript', 'javascript'].includes(editor.document.languageId)) {
                return
            }
            try {
                if (!tsLintConfig) {
                    tsLintConfig = await getLinterConfiguration(editor.document.uri, tslintConfigPath)
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
                const lintResult = (await resp.json()) as LintResultResponse
                const decorations = settings['tslint.decorations.showLintIssues'] ? lintToDecorations(lintResult) : []
                editor.setDecorations(null, decorations)
                // Update context to display file issue counts in toolbar
                const context: {
                    [key: string]: string | number | boolean | null
                } = {}
                if (lintResult) {
                    context[`tslint.issueCount`] = Array.isArray(lintResult.failures)
                        ? lintResult.failures.length
                        : 0
                }
                sourcegraph.internal.updateContext(context)
            } catch (err) {
                console.error('Decoration error:', JSON.stringify(err))
            }
        }
        sourcegraph.configuration.subscribe(() => decorate())
        sourcegraph.workspace.onDidOpenTextDocument.subscribe(() => decorate())

        // Handle the "Set TSlint config path" command (show the user a prompt for the path and save to settings).
        sourcegraph.commands.registerCommand('tslint.setconfigPath', async () => {
            let configPath = await sourcegraph.app.activeWindow!.showInputBox({
                prompt: 'TSLint config file path',
                value: 'tslint.json',
            })
            if (configPath !== undefined) {
                configPath = configPath || undefined
                return sourcegraph.configuration.get<Settings>().update('tslint.config.path', configPath)
            }
        })
    }
    setTimeout(afterActivate, 0)
}
