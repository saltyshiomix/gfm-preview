<a href="https://www.npmjs.com/package/gfm-preview"><img src="https://img.shields.io/npm/v/gfm-preview.svg"></a>
<a href="https://www.npmjs.com/package/gfm-preview"><img src="https://img.shields.io/npm/dt/gfm-preview.svg"></a>

## Usage

```bash
# install it
$ npm install --global gfm-preview

# preview your markdown
$ preview file.md

# preview with firefox
$ preview file.md --browser firefox

# preview with chrome on macOS
$ preview file.md --browser 'google chrome'

# preview with GitHub Enterprise API
$ preview file.md --github-api-url https://your-ghe-host:port/api/v3
```

## Feature

- Render your markdown with GitHub API
- Launch a local preview server (`http://localhost:4649`)
- Hot reload previews when detecting changes
- Close the server when the preview is closed
- Support GitHub Enterprise

## How to change default browser

The browser name is platform dependent. For example, Chrome is `google chrome` on macOS, `google-chrome` on Linux and `chrome` on Windows.

```bash
# with chrome on macOS
$ preview file.md --browser 'google chrome'

# with a custom executable
$ preview file.md --browser 'C:\\Program Files\\Mozilla Firefox\\firefox.exe'
```

## If you use GitHub Enterprise (GHE)

Add an alias to your `~./bashrc`:

```bash
alias preview='preview --github-api-url https://your-ghe-host:port/api/v3'
```

Then use it:

```bash
$ preview file.md
```
