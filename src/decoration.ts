import { Range, TextDocumentDecoration } from 'sourcegraph'

export interface LintResultResponse {
    errorCount: number
    failures: FailuresItem[]
    fixes: any[]
    format: string
    output: string
    warningCount: number
}
export interface FailuresItem {
    failure: string
    ruleName: string
    fileName: string
    startPosition: StartPosition
    endPosition: EndPosition
    rawLines: string
    ruleSeverity: string
}
interface StartPosition {
    position: number
    lineAndCharacter: LineAndCharacter
}
interface LineAndCharacter {
    line: number
    character: number
}
interface EndPosition {
    position: number
    lineAndCharacter: LineAndCharacter
}

/**
 * Translates lintResult to decorations for file
 */
export function lintToDecorations(
    data: LintResultResponse | undefined | null
): TextDocumentDecoration[] {
    if (!data) {
        return []
    }
    const decorations: TextDocumentDecoration[] = []
    for (const failure of data.failures) {
        if (failure === null) {
            continue
        }
        const startPos = failure.startPosition
        const endPos = failure.endPosition
        const line = startPos ? startPos.lineAndCharacter.line : endPos.lineAndCharacter.line
        const decoration: TextDocumentDecoration = {
            range: new Range(
                line,
                startPos.lineAndCharacter.character || 0,
                line,
                endPos.lineAndCharacter.character || 0
            ),
            isWholeLine: !startPos || !endPos,
        }
        decoration.backgroundColor = issueColor(failure, 0.7, 0.15)
        decoration.after = {
            color: issueColor(failure, 0.5, 1),
            ...issueText(failure),
        }
        decorations.push(decoration)
    }
    return decorations
}

/**
 * builds hsla color value from inputs
 */
export function hsla(hue: number, lightness: number, alpha: number): string {
    return `hsla(${hue}, 100%, ${lightness * 100}%, ${alpha})`
}

/**
 * Gets lint result failure color based on failure severity
 */
function issueColor(failure: FailuresItem, lightness: number, alpha: number): string {
    let hue: number
    if (failure.ruleSeverity === 'error') {
        hue = 0 // redish
        return hsla(hue, lightness, alpha)
    } else if (failure.ruleSeverity === 'warning') {
        hue = 60 // yellowish
        return hsla(hue, lightness, alpha)
    }
    return ''
}

/**
 * Builds decoration tooltip icon content
 */
function issueText(failure: FailuresItem): { contentText?: string; hoverMessage?: string } {
    if (failure === null) {
        return {}
    }
    return {
        contentText: failure.ruleSeverity === 'error' ? '🚨' : '⚠️',
        hoverMessage: failure.failure,
    }
}
