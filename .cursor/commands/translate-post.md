# Auto-translate blog post

## Purpose

Automatically translate a Korean markdown blog post into English to operate a multilingual blog.

## Workflow

1. **Read the Korean source**
   - Read `markdown/{post-id}/ko/content.mdx`
   - Read `markdown/{post-id}/ko/frontmatter.mdx`

2. **Generate English translation**
   - Translate all Korean text in content.mdx into natural English
   - Translate title, excerpt, and category fields in frontmatter.mdx into English
   - Keep code blocks and code comments as-is
   - Handle technical terms appropriately (e.g., "리액트" → "React")
   - Save to `markdown/{post-id}/en/content.mdx`
   - Save to `markdown/{post-id}/en/frontmatter.mdx`

## Translation guidelines

### General principles

- **Natural translation**: Use natural English expressions rather than literal translation
- **Technical terms**: Handle consistently
  - English terms: use as-is (React, TypeScript, Next.js)
- **Preserve code**: Do not translate code blocks, inline code, or file names
- **Markdown structure**: Keep markdown syntax (headings, lists, links, etc.) identical

### Frontmatter fields

```yaml
---
title: "translated title"
excerpt: "translated excerpt"
category: "translated category"
date: "2024-XX-XX" # do not change
author: "이승현" # do not change
header:
  teaser: "/images/..." # do not change
---
```

### Example

**Korean (ko/content.mdx)**:

```markdown
# 리액트 훅 완벽 가이드

리액트 훅은 함수형 컴포넌트에서 상태 관리를 가능하게 합니다.
//...

## useState 사용법

\`\`\`tsx
const [count, setCount] = useState(0);
\`\`\`
```

**English (en/content.mdx)**:

```markdown
# Complete Guide to React Hooks

React Hooks enable state management in functional components.

## How to Use useState

\`\`\`tsx
const [count, setCount] = useState(0);
\`\`\`
```

## How to use

When you run this prompt:

1. Reads the Korean source of the specified post ID
2. Translates it into English
3. Creates the files in the English folder

## Notes

- Back up the source files before translating
- Always review after translation to verify technical terms and context are correct
- Never change image paths or links
