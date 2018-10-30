import * as sourcegraph from 'sourcegraph'
import { lintToDecorations } from './decoration'
import { lintSource } from './linter'
import { resolveSettings, Settings } from './settings'

/** Entrypoint for the Codecov Sourcegraph extension. */
export function activate(): void {
    function activeEditor(): sourcegraph.CodeEditor | undefined {
        return sourcegraph.app.activeWindow
            ? sourcegraph.app.activeWindow.visibleViewComponents[0]
            : undefined
    }

    // When the configuration or current file changes, publish new decorations.
    //
    // TODO: Unpublish decorations on previously (but not currently) open files when settings changes, to avoid a
    // brief flicker of the old state when the file is reopened.
    async function decorate(
        editor: sourcegraph.CodeEditor | undefined = activeEditor()
    ): Promise<void> {
        if (!editor) {
            return
        }
        const settings = resolveSettings(
            sourcegraph.configuration.get<Settings>().value
        )
        try {
            // TODO: How to get tslint config file??
            const decorations = await lintSource(editor.document.text);
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

    // Set context values referenced in template expressions in the extension manifest (e.g., to interpolate "N" in
    // the "Coverage: N%" button label).
    //
    // The context only needs to be updated when the endpoints configuration changes.
    // async function updateContext(
    //     editor: sourcegraph.CodeEditor | undefined = activeEditor()
    // ): Promise<void> {
    //     if (!editor) {
    //         return
    //     }
    //     const lastURI = resolveURI(editor.document.uri)
    //     const endpoint = resolveEndpoint(
    //         sourcegraph.configuration.get<Settings>().get('codecov.endpoints')
    //     )

    //     const context: {
    //         [key: string]: string | number | boolean | null
    //     } = {}

    //     const p = codecovParamsForRepositoryCommit(lastURI)
    //     // TODO Support non-codecov.io endpoints.
    //     const repoURL = `https://codecov.io/${p.service}/${p.owner}/${p.repo}`
    //     context['codecov.repoURL'] = repoURL
    //     const baseFileURL = `${repoURL}/src/${p.sha}`
    //     context['codecov.commitURL'] = `${repoURL}/commit/${p.sha}`

    //     try {
    //         // Store overall commit coverage ratio.
    //         const commitCoverage = await getCommitCoverageRatio(
    //             lastURI,
    //             endpoint
    //         )
    //         context['codecov.commitCoverage'] = commitCoverage
    //             ? commitCoverage.toFixed(1)
    //             : null

    //         // Store coverage ratio (and Codecov report URL) for each file at this commit so that
    //         // template strings in contributions can refer to these values.
    //         const fileRatios = await getFileCoverageRatios(lastURI, endpoint)
    //         for (const [path, ratio] of Object.entries(fileRatios)) {
    //             const uri = `git://${lastURI.repo}?${lastURI.rev}#${path}`
    //             context[`codecov.coverageRatio.${uri}`] = ratio.toFixed(0)
    //             context[`codecov.fileURL.${uri}`] = `${baseFileURL}/${path}`
    //         }
    //     } catch (err) {
    //         console.error(`Error loading Codecov file coverage: ${err}`)
    //     }
    //     sourcegraph.internal.updateContext(context)
    // }
    // sourcegraph.configuration.subscribe(() => updateContext())
    // sourcegraph.workspace.onDidOpenTextDocument.subscribe(() => updateContext())
}


// Learn what else is possible by visiting the [Sourcegraph extension documentation](https://github.com/sourcegraph/sourcegraph-extension-docs)
