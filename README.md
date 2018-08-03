<a href="https://www.npmjs.com/package/gfm-preview"><img src="https://img.shields.io/npm/v/gfm-preview.svg"></a>
<a href="https://www.npmjs.com/package/gfm-preview"><img src="https://img.shields.io/npm/dt/gfm-preview.svg"></a>

## Usage

```bash
# install it
$ npm install --global gfm-preview

# preview your markdown
$ preview file.md
```

Then, `gfm-preview` automatically launches `http://localhost:4649` in your default browser.

## Feature

- Render your markdown with GitHub API
- Launch a preview server
- Hot reload previews when detecting changes
- Close the server when the preview is closed
- Support GitHub Enterprise

## If you use GitHub Enterprise (GHE)

```bash
$ preview file.md --github-api-url https://your-ghe-host:port/api/v3
```

Or use alias:

```bash
# ~./bashrc
alias preview='preview --github-api-url https://your-ghe-host:port/api/v3'
```
