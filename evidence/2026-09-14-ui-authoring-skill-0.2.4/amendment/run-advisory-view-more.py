#!/usr/bin/env python3
"""Run one release-selected advisory case against an unpacked exact tarball."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import time

parser = argparse.ArgumentParser()
parser.add_argument('client', choices=['claude', 'codex'])
parser.add_argument('case', choices=['private-native-request-preserves-current-boundary', 'android-preview-respects-provider-limit', 'preserve-partially-realized-appearance-intent', 'ui-foundation-read-back'])
parser.add_argument('--package-root', required=True, type=Path)
parser.add_argument('--output', required=True, type=Path)
args = parser.parse_args()
repo = Path(__file__).resolve().parents[2]
package = args.package_root.resolve()
run = args.output.resolve()
run.mkdir(mode=0o700)
work = run / 'work'
work.mkdir(mode=0o700)
if args.case == 'ui-foundation-read-back':
    document = (repo / 'evals/create-full-stack-app/ui-foundation-release.md').read_text()
    case = {'prompt': '\n'.join(line[2:] for line in document.splitlines() if line.startswith('> ')), 'artifacts': []}
else:
    case = next(c for c in json.loads((repo / 'evals/create-full-stack-app/cases.json').read_text())['cases'] if c['id'] == args.case)
inputs = {}
for artifact in case['artifacts']:
    assert artifact['role'] == 'input'
    target = work / artifact.get('stage_as', Path(artifact['path']).name)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(repo / artifact['path'], target)
    inputs[str(target.relative_to(work))] = hashlib.sha256(target.read_bytes()).hexdigest()
if args.client == 'codex':
    locator = work / '.agents/skills/create-full-stack-app'
    locator.parent.mkdir(parents=True)
    locator.symlink_to(package / 'skills/create-full-stack-app', target_is_directory=True)

prompt = 'Use the First Draft Skill for this advisory task. ' + case['prompt'] + '\n'
attachments = [Path(a['path']).name for a in case['artifacts'] if 'stage_as' not in a]
if attachments:
    prompt += 'Attached input files are available in the working directory: ' + ', '.join(attachments) + '.\n'

(run / 'prompt.txt').write_text(prompt)
(run / 'input-hashes.json').write_text(json.dumps(inputs, indent=2) + '\n')
if args.client == 'claude':
    executable = '/Users/sandbox2/.local/bin/claude'
    command = [executable, '--print', '--verbose', '--output-format', 'stream-json',
               '--no-session-persistence', '--plugin-dir', str(package), '--add-dir', str(package),
               '--model', 'claude-opus-5[1m]', '--restricted', '--strict-mcp-config',
               '--mcp-config', '{"mcpServers":{}}', '--setting-sources', '', '--no-chrome',
               '--tools', 'Read,Glob,Grep,Skill', '--allowedTools', 'Read,Glob,Grep,Skill',
               '--permission-mode', 'dontAsk', '--permission-prompts', 'none']
else:
    executable = str(repo / 'tmp/qualification-clients/node_modules/.bin/codex')
    command = [executable, 'exec', '--sandbox', 'read-only', '--ephemeral', '--ignore-user-config',
               '--ignore-rules', '--skip-git-repo-check', '--model', 'gpt-6-astra', '--json',
               '-C', str(work), '--output-last-message', str(run / 'response.md'), '-']
environment = {k: v for k, v in os.environ.items()
               if not k.startswith(('FIRSTDRAFT_', 'CLAUDE_PLUGIN_OPTION_', 'REVYL_'))}
command_record = {'command': command, 'cwd': str(work), 'case': args.case,
                  'client': args.client, 'package_root': str(package),
                  'package_sha256': hashlib.sha256((package.parent / 'firstdraft.com-claude-code-0.2.4.tgz').read_bytes()).hexdigest(),
                  'skills_commit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=repo, text=True).strip(),
                  'omitted_environment_prefixes': ['FIRSTDRAFT_', 'CLAUDE_PLUGIN_OPTION_', 'REVYL_']}
(run / 'command.json').write_text(json.dumps(command_record, indent=2) + '\n')
started = time.time()
with (run / 'transcript.jsonl').open('w') as out, (run / 'stderr.log').open('w') as err:
    result = subprocess.run(command, input=prompt, text=True, cwd=work, env=environment,
                            stdout=out, stderr=err, timeout=600)
after = {p: hashlib.sha256((work / p).read_bytes()).hexdigest() for p in inputs}
assert after == inputs, 'advisory evaluation changed a staged input'
if args.client == 'claude':
    events = [json.loads(line) for line in (run / 'transcript.jsonl').read_text().splitlines()]
    final = [event for event in events if event.get('type') == 'result']
    if final:
        (run / 'response.md').write_text(final[-1].get('result', '') + '\n')
    calls = [content for event in events if event.get('type') == 'assistant'
             for content in event.get('message', {}).get('content', []) if content.get('type') == 'tool_use']
    (run / 'tool-calls.json').write_text(json.dumps(calls, indent=2) + '\n')
receipt = {'client': args.client, 'case': args.case, 'exit_code': result.returncode,
           'duration_seconds': round(time.time() - started, 2), 'inputs_unchanged': inputs == after,
           'work_files': sorted(str(p.relative_to(work)) for p in work.rglob('*') if p.is_file() or p.is_symlink())}
(run / 'execution.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt))
raise SystemExit(result.returncode)
