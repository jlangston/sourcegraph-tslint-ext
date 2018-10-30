import { resolveSettings, Settings } from './settings'

describe('Settings', () => {
    describe('decorations', () => {
        it('applies defaults when not set', () =>
            expect( resolveSettings({})['tslint.decorations.lineLintIssues']).toEqual(false))

        it('respects the hide property', () =>
            expect(resolveSettings({
                    'tslint.toggleLintIssueDisplay': true,
                    'tslint.decorations.lineLintIssues': true,
                } as Settings)['tslint.toggleLintIssueDisplay']).toEqual(true))

        it('respects the other properties', () =>
            expect(
                resolveSettings({ 'tslint.decorations.lineLintIssues': false })).toStrictEqual(
                {
                    'tslint.decorations.lineLintIssues': false,
                    'tslint.toggleLintIssueDisplay': true,
                } as Settings
            ))

        it('applies defaults for the other properties', () =>
            expect(resolveSettings({})).toStrictEqual({
                'tslint.decorations.lineLintIssues': false,
                'tslint.toggleLintIssueDisplay': true,
            } as Settings))
    })
})
