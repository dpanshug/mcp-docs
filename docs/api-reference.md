---
title: API Reference
description: Complete API reference for the MCP Docs server
tags: [api, reference]
---

# API Reference

MCP tools available in the docs server.

## Local Documentation

### search_documentation
Search through all your docs.

- `query` (string): What to search for
- `limit` (number, optional): Max results (default: 10)

### get_documentation_content
Get the full content of a specific file.

- `file_path` (string): Path to the file or URL

### list_documentation_files
List all available documentation files.

- `filter` (string, optional): Filter pattern like `*.md`

### add_documentation_source
Add a local docs directory.

- `path` (string): Path to directory
- `name` (string): Name for this source

## Online Documentation

### add_online_documentation
Fetch docs from a URL.

- `url` (string): URL to fetch from
- `name` (string): Name for this source
- `refresh_interval` (number, optional): Minutes between refreshes (default: 60)
- `content_type` (string, optional): "auto", "html", or "markdown"

### refresh_online_documentation
Manually refresh online docs.

- `url` (string, optional): Specific URL to refresh (empty = all)

### remove_online_documentation
Remove an online source.

- `url` (string): URL to remove

### list_online_sources
List all online sources and their status.

No parameters.

## Supported Files

**Local:**
- Markdown (`.md`, `.mdx`)
- Text (`.txt`)
- reStructuredText (`.rst`)
- AsciiDoc (`.adoc`)

**Online:**
- HTML pages (converted to markdown)
- Markdown files
- Plain text 