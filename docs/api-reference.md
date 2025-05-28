---
title: API Reference
description: Complete API reference for the documentation MCP server
tags: [api, reference]
---

# API Reference

This document describes all available tools and resources provided by the documentation MCP server.

## Tools

### search_documentation

Search through documentation files using keywords or queries.

**Parameters:**
- `query` (string, required): Search query to find relevant documentation
- `limit` (number, optional): Maximum number of results to return (default: 10)

**Example:**
```json
{
  "name": "search_documentation",
  "arguments": {
    "query": "getting started tutorial",
    "limit": 5
  }
}
```

### get_documentation_content

Get the full content of a specific documentation file or online URL.

**Parameters:**
- `file_path` (string, required): Path to the documentation file or URL

**Example:**
```json
{
  "name": "get_documentation_content",
  "arguments": {
    "file_path": "/path/to/docs/api-reference.md"
  }
}
```

### list_documentation_files

List all available documentation files (local and online).

**Parameters:**
- `filter` (string, optional): Optional filter pattern (e.g., '*.md', 'api/*')

**Example:**
```json
{
  "name": "list_documentation_files",
  "arguments": {
    "filter": "*.md"
  }
}
```

### add_documentation_source

Add a new local documentation source directory to monitor.

**Parameters:**
- `path` (string, required): Path to the documentation directory
- `name` (string, required): Name for this documentation source

**Example:**
```json
{
  "name": "add_documentation_source",
  "arguments": {
    "path": "/path/to/docs",
    "name": "Main Documentation"
  }
}
```

## Online Documentation Tools

### add_online_documentation

Add online documentation from a URL. Supports both HTML pages and Markdown files.

**Parameters:**
- `url` (string, required): URL to the online documentation
- `name` (string, required): Name for this online documentation source
- `refresh_interval` (number, optional): How often to refresh content in minutes (default: 60, 0 to disable)
- `content_type` (string, optional): Type of content - "auto", "html", or "markdown" (default: "auto")

**Example:**
```json
{
  "name": "add_online_documentation",
  "arguments": {
    "url": "https://docs.example.com/api",
    "name": "API Documentation",
    "refresh_interval": 30,
    "content_type": "html"
  }
}
```

**Supported URL Types:**
- **Markdown files**: Direct links to `.md` files (GitHub, GitLab, etc.)
- **HTML pages**: Documentation websites, GitHub Pages, etc.
- **Documentation sites**: GitBook, Notion, Confluence, etc.

### refresh_online_documentation

Manually refresh online documentation sources.

**Parameters:**
- `url` (string, optional): Specific URL to refresh (leave empty to refresh all)

**Example:**
```json
{
  "name": "refresh_online_documentation",
  "arguments": {
    "url": "https://docs.example.com/api"
  }
}
```

### remove_online_documentation

Remove an online documentation source.

**Parameters:**
- `url` (string, required): URL of the online documentation to remove

**Example:**
```json
{
  "name": "remove_online_documentation",
  "arguments": {
    "url": "https://docs.example.com/api"
  }
}
```

### list_online_sources

List all configured online documentation sources with their status.

**Parameters:** None

**Example:**
```json
{
  "name": "list_online_sources",
  "arguments": {}
}
```

## Resources

The server automatically exposes all documentation files as resources:
- **Local files**: URIs in the format `doc://file/path`
- **Online sources**: URIs using the original HTTP/HTTPS URLs

## Supported File Types

### Local Files
- Markdown (`.md`, `.mdx`)
- Plain text (`.txt`)
- reStructuredText (`.rst`)
- AsciiDoc (`.adoc`)

### Online Content
- **HTML pages**: Automatically converted to Markdown
- **Markdown files**: Used directly
- **Plain text**: Used as-is

## Features

### HTML Processing
When fetching HTML content, the server:
- Removes navigation, scripts, and styling elements
- Extracts main content areas (`main`, `article`, `.content`, etc.)
- Converts HTML to clean Markdown format
- Preserves formatting and structure

### Automatic Refresh
- Online sources are automatically refreshed based on configured intervals
- Default refresh interval is 60 minutes
- Can be disabled by setting refresh_interval to 0
- Manual refresh available via API

### Content Detection
- Automatic content type detection based on HTTP headers
- Fallback to manual content type specification
- Smart extraction of main content from HTML pages

### Search Enhancement
- Online documentation gets a slight score boost in search results
- Metadata includes fetch timestamps and source information
- Full-text search across all content types

All files support frontmatter metadata extraction for enhanced search capabilities. 