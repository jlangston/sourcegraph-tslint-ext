import { LintResult } from 'tslint'
// import { BrowserLinter } from 'tslint-playground/src/linter'
import { DEFAULT_CONFIG, IConfigurationFile } from 'tslint/lib/configuration'
import { BrowserLinter } from './tslint-playground-browserLinter/browserLinter'

export function lintSource(
    source: string,
    config: IConfigurationFile = DEFAULT_CONFIG
): Promise<LintResult | undefined> {
    const browserLinter = new BrowserLinter()
    const lintResult = browserLinter.runLint(source, config)

    return lintResult
}
