# secure-pnpm-ci

[![self-test](https://github.com/egesaktas/secure-pnpm-ci/actions/workflows/self-test.yml/badge.svg)](https://github.com/egesaktas/secure-pnpm-ci/actions/workflows/self-test.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A security-hardened, reusable GitHub Actions CI for **pnpm + Vite + Cloudflare Workers** projects.
Add one job to your repository and every pull request is linted, type-checked, tested, built,
audited for vulnerable dependencies, scanned for leaked secrets, and its workflows are audited too.

## Usage

```yaml
# .github/workflows/ci.yml in your repository
name: ci

on:
  pull_request:
  push:
    branches: [main]

permissions: {}

jobs:
  ci:
    uses: egesaktas/secure-pnpm-ci/.github/workflows/ci.yml@<commit-sha> # pin to a commit
    permissions:
      contents: read
```

Your project needs `lint`, `typecheck`, `test` and `build` scripts in `package.json`,
a committed `pnpm-lock.yaml`, and a `packageManager` field (for example `"pnpm@12.0.0"`).

### Inputs

| Input | Default | Description |
|---|---|---|
| `working-directory` | `.` | Directory that contains `package.json` and `pnpm-lock.yaml`. |
| `node-version` | `24` | Node.js version. |
| `run-tests` | `true` | Run `pnpm test`. |
| `audit-level` | `high` | Lowest `pnpm audit` severity that fails the build. |
| `secret-scan` | `true` | Scan the full git history with gitleaks. |
| `workflow-audit` | `true` | Audit your workflows with zizmor and actionlint. |

## What it checks

| Job | Steps |
|---|---|
| **check** | `pnpm install --frozen-lockfile` → lint → typecheck → test → build → `pnpm audit` |
| **secret scan** | gitleaks over the **entire git history**, not just the latest commit |
| **workflow audit** | [zizmor](https://docs.zizmor.sh) (security) and [actionlint](https://github.com/rhysd/actionlint) (correctness) over `.github/` |

## Security decisions

CI runs with access to your code and secrets, which makes it an attack target.
In March 2025 the popular `tj-actions/changed-files` action was compromised: its version tags were
moved to malicious code, and every workflow using `@v35`-style tags leaked secrets into public logs.
This workflow is built so that kind of attack does not reach it.

- **Every action is pinned to a full commit SHA.** A tag like `@v6` can be moved to different code;
  a commit SHA cannot. The version is kept as a comment, and Dependabot proposes updates as pull requests.
- **Dependabot waits seven days before proposing an update** (`cooldown`), giving the community time
  to catch a compromised release before it reaches this repository.
- **Least-privilege tokens.** The workflow starts from `permissions: {}` and each job asks only for
  `contents: read`. A leaked token cannot push code or change settings.
- **No credentials left on disk.** `actions/checkout` runs with `persist-credentials: false`,
  since no job needs to push.
- **Downloaded tools are checksum-verified.** gitleaks and actionlint are downloaded as release
  archives and checked against a pinned SHA-256 before they run.
- **No `${{ }}` inside shell scripts.** Inputs reach `run:` steps through environment variables,
  which prevents template injection.
- **Timeouts on every job,** so a hung job cannot burn hours of runner time (the default is six hours).
- **The workflows audit themselves.** This repository's workflows pass zizmor's strictest (`pedantic`)
  persona and actionlint with zero findings; the single exception is documented inline next to the
  line it applies to. Callers' workflows are audited with zizmor's default persona.

## Repository layout

```text
.github/
  workflows/
    ci.yml          # the reusable workflow (the product)
    self-test.yml   # runs ci.yml against example/ on every push and pull request
  dependabot.yml
example/            # React + Vite + Cloudflare Worker app used to prove the CI works
```

The example app has two test projects: **unit** tests run in Node, **worker** tests run inside
the real Cloudflare runtime (workerd) via `@cloudflare/vitest-plugin`.

```bash
cd example
pnpm install
pnpm test        # unit + worker tests
pnpm dev         # http://localhost:5173 and http://localhost:5173/api/health
```

## Roadmap

- [ ] Coverage thresholds and a job summary on every pull request
- [ ] Conventional Commits check for pull request titles
- [ ] `dependency-review-action` to block vulnerable or badly licensed dependencies
- [ ] Bundle size budget, Lighthouse CI, Playwright + axe accessibility tests
- [ ] OpenSSF Scorecard, CodeQL, and signed releases with artifact attestations

## License

[MIT](LICENSE)
