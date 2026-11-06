# Shared Renovate configuration

## Use the preset

Enable Renovate on your repository and give it read access to this preset
repository. Add a `renovate.json` file at the root of your repository's default
branch.

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>stateshifters/renovate-common"]
}
```

Renovate loads [default.json](default.json) and targets `main`. Set
`baseBranchPatterns` in your repository's configuration if you use another
target branch. After Renovate runs, check its logs and the dependency dashboard
for detected updates. Renovate closes the dashboard issue when it is empty.
Eligible minor/patch updates and initial pins can automerge after required
checks and repository merge rules pass.
Major updates and updates from versions below `1.0.0` require manual merging.

See [Renovate's shared preset guide](https://docs.renovatebot.com/config-presets/).

## Declare versions

Use standard dependency declarations for the native managers enabled in your
configuration. For example, use `package.json` for npm, `.nvmrc` for a literal Node
version, `go.mod` for Go modules, and `uses:` for GitHub Actions. Renovate also
reads image references in Dockerfiles and Compose files. See `enabledManagers`
in the [default preset](default.json).

Use a versioned `$schema` URL in `biome.json` or `biome.jsonc`, and declare
`@tsconfig/nodeXX` base configs in `tsconfig.json` or `jsconfig.json`. The
preset includes matchers for these declarations.

### Annotate tool versions

For a tool installed by a script, annotate its literal version assignment in
any file Renovate scans, regardless of its extension. Reference the variable
from the install command so the installed version follows Renovate's update.
Put the annotation immediately above the declaration.
`datasource` identifies the release source, and `depName` identifies the
dependency within that source.

Use a variable name ending in `_VERSION`. Plain assignments and `export`
assignments accept an unquoted value or a value in single or double quotes.
The assignment operators `=`, `:=`, and `?=` are supported. Use a literal
version rather than a variable reference or command substitution. LF and CRLF
line endings are supported for these assignments.

```sh
# renovate: datasource=github-releases depName=mikefarah/yq
export YQ_VERSION="v4.53.6"
```

Optional annotation fields follow `depName` in this order: `packageName` (or
`lookupName`), `versioning`, `extractVersion`, and `registryUrl`. Omit fields
that are not needed.

In a Dockerfile, use an unindented `ARG` or `ENV` with a literal value and a
name ending in `_VERSION`. Use LF line endings for Dockerfile annotations.
This example assumes the image has pip.

```dockerfile
# renovate: datasource=pypi depName=semgrep
ARG SEMGREP_VERSION=1.169.0
RUN pip install "semgrep==${SEMGREP_VERSION}"
```

For a GitHub release, `extractVersion` can remove the leading `v` from a tag.

```dockerfile
# renovate: datasource=github-releases depName=google/osv-scanner extractVersion=^v(?<version>.*)$
ARG OSV_SCANNER_VERSION=2.4.0
```

In a GitHub Actions workflow under `.github/workflows/`, use a literal value in
an `env` mapping and give the variable a name ending in `_VERSION`.

```yaml
env:
  # renovate: datasource=npm depName=pnpm
  PNPM_VERSION: 11.10.0
```

For a composite action, put the same `env` mapping on a step in `action.yml` or
`action.yaml`. See [environment variables for composite action steps](https://docs.github.com/en/actions/reference/workflows-and-actions/metadata-syntax#runsstepsenv).

In a `Makefile`, `GNUMakefile`, or `.mk` file, assign a literal value to a variable
with a name ending in `_VERSION`.

```makefile
# renovate: datasource=github-releases depName=mikefarah/yq
YQ_VERSION := v4.53.6
```

If the install command verifies a separate checksum, update that checksum when
you review the version PR and verify the download before merging.

See [Renovate's built-in annotation formats](https://docs.renovatebot.com/presets-customManagers/).

### Declare Terraform and TFLint versions

In `.tf` or `.tofu` files, use literal provider and registry module sources and
version constraints. For Git-sourced modules, use a release tag in the source
URL's `ref` parameter to track tagged releases. Tags from the generic Git
datasource can stay pending because it does not provide release timestamps.

Renovate uses the Terraform registry for sources without a registry address.
To use the OpenTofu registry, see [Renovate's registry configuration for OpenTofu](https://docs.renovatebot.com/modules/manager/terraform/#terraform-vs-opentofu).

Run `terraform init` for Terraform or `tofu init` for OpenTofu in each root
module. Commit the resulting `.terraform.lock.hcl`.
Renovate groups provider updates. It can update a provider within its constraint
by refreshing the lockfile, or propose a constraint change for an eligible
version outside that range. Weekly lockfile maintenance runs separately early
on Mondays. Both kinds of lockfile update require a committed lockfile.

For Terraform, use `required_version` to express CLI compatibility. To track
an exact Terraform CLI version, put a plain version in `.terraform-version`
and use a version selector that reads that file. For TFLint plugins, use a
literal `version` and a public GitHub `source` in the form
`github.com/owner/repository` in `.tflint.hcl`.

Review and manually merge native Terraform and TFLint updates. See the
[Terraform manager](https://docs.renovatebot.com/modules/manager/terraform/),
[Terraform version file manager](https://docs.renovatebot.com/modules/manager/terraform-version/),
and [TFLint plugin manager](https://docs.renovatebot.com/modules/manager/tflint-plugin/).

For a tool version declared in a `.tfvars` file, annotate a quoted value with
a variable name ending in `_version`. Set `versioning` to select a scheme
explicitly, as in this npm example.

```hcl
# renovate: datasource=npm depName=pnpm versioning=npm
pnpm_version = "11.10.0"
```

## Find a missing update

Check the dependency dashboard and Renovate logs for the affected dependency.
Confirm that Renovate can read the preset and is targeting the right branch.
For annotations, check the declaration syntax, variable suffix, and line
endings. Follow the field order shown in the examples. Renovate's file ignore
rules still apply to annotated declarations.

If you override `enabledManagers`, include `custom.regex` for annotation and
TypeScript base config updates and `custom.jsonata` for Biome schema updates.
The default preset already includes the matchers for these formats.

The Biome group normally waits for 2 eligible updates, so a lone schema update
can wait. Major Go module updates require approval in the dependency dashboard.

Regular updates must pass a seven-day release age check. A missing timestamp
can keep an update pending indefinitely. Debian packages and container images
can proceed without a timestamp, and the wait applies when one is available.
The preset also waives the age check for pins outside PyPI. Renovate bypasses
the wait for security updates. See [Renovate's release age checks](https://docs.renovatebot.com/key-concepts/minimum-release-age/).

## Protect lockfile resolutions

The release-age check on an update does not establish the age of every
transitive dependency selected when a package manager regenerates a lockfile.
Configure a cooldown in the consuming repository's package manager as well.
Extending this preset does not copy this repository's package-manager settings.

For pnpm 11, put the following in the consuming repository's
`pnpm-workspace.yaml`. The age is in minutes; `10080` is seven days. These
settings reject resolutions that have no eligible version or no publish
timestamp instead of allowing a newer or undated version.

```yaml
minimumReleaseAge: 10080
minimumReleaseAgeIgnoreMissingTime: false
minimumReleaseAgeStrict: true
```

See [pnpm's cooldown settings](https://pnpm.io/settings/dependency-resolution#minimumreleaseage).
Renovate can add a version-specific pnpm cooldown exception for a vulnerability
fix, allowing that fix to proceed without exempting future normal releases.

With Renovate `43.264.2`, npm receives a `--before` cutoff during lockfile
generation unless a `min-release-age` setting is already present in `.npmrc`.
If locked packages cannot satisfy that cutoff, Renovate can retry without it
and report a warning; review that warning before merging. The same Renovate
version does not pass its cooldown to pnpm, Yarn, Poetry, Pipenv, Cargo, Gradle,
or Terraform. Check each package manager's own support and configuration before
relying on lockfile maintenance to enforce a transitive cooldown.
