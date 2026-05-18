# Contributing to Joyonway Frame Analyzer

Thanks for considering a contribution. This project is small and community-driven.

## Quick paths

- **Have a new controller (P25B85, P20B29, etc.)?** Open an issue with the `new-controller` template and attach a capture.
- **Decoded a byte mapping?** Open an issue with the `capture-analysis` template.
- **Found a bug?** Open an issue with the `bug` template.
- **Want to propose code changes?** Read the section below.

## Code contributions

This is a single-file HTML app on purpose: easy to fork, easy to host locally, no build step. Please keep contributions in that spirit.

### Workflow

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Make your changes in `docs/index.html`
4. Test locally: open `docs/index.html` directly in your browser
5. Open a Pull Request describing what you changed and why

### Code style

- No build step, no bundler, no framework — pure HTML/CSS/JS
- ES2017+ is fine (async/await, const/let, template literals)
- 2-space indentation
- No external runtime dependencies
- All UI text in English

### Adding a new controller preset

Edit the `FORMATS` object near the top of the script section in `docs/index.html`:

```javascript
yourModel: {
  name: 'YourModel / Vendor',
  delimiter: 0xXX,
  delimiterStart: 0xXX,
  delimiterEnd: 0xXX,
  useUnescape: true,
  maxFrameLen: 256,
  srcOffset: 1,
  cmdOffset: 4,
  info: 'Description, source of decoding, credits',
},
```

Include at least:
- A reference capture file in the PR description
- Credits to the person(s) who decoded the format
- At least 50 frames captured to confirm the format is stable

## Review process

I (KnapTheBuilder) review all PRs personally. Expect a few days of latency since this is a side project.

## What I won't accept

- PRs that add runtime dependencies (jQuery, React, build tools, npm)
- PRs that fundamentally change the architecture without prior discussion
- PRs that strip credits from existing contributors

## Code of conduct

Be kind. Reverse engineering is a niche topic, beginners are welcome. Snark and gatekeeping are not.
