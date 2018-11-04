import { Range, TextDocumentDecoration } from 'sourcegraph'
import { hsla, RED_HUE, YELLOW_HUE } from './colors'
import { Settings } from './settings'

interface LintResultResponse {
    errorCount: number;
    failures: FailuresItem[];
    fixes: any[];
    format: string;
    output: string;
    warningCount: number;
}
interface FailuresItem {
    sourceFile: SourceFile;
    failure: string;
    ruleName: string;
    fileName: string;
    startPosition: StartPosition;
    endPosition: EndPosition;
    rawLines: string;
    ruleSeverity: string;
}
interface SourceFile {
    pos: number;
    end: number;
    flags: number;
    kind: number;
    text: string;
    bindDiagnostics: any[];
    languageVersion: number;
    fileName: string;
    languageVariant: number;
    isDeclarationFile: boolean;
    scriptKind: number;
    pragmas: Pragmas;
    referencedFiles: any[];
    typeReferenceDirectives: any[];
    libReferenceDirectives: any[];
    amdDependencies: any[];
    hasNoDefaultLib: boolean;
    statements: StatementsItem[];
    endOfFileToken: EndOfFileToken;
    nodeCount: number;
    identifierCount: number;
    identifiers: Identifiers;
    parseDiagnostics: any[];
    lineMap: number[];
    _children: ChildrenItem[];
}
interface Pragmas {
}
interface StatementsItem {
    pos: number;
    end: number;
    flags: number;
    parent: string;
    kind: number;
    expression: Expression;
    modifierFlagsCache: number;
    _children: ChildrenItem[];
}
interface Expression {
    pos: number;
    end: number;
    flags: number;
    parent: string;
    kind?: number;
    expression?: Expression;
    arguments?: ArgumentsItem[];
    _children?: ChildrenItem[];
    name?: Name;
    escapedText?: string;
}
interface Name {
    pos: number;
    end: number;
    flags: number;
    parent: string;
    escapedText: string;
}
interface ChildrenItem {
    pos: number;
    end: number;
    flags: number;
    parent: string;
    escapedText?: string;
    kind?: number;
    expression?: Expression;
    name?: Name;
    _children?: ChildrenItem[];
    text?: string;
    arguments?: ArgumentsItem[];
    modifierFlagsCache?: number;
}
interface ArgumentsItem {
    pos: number;
    end: number;
    flags: number;
    parent: string;
    kind: number;
    text: string;
}
interface EndOfFileToken {
    pos: number;
    end: number;
    flags: number;
    parent: string;
    kind: number;
}
interface Identifiers {
}
interface StartPosition {
    position: number;
    lineAndCharacter: LineAndCharacter;
}
interface LineAndCharacter {
    line: number;
    character: number;
}
interface EndPosition {
    position: number;
    lineAndCharacter: LineAndCharacter;
}

export function lintToDecorations(
    settings: Pick<Settings, 'tslint.decorations.lineLintIssues'>,
    data: LintResultResponse | undefined | null
): TextDocumentDecoration[] {
    console.log('lintResult', data);
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
        const line =
            (startPos
                ? startPos.lineAndCharacter.line
                : endPos.lineAndCharacter.line)  // 0-indexed line
        const decoration: TextDocumentDecoration = {
            range: new Range(
                line,
                startPos.lineAndCharacter.character || 0,
                line,
                endPos.lineAndCharacter.character || 0
            ),
            isWholeLine: !startPos || !endPos,
        }
        if (settings['tslint.decorations.lineLintIssues']) {
            // decoration.backgroundColor = lineColor(failure, 0.7, 0.25)
            decoration.after = {
                backgroundColor: lineColor(failure, 0.7, 1),
                color: lineColor(failure, 0.25, 1),
                ...lineText(failure),
            }
        }
        decorations.push(decoration)
    }
    return decorations
}

function lineColor(
    failure: FailuresItem,
    lightness: number,
    alpha: number
): string {
    let hue: number
    if (failure.ruleSeverity === 'error') {
        hue = RED_HUE
        return hsla(hue, lightness, alpha)
    } else if (failure.ruleSeverity === 'warning') {
        hue = YELLOW_HUE // partially covered
        return hsla(hue, lightness, alpha)
    }
    return ''
}

function lineText(
    failure: FailuresItem
): { contentText?: string; hoverMessage?: string } {
    if (failure === null) {
        return {}
    }
    return {
        contentText: `w`,
        hoverMessage: failure.failure
    }
}
