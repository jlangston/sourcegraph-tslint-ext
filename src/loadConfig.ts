import * as sourcegraph from 'sourcegraph'
import { IConfigurationFile } from 'tslint/lib/configuration'

/**
 * loads TSLint configuration from repo at given uri
 */
export async function getLinterConfiguration(uri: string, configPath: string): Promise<IConfigurationFile | null> {
    const linterConfigStr = await loadLinterConfig(uri, configPath)
    if (linterConfigStr === null) {
        return null
    }
    try {
        return JSON.parse(linterConfigStr)
    } catch (e) {
        console.error(e)
        throw new Error('Invalid tsconfig.json path')
    }
}

/**
 *  extracts repo name from repo uri
 */
function repoFromUri(uri: string): string | undefined {
    const url = new URL(uri)
    if (url.protocol === 'git:') {
        return (url.host + url.pathname).replace(/^\/*/, '').toLowerCase()
    }
    throw new Error(`unrecognized URI Protocol: ${JSON.stringify(uri)}`)
}

/**
 *  Fetches TSlint config file from repo via GraphQL query
 */
async function loadLinterConfig(uri: string, configFile: string): Promise<string | null> {
    const repo = repoFromUri(uri)
    const { data, errors } = await sourcegraph.commands.executeCommand(
        'queryGraphQL',
        `
        query LoadLinterConfig($repo: String!, $configFile: String!) {
            repository(name: $repo) {
              commit(rev: "HEAD") {
                file(path: $configFile) {
                  content
                }
              }
            }
          }
        `,
        { repo, configFile}
    )
    if (errors && errors.length > 0) {
        throw new Error(errors.join('\n'))
    }
    if (
        !data ||
        !data.repository ||
        !data.repository ||
        !data.repository.commit ||
        !data.repository.commit.file ||
        !data.repository.commit.file.content
    ) {
        return null
    }
    return data.repository.commit.file.content
}
