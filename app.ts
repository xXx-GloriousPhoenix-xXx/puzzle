import { readFile, writeFile, readdir } from 'fs/promises';
import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';

type Fragment = {
    inner: string,
    value: string,
    outer: string
}

async function readFragmentsAsync(sourcePath: string): Promise<Fragment[]>
{
    try
    {
        const data = await readFile(sourcePath, 'utf-8');
        const lines = data.split(/\r?\n/).filter(Boolean);

        const fragments: Fragment[] = [];
        
        for (const line of lines) {
            const fragment: Fragment = {
                inner: line.substring(0, 2),
                value: line.substring(2, 4),
                outer: line.substring(4, 6)
            };

            fragments.push(fragment);
        } 

        return fragments;
    }
    catch (error)
    {
        console.error('Помилка:', error);
        return [];
    }
}

async function findLongestPuzzleAsync(fragments: Fragment[]): Promise<Fragment[]>
{
    try
    {
        const count = fragments.length;

        const adj: number[][] = fragments.map((f, i) =>
            fragments
                .map((_, j) => j)
                .filter(j => j !== i && fragments[j].inner === f.outer)
        );

        let puzzle: number[] = [];

        function dfs(v: number, path: number[], visited: Set<number>): void {
            if (path.length > puzzle.length) {
                puzzle = [...path];
            }

            const remaining = count - visited.size;
            if (path.length + remaining <= puzzle.length) return;

            const candidates = adj[v]
                .filter(u => !visited.has(u))
                .sort((a, b) =>
                    adj[a].filter(x => !visited.has(x)).length -
                    adj[b].filter(x => !visited.has(x)).length
                );

            for (const u of candidates) {
                visited.add(u);
                path.push(u);
                dfs(u, path, visited);
                path.pop();
                visited.delete(u);
            }
        }

        for (let s = 0; s < count; s++) {
            const visited = new Set<number>([s]);
            dfs(s, [s], visited);
        }

        return puzzle.map(idx => fragments[idx]);
    }
    catch (error)
    {
        console.error("Помилка:", error);
        return [];
    }
}

function mergeFragments(puzzle: Fragment[]): string
{
    if (puzzle.length === 0) return '';

    var result = puzzle[0].inner;
    for (const fragment of puzzle)
    {
        result += fragment.value;
        result += fragment.outer;
    }

    return result;
}

async function runDataMode()
{
    const sourcePath = './data/source.txt';
    const destinationPath = './data/destination.txt';

    const fragments = await readFragmentsAsync(sourcePath);

    const spinner = ora('Виконується...').start();
    const puzzle = await findLongestPuzzleAsync(fragments);
    const result = mergeFragments(puzzle);

    await writeFile(destinationPath, result, 'utf-8');

    spinner.stop();
    console.log('\nРезультат:', result);
}

async function getTestFolders(): Promise<string[]>
{
    const entries = await readdir('./test', { withFileTypes: true });
    return entries
        .filter(e => e.isDirectory())
        .map(e => e.name)
        .sort();
}

async function runTestMode()
{
    const testFolders = await getTestFolders();

    if (testFolders.length === 0) {
        console.log('Не знайдено даних для тестування');
        return;
    }

    const selectedTest = await select({
        message: 'Оберіть тест:',
        choices: [
            { name: 'Всі тести', value: 'all' },
            ...testFolders.map(f => ({ name: f, value: f }))
        ]
    });

    const foldersToRun = selectedTest === 'all' ? testFolders : [selectedTest];

    for (const folder of foldersToRun)
    {
        const sourcePath = `./test/${folder}/source.txt`;
        const expectedPath = `./test/${folder}/expected.txt`;

        const fragments = await readFragmentsAsync(sourcePath);
        const puzzle = await findLongestPuzzleAsync(fragments);

        const spinner = ora('Виконується...').start();
        const result = mergeFragments(puzzle);
        spinner.stop();

        const expected = (await readFile(expectedPath, 'utf-8')).trim();

        if (result === expected)
        {
            console.log(chalk.green('✔'), `Тест ${folder}`);
        } 
        else 
        {
            console.log(chalk.red('✖'), `${folder}`);
            console.log('  Очікується:', expected);
            console.log('  Отримано:  ', result);
            console.log(`  Довжина: отримано ${result.length}, очікується ${expected.length}`);
        }
    }
}

async function runAsync()
{
    try
    {
        const mode = await select({
            message: 'Оберіть режим:',
            choices: [
                { name: 'Звичайний (data/)', value: 'data' },
                { name: 'Тест (test/)',    value: 'test' }
            ]
        });

        if (mode === 'data') {
            await runDataMode();
        } else {
            await runTestMode();
        }
    }
    catch (error)
    {
        console.error("Помилка:", error);
    }
}

runAsync();