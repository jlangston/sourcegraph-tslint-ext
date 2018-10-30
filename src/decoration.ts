import { Range, TextDocumentDecoration } from 'sourcegraph'
import { LintResult, RuleFailure } from 'tslint'
import { hsla, RED_HUE, YELLOW_HUE } from './colors'
import { Settings } from './settings'

export function lintToDecorations(
    settings: Pick<Settings, 'tslint.decorations.lineLintIssues'>,
    data: LintResult | undefined | null
): TextDocumentDecoration[] {
    if (!data) {
        return []
    }
    const decorations: TextDocumentDecoration[] = []
    for (const failure of data.failures) {
        if (failure === null) {
            continue
        }
        const startPos = failure.getStartPosition()
        const endPos = failure.getEndPosition()
        const line =
            (startPos
                ? startPos.getLineAndCharacter().line
                : endPos.getLineAndCharacter().line) - 1 // 0-indexed line
        const decoration: TextDocumentDecoration = {
            range: new Range(
                line,
                startPos.getLineAndCharacter().character || 0,
                line,
                endPos.getLineAndCharacter().character || 0
            ),
            isWholeLine: !startPos || !endPos,
        }
        if (settings['codecov.decorations.lineLintIssues']) {
            decoration.backgroundColor = lineColor(failure, 0.7, 0.25)
        }
        // if (settings['codecov.decorations.lineHitCounts']) {
        //     decoration.after = {
        //         backgroundColor: lineColor(coverage, 0.7, 1),
        //         color: lineColor(coverage, 0.25, 1),
        //         ...lineText(coverage),
        //     }
        // }
        decorations.push(decoration)
    }
    return decorations
}

function lineColor(
    failure: RuleFailure,
    lightness: number,
    alpha: number
): string {
    let hue: number
    if (failure.getRuleSeverity() === 'error') {
        hue = RED_HUE
        return hsla(hue, lightness, alpha)
    } else if (failure.getRuleSeverity() === 'warning') {
        hue = YELLOW_HUE // partially covered
        return hsla(hue, lightness, alpha)
    }
    return ''
}

// function lineText(
//     failure: RuleFailure[]
// ): { contentText?: string; hoverMessage?: string } {
//     if (failure === null) {
//         return {}
//     }
//     return {
//         contentText: ``,
//         hoverMessage: ``
//     }
// }
