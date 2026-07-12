# Renovate Configuration

## Special Docker Versioning

Renovate doesn't know how to handle tool versioning that lives within dockerfiles.
To combat that, we've got a special configuration that will look for the tool version in the dockerfile and update it accordingly.

You can find it in the [docker](./docker.json) configuration.

It requires you to add a comment above the version argument in the dockerfile that Renovate can use to identify the tool and its version.

```dockerfile
# renovate: datasource=pypi depName=semgrep
ARG SEMGREP_VERSION=1.169.0
# renovate: datasource=github-releases depName=google/osv-scanner extractVersion=^v(?<version>.*)$
ARG OSV_SCANNER_VERSION=2.4.0
```
