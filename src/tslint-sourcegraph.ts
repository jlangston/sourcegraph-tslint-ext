import * as sourcegraph from 'sourcegraph'
import { lintToDecorations } from './decoration'
import { lintSource } from './linter'
import { getLinterConfiguration } from './loadConfig'
import { resolveSettings, Settings } from './settings'

export function activate(): void {
    function activeEditor(): sourcegraph.CodeEditor | undefined {
        return sourcegraph.app.activeWindow
            ? sourcegraph.app.activeWindow.visibleViewComponents[0]
            : undefined
    }

    async function decorate(
        editor: sourcegraph.CodeEditor | undefined = activeEditor()
    ): Promise<void> {
        // TODO: Is there a better method to skip non typescript files and do TSX files get the same languageID ?
        if (!editor || editor.document.languageId !== 'typescript') {
            return
        }
        const settings = resolveSettings(
            sourcegraph.configuration.get<Settings>().value
        )
        try {
            const configuration = await getLinterConfiguration(
                editor.document.uri
            )
            console.log('Configuration', configuration)
            if (!configuration) {
                return
            }
            const decorations = await lintSource(editor.document.text)
            editor.setDecorations(
                null,
                lintToDecorations(settings, decorations)
            )
        } catch (err) {
            console.error('Decoration error:', err)
        }
    }
    sourcegraph.configuration.subscribe(() => decorate())
    // TODO(sqs): Add a way to get notified when a new editor is opened (because we want to be able to pass an `editor` to `updateDecorations`/`updateContext`, but this subscription just gives us a `doc`).
    sourcegraph.workspace.onDidOpenTextDocument.subscribe(() => decorate())
}

// Learn what else is possible by visiting the [Sourcegraph extension documentation](https://github.com/sourcegraph/sourcegraph-extension-docs)
