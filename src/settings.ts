/**
 * The resolved and normalized settings for this extension, the result of calling resolveSettings on a raw settings
 * value.
 *
 * See the configuration JSON Schema in extension.json for the canonical documentation on these properties.
 */
export interface Settings {
    ['tslint.toggleLintIssueDisplay']: boolean
    ['tslint.decorations.lineLintIssues']: boolean
}

/** Returns a copy of the extension settings with values normalized and defaults applied. */
export function resolveSettings(raw: Partial<Settings>): Settings {
    return {
        ['tslint.toggleLintIssueDisplay']: raw['tslint.toggleLintIssueDisplay'] !== false,
        ['tslint.decorations.lineLintIssues']: !!raw[
            'tslint.decorations.lineLintIssues'
        ]
    }
}
