#!/usr/bin/env bash
set -uo pipefail

printf '%s\n' '=== PR7 MATERIAL ACROSS ALL REMOTE BRANCH TIPS ==='
for ref in $(git for-each-ref --format='%(refname)' refs/remotes/origin | grep -v 'origin/HEAD'); do
  hits=()
  for path in \
    scripts/pr7-data.b64 \
    scripts/pr7-data-05.b64 scripts/pr7-data-06.b64 scripts/pr7-data-07.b64 scripts/pr7-data-08.b64 \
    scripts/pr7-data-part2.b64 scripts/pr7-data-part3.b64 scripts/pr7-data-part4.b64 scripts/pr7-data-part5.b64 scripts/pr7-data-part6.b64 \
    docs/who-am-i-pr7-nfl-b-person-identity-audit.md; do
    if git cat-file -e "$ref:$path" 2>/dev/null; then
      size=$(git cat-file -s "$ref:$path" 2>/dev/null || echo '?')
      hits+=("$path($size)")
    fi
  done
  owner='src/features/back-room/footballPersonIdentityKnowledge.ts'
  if git cat-file -e "$ref:$owner" 2>/dev/null; then
    if git show "$ref:$owner" 2>/dev/null | grep -q 'identity-pr7-'; then
      count=$(git show "$ref:$owner" 2>/dev/null | grep -c 'identity-pr7-' || true)
      hits+=("OWNER_HAS_PR7(count=$count)")
    fi
  fi
  if ((${#hits[@]})); then
    echo "$ref :: ${hits[*]}"
  fi
done

printf '%s\n' '=== PR7 MATERIAL IN DANGLING/UNREACHABLE RECENT COMMITS ==='
# GitHub fetch may include objects no longer reachable from branch tips. fsck can surface them.
git fsck --full --no-reflogs --unreachable 2>/dev/null | head -n 300 || true

exit 1
