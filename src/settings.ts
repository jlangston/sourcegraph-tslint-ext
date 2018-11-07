export interface Settings {
    ['tslint.showIssueCount']: boolean
    ['tslint.decorations.showLintIssues']: boolean
    ['tslint.langserver.address']: string
    ['tslint.config.path']: string
}

/**
 * merges partial settings and applies deefailts to any Settings not defined
 */

export function resolveSettings(partialSettings: Partial<Settings>): Settings {
    return {
        ['tslint.showIssueCount']: !!partialSettings['tslint.showIssueCount'],
        ['tslint.decorations.showLintIssues']: !!partialSettings['tslint.decorations.showLintIssues'],
        ['tslint.langserver.address']: partialSettings['tslint.langserver.address'] || 'http://localhost:2345',
        ['tslint.config.path']: partialSettings['tslint.config.path'] || 'tslint.json',
    }
}
