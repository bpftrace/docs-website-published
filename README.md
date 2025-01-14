# Docs Website

See https://github.com/bpftrace/website for instructions on working with a Docusaurus site.

## Directory Structure

The `docs` directory holds documentation for the in-development, unreleased bpftrace version. It should regularly pull in the docs from the bpftrace source repository.

The `versioned_docs` directory holds snapshots of the docs from each released version. The latest version should be duplicated as both `version-x.y` and `version-latest`, to facilitate permalinks.

## Updating Docs

1. Update the versioned documentation snapshots:
```
rm -rf versioned_docs/version-latest
cp -r docs versioned_docs/version-latest
cp -r docs versioned_docs/version-x.y
```

2. Add the new version to `versions.json`, directly underneath `"latest"`.
3. In `docusaurus.config.js`, update the version number in `config.presets.docs.versions` to refer to the new release.
