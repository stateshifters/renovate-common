# Renovate Configuration

## Special Versioning Annotations

We're using all of [Renovate's special versioning annotations](https://docs.renovatebot.com/presets-customManagers/).

It requires you to add a comment above the version argument in files, so that Renovate can use to identify the tool and its version.

For example, this is how we specify the version of `semgrep` and `osv-scanner` in our Dockerfile:

```dockerfile
# renovate: datasource=pypi depName=semgrep
ARG SEMGREP_VERSION=1.169.0
# renovate: datasource=github-releases depName=google/osv-scanner extractVersion=^v(?<version>.*)$
ARG OSV_SCANNER_VERSION=2.4.0
```
