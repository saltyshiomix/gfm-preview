<a href="https://www.npmjs.com/package/gfm-preview"><img src="https://img.shields.io/npm/v/gfm-preview.svg"></a>
<a href="https://www.npmjs.com/package/gfm-preview"><img src="https://img.shields.io/npm/dt/gfm-preview.svg"></a>

## Usage

```bash
# install it
$ npm install --global gfm-preview

# preview your markdown
$ preview sample.md
```

Then, `gfm-preview` automatically launches `http://localhost:4649` in your default browser.

## Feature

- Preview your markdown with GitHub API
- Hot reload previews when detecting changes
- Close process when the preview is closed
- Support GitHub Enterprise

## Usage on GitHub Enterprise (GHE)

```bash
$ preview file.md --github-api-url <https://your-ghe-host:port/api/v3>
```

Or use alias:

```bash
# ~./bash_rc
alias preview='preview --github-api-url <https://your-ghe-host:port/api/v3>'
```
