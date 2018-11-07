import { resolveSettings, Settings } from './settings'

describe('Settings', () => {
    describe('decorations', () => {
        it('applies default visibility', () =>
            expect(resolveSettings({})['tslint.decorations.showLintIssues']).toEqual(false))
        it('allows overriding properties', () =>
            expect(resolveSettings({ 'tslint.decorations.showLintIssues': false })).toStrictEqual({
                'tslint.showIssueCount': false,
                'tslint.decorations.showLintIssues': false,
                'tslint.langserver.address': 'http://localhost:2345',
                'tslint.config.path': 'tslint.json',
            } as Settings))

        it('applies defaults for the other properties', () =>
            expect(resolveSettings({})).toStrictEqual({
                'tslint.showIssueCount': false,
                'tslint.decorations.showLintIssues': false,
                'tslint.langserver.address': 'http://localhost:2345',
                'tslint.config.path': 'tslint.json',
            } as Settings))
    })
})
