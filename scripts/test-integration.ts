import { spawn } from 'bun'
import process from 'node:process'

const root = process.cwd()

async function run(
    command: string[],
) {
    const subprocess = spawn(command, {
        cwd: root,
        stdout: 'inherit',
        stderr: 'inherit',
        stdin: 'inherit',
    })

    const exitCode =
        await subprocess.exited

    if (exitCode !== 0) {
        throw new Error(
            `Command failed: ${command.join(' ')}`,
        )
    }
}

let exitCode = 0

try {
    console.log(
        '\nStarting integration test database...\n',
    )

    await run([
        'docker',
        'compose',
        '-f',
        'compose.test.yaml',
        'up',
        '-d',
        '--wait',
    ])

    console.log(
        '\nApplying test database migrations...\n',
    )

    await run([
        'bun',
        'run',
        '--cwd',
        'apps/api',
        'db:migrate:test',
    ])

    console.log(
        '\nRunning integration tests...\n',
    )

    await run([
        'bun',
        'run',
        '--cwd',
        'apps/api',
        'test:integration',
    ])
} catch (error) {
    exitCode = 1

    console.error(error)
} finally {
    console.log(
        '\nStopping integration test database...\n',
    )

    try {
        await run([
            'docker',
            'compose',
            '-f',
            'compose.test.yaml',
            'down',
            '-v',
            '--remove-orphans',
        ])
    } catch (error) {
        exitCode = 1

        console.error(
            'Failed to clean up test database:',
            error,
        )
    }
}

process.exit(exitCode)
