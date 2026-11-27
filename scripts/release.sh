#!/usr/bin/env bash
# Usage: npm run release -- 1.2.3
# Run on an up-to-date main after develop has been merged into it.
# Bumps the version, tags vX.Y.Z, pushes (which triggers the APK build),
# then merges main back into develop.
set -euo pipefail

VERSION="${1:-}"
if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Usage: npm run release -- <major.minor.patch>   e.g. npm run release -- 1.0.0" >&2
  exit 1
fi
TAG="v$VERSION"

[[ "$(git rev-parse --abbrev-ref HEAD)" == "main" ]] || { echo "Switch to main first: git checkout main" >&2; exit 1; }
[[ -z "$(git status --porcelain)" ]] || { echo "Working tree is not clean. Commit or stash first." >&2; exit 1; }

git fetch origin main develop --tags
[[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/main)" ]] || { echo "main is not in sync with origin/main. Run: git pull" >&2; exit 1; }
git rev-parse -q --verify "refs/tags/$TAG" >/dev/null && { echo "Tag $TAG already exists." >&2; exit 1; }

npm version "$VERSION" --no-git-tag-version >/dev/null
git commit -am "Release $TAG"
git tag -a "$TAG" -m "Release $TAG"
git push origin main "$TAG"

# Keep develop up to date with the release commit.
git checkout develop
git pull --ff-only origin develop
git merge --no-ff main -m "Merge release $TAG back into develop"
git push origin develop
git checkout main

echo
echo "Released $TAG. The APK is being built: see the Actions tab, then the Releases page."
