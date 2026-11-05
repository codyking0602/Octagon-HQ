#!/usr/bin/env bash
# Non-forcing asset commit delivery: preserve concurrent branch writers.
set -euo pipefail
branch="${1:?branch is required}"
if [[ ! "$branch" =~ ^[A-Za-z0-9][A-Za-z0-9_./-]*$ ]] || [[ "$branch" == -* ]]; then
  echo "Invalid asset branch name" >&2
  exit 2
fi
for attempt in 1 2 3 4 5; do
  if git push origin "HEAD:refs/heads/$branch"; then
    exit 0
  fi
  echo "Asset branch moved; fetching and rebasing attempt $attempt/5" >&2
  git fetch origin "$branch"
  if ! git rebase "origin/$branch"; then
    git rebase --abort || true
    echo "Asset branch has conflicting edits; refusing unsafe push" >&2
    exit 1
  fi
done
echo "Asset push remained unavailable after five non-forcing attempts" >&2
exit 1
