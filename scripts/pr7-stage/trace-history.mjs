import { execFileSync } from 'node:child_process';

const args = [
  'log','--all','--since=2026-09-10T00:00:00Z','--until=2026-09-11T00:00:00Z',
  '--pretty=COMMIT %H %cI %s','--name-status','--',
  'scripts/pr7*','docs/who-am-i-pr7*','src/features/back-room/footballPersonIdentityKnowledge.ts'
];
const output = execFileSync('git', args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
console.log(output.slice(0, 160000));
process.exit(1);
