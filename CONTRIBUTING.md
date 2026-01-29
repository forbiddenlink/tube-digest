# Contributing to TubeDigest

Thank you for your interest in contributing to TubeDigest! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards others

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior**
- **Actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, browser, Node version)
- **Console errors** if any

Use this template:

```markdown
**Bug Description:**
A clear description of what the bug is.

**To Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
What you expected to happen.

**Actual Behavior:**
What actually happened.

**Environment:**
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120]
- Node: [e.g., 18.17.0]

**Console Errors:**
```
Paste errors here
```

**Screenshots:**
Add screenshots if applicable.
```

### Suggesting Features

Feature suggestions are welcome! Please include:

- **Clear use case** - Why is this feature needed?
- **Detailed description** - What should it do?
- **Alternatives considered** - Other ways to achieve this?
- **Additional context** - Mockups, examples, etc.

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/tubedigest.git
   cd tubedigest
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

3. **Make your changes**
   - Write clear, commented code
   - Follow existing code style
   - Add tests if applicable
   - Update documentation

4. **Test your changes**
   ```bash
   npm run dev
   # Test all affected features
   npm run build
   # Ensure build succeeds
   ```

5. **Commit with clear messages**
   ```bash
   git add .
   git commit -m "feat: add ability to export summaries to PDF"
   # or
   git commit -m "fix: resolve issue with mind map rendering"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   
   Then create a pull request on GitHub with:
   - Clear title and description
   - Link to related issues
   - Screenshots/videos if UI changes
   - Checklist of what was changed

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Anthropic API key
- Supabase account

### Installation

1. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/tubedigest.git
   cd tubedigest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.local.example .env.local
   # Add your API keys
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to http://localhost:3000

## Code Style Guidelines

### TypeScript
- Use TypeScript for all new files
- Define interfaces for data structures
- Avoid `any` types when possible
- Use meaningful variable names

### React Components
- Use functional components with hooks
- Keep components focused and small
- Extract reusable logic into custom hooks
- Use proper prop types

### File Organization
```
src/
├── app/           # Next.js pages and API routes
├── components/    # Reusable React components
├── lib/           # Utility functions and configs
└── types/         # TypeScript type definitions
```

### Naming Conventions
- **Files**: `kebab-case.tsx`
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types**: `PascalCase`

### Code Formatting
- Use Prettier for formatting (auto-formats on save)
- 2 spaces for indentation
- Single quotes for strings
- Trailing commas in objects/arrays

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Examples:
```bash
feat: add PDF export functionality
fix: resolve mind map rendering issue on mobile
docs: update README with new features
style: format code with Prettier
refactor: extract topic parsing into separate function
test: add tests for summarization API
chore: update dependencies
```

## Testing

### Manual Testing
- Test all features affected by your changes
- Check on different browsers (Chrome, Firefox, Safari)
- Test on mobile viewports
- Verify dark mode works

### Automated Testing (Future)
We plan to add:
- Unit tests with Jest
- Component tests with React Testing Library
- E2E tests with Playwright

## Documentation

When adding features:
- Update README.md if user-facing
- Add JSDoc comments to functions
- Update relevant documentation in `/docs`
- Include code examples

## Review Process

1. **Submit PR** - Create pull request with clear description
2. **Automated checks** - Ensure build passes
3. **Code review** - Maintainer reviews code
4. **Requested changes** - Make any requested updates
5. **Approval** - PR is approved
6. **Merge** - PR is merged into main

## Getting Help

- **Documentation**: Check `/docs` folder
- **Issues**: Search existing issues
- **Discussions**: Start a GitHub discussion
- **Questions**: Open an issue with "question" label

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Thanked in the README

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to TubeDigest! 🎉
