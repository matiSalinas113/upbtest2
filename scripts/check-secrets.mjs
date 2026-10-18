import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const paths = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
const rules = [
  ['token de GitHub', /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})/],
  ['token de acceso Google', /ya29\.[A-Za-z0-9._~-]{15,}/],
  ['refresh token Google', /1\/\/[A-Za-z0-9_-]{15,}/],
  ['clave privada', /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/],
  ['cuenta de servicio privada', /"type"\s*:\s*"service_account"/],
];
const findings = [];
for (const path of paths) {
  if (/(^|\/)firebase-debug(?:\.[^/]*)?\.log$/.test(path) || /(^|\/)\.env(?:\.|$)/.test(path) && !path.endsWith('.env.example')) findings.push({ path, reason: 'archivo local sensible versionado' });
  let buffer;
  try { buffer = readFileSync(new URL(path, new URL('../', import.meta.url))); } catch { continue; }
  if (buffer.subarray(0, 512).includes(0)) continue;
  for (const [reason, pattern] of rules) if (pattern.test(buffer.toString('utf8'))) findings.push({ path, reason });
}
if (findings.length) {
  for (const finding of findings) console.error(`${finding.path}: ${finding.reason} (valor oculto)`);
  process.exitCode = 1;
} else console.log(`Sin credenciales de los tipos comprobados en ${paths.length} archivos versionados. Los identificadores publicos de Firebase no son secretos.`);
