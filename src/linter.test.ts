import { lintSource } from './linter'
import { DEFAULT_CODE } from './tslint-playground-browserLinter/config';

describe('Linter', () => {
    it('Lints Example Source', async () => {
        // const config = {
        //     extends: ['tslint:recommended'],
        //     rules: {}, // add additional rules and their configuration
        //     jsRules: {},
        //     rulesDirectory: '',
        // }

        const result = await lintSource(DEFAULT_CODE)
        expect(result).toMatchSnapshot()
    })
})
