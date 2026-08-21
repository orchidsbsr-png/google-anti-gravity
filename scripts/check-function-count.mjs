// Guard against a silent production failure.
//
// This project has no full-stack framework, so Vercel turns every file in
// api/ into its own Function, and the Hobby plan allows at most 12 per
// deployment. Go over and the BUILD FAILS — but the site keeps serving the
// previous deployment, so everything looks fine while your change is simply
// not live. That is a miserable thing to debug from the outside, so fail
// here instead, before the deploy.
//
// If the project moves to Pro, this limit disappears — raise MAX or delete
// this check and the prebuild hook in package.json.

import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const MAX = 12; // Vercel Hobby: Functions created per deployment
const apiDir = join(fileURLToPath(new URL('..', import.meta.url)), 'api');

function collect(dir) {
    let found = [];
    for (const entry of readdirSync(dir)) {
        // api/_lib is shared code, not an entry point — Vercel ignores
        // directories and files prefixed with an underscore.
        if (entry.startsWith('_')) continue;
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) found = found.concat(collect(full));
        else if (entry.endsWith('.js') || entry.endsWith('.ts')) found.push(full);
    }
    return found;
}

let functions = [];
try {
    functions = collect(apiDir);
} catch {
    process.exit(0); // no api/ directory — nothing to check
}

if (functions.length > MAX) {
    const list = functions.map(f => `  - ${relative(process.cwd(), f)}`).join('\n');
    console.error(
        `\nBUILD STOPPED: ${functions.length} Vercel Functions in api/, but the Hobby plan allows ${MAX}.\n\n` +
        `${list}\n\n` +
        `Deploying this would fail on Vercel and leave production silently running the\n` +
        `previous version. Merge two routes into one (dispatch on an "action" field in\n` +
        `the request body, the way api/admin_auth.js and api/shipment.js already do),\n` +
        `or upgrade the project to Pro, which removes the limit.\n`
    );
    process.exit(1);
}

console.log(`api/: ${functions.length}/${MAX} Vercel Functions`);
