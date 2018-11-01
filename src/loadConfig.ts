import * as sourcegraph from 'sourcegraph'
import { IConfigurationFile } from 'tslint/lib/configuration';
import { resolveURI } from './uri'

export const getLinterConfiguration = (async ( uri : string): Promise<IConfigurationFile | null>  => {
        const linterConfigStr = await loadLinterConfig(uri)
        if (linterConfigStr === null) {
            return null
        }
        try {
            return JSON.parse(linterConfigStr);
        } catch(e) {
            console.error(e);
            throw new Error('Invalid tsconfig.json')
        }
    });

async function loadLinterConfig(uri: string): Promise<string | null> {
    const { repo } = resolveURI(uri)
    console.log('repo url', repo)
    const { data, errors } = await sourcegraph.commands.executeCommand(
        'queryGraphQL',
        `
        query LoadLinterConfig($repo: String!) {
            repository(name: $repo) {
              commit(rev: "HEAD") {
                file(path: "tslint.json") {
                  content
                }
              }
            }
          }
        `
	,
        { repo }
    )
    if (errors && errors.length > 0) {
        throw new Error(errors.join('\n'))
    }
    if (!data || !data.repository || !data.repository || !data.repository.commit || !data.repository.commit.file || !data.repository.commit.file.content) {
        return null
    }
    return data.repository.commit.file.content
}
