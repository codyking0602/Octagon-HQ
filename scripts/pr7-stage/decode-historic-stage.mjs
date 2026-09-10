import { execFileSync } from 'node:child_process';
import { brotliDecompressSync } from 'node:zlib';

const ref = 'origin/feat/who-am-i-nfl-b-person-identity-research-stage';
const paths = [1,2,3,4].map(i => `scripts/pr7-data-${String(i).padStart(2,'0')}.b64`);
const texts = paths.map(path => execFileSync('git',['show',`${ref}:${path}`],{encoding:'utf8'}).trim());
console.log('historic stage part lengths', texts.map(x=>x.length).join(','));

function inspect(label, b64) {
  try {
    const raw = brotliDecompressSync(Buffer.from(b64,'base64')).toString('utf8');
    console.log(label, 'brotli raw bytes', raw.length, 'prefix', JSON.stringify(raw.slice(0,120)));
    try {
      const parsed = JSON.parse(raw);
      console.log(label, 'JSON type', Array.isArray(parsed)?'array':typeof parsed, 'count', Array.isArray(parsed)?parsed.length:'n/a');
      if (Array.isArray(parsed)) {
        console.log(label, 'identities', parsed.map(p=>`${p.name}|${p.id}|${p.facts?.length}`).join('\n'));
      }
    } catch (e) {
      console.log(label, 'JSON parse failed', e.message, 'tail', JSON.stringify(raw.slice(-180)));
    }
  } catch (e) {
    console.log(label, 'brotli failed', e.message);
  }
}

for (let i=0;i<texts.length;i++) inspect(`part${i+1}`, texts[i]);
inspect('concat', texts.join(''));
process.exit(1);
