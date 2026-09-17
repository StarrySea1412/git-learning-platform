# git-simulator-core

[![CI](https://github.com/StarrySea1412/git-learning-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/StarrySea1412/git-learning-platform/actions/workflows/ci.yml)

> 中文文档见 [README.md](./README.md)

A zero-dependency, in-memory Git simulator written in pure TypeScript — a "fake repository that runs commands".
Built for Git teaching tools, interactive sandboxes, and visualization projects. It also powers the
[Git Learning Platform](https://github.com/StarrySea1412/git-learning-platform).

## Why

Real Git is a poor fit for teaching tools: you need a working directory on disk, shelling out is slow, and
learners can genuinely break things. `git-simulator-core` models a repository as a plain state machine instead:

- **Zero dependencies** — pure functions over plain objects (`Map` + arrays). States clone, serialize, and drop into React state trivially.
- **Full local command set** — `init` / `add` / `commit` / `status` / `log` / `branch` / `checkout` / `switch` / `merge` / `rebase` (incl. `--onto`) / `reset` (soft/hard) / `revert` / `cherry-pick` / `stash` / `reflog`
- **Remote model** — local + origin dual repositories with `remote` / `fetch` / `pull` / `push`, faithfully reproducing non-fast-forward push rejections
- **Merge conflict simulation** — a file-content model: when both sides edit the same config, `merge` produces real conflict markers you can resolve
- **Collaboration factory** — `createCollaborationState` builds a "teammate already pushed, you haven't fetched" scenario in one call
- **Chinese feedback** — command output mimics a realistic Chinese-localized Git

## Install

```bash
npm install git-simulator-core
```

## Quick start

```ts
import {
  createInitialState,
  executeCommand,
  createCollaborationState,
  teammatePush,
} from 'git-simulator-core';

// Start from a clean repository
let state = createInitialState();

// Run a command; every call returns a brand-new immutable state
const result = executeCommand(state, 'git checkout -b feature');
if (result.ok) {
  state = result.state;
}
console.log(result.output); // 已创建并切换到分支 "feature"

// Commit (--allow-empty simulates empty commits; config= simulates editing config.js)
state = executeCommand(state, 'git commit --allow-empty -m "feat: login" config="log_level=debug"').state;

// Build a collaboration scenario: teammate has pushed, you haven't fetched
let collab = createCollaborationState({
  sharedMessages: ['setup project'],
  teammateMessages: ['teammate: add docs'],
});

// Mid-exercise, the teammate "suddenly" pushes another commit
const pushed = teammatePush(collab, 'teammate: fix navbar');
collab = pushed.state;
// Your local origin/main mirror doesn't move — you must git fetch to notice
```

## State model

`GitState` is a plain object:

| Field | Meaning |
|-------|---------|
| `commits` | `Map<id, GitCommit>` — all commits, with parent pointers and file contents |
| `branches` | `Map<name, commitId>` — local branches |
| `HEAD` | `"ref: main"` or a commit id (detached) |
| `staging` / `workingTreeDirty` | staging area / working tree state |
| `stash` | single-slot stash record |
| `reflog` | HEAD movement log (supports `HEAD@{1}` syntax) |
| `remote` | the origin repository: independent commits and branches |
| `remoteTracking` | `origin/*` mirrors, only updated on fetch |
| `mergeConflict` | in-progress conflict: both sides' content and the source branch |

Every `executeCommand` returns a **brand-new state** (the input is immutable), so time travel and undo are trivial.

## Supported commands

```
git init [path]           git clone <url>
git add <files|.>         git commit -m "msg" [--allow-empty] [config="value"]
git status [-s]           git log [--oneline] [--graph] [--all]
git branch [name|-a|-d]   git checkout <branch|commit|HEAD~n> [-b]
git switch <branch> [-c]  git merge <branch>
git rebase <branch>       git rebase --onto <new> <old> <branch>
git reset --soft|--hard   git revert HEAD
git cherry-pick <ref>     git stash [pop|list]
git reflog                git remote [-v|add <name> <url>]
git fetch [origin]        git pull [origin <branch>]
git push [origin <branch>] [-u]
resolve-conflict [ours|theirs|both]   ← merge conflict resolution (teaching helper)
```

The `config="value"` argument on `commit` is the simplified entry point into the file-content model:
change `config.js` on both sides and `merge` triggers a conflict — the hook for conflict teaching.

## Use cases

- **Teaching platforms** — this package drives a 38-task interactive Git exercise system
- **Sandboxes** — give users a "cannot-break" repository to experiment freely
- **Visualization** — states are plain data; draw commit/branch graphs without hooking into real Git
- **Testing** — unit tests that need Git-repository-behavior fixtures

## Development

This package lives as a subpackage of the git-learning-platform monorepo (source in `packages/git-simulator`):

```bash
# Build types and ESM output
npm run build
```

## License

[MIT](../../LICENSE)
