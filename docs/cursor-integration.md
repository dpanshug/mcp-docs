---
title: Cursor Integration Guide
description: Step-by-step guide to integrate the MCP Docs server with Cursor IDE
tags: [cursor, integration, setup]
---

# Cursor Integration

How to set up the MCP Docs server with Cursor.

## Setup

Create `~/.cursor/mcp.json` in your home directory:

```json
{
  "mcpServers": {
    "documentation": {
      "command": "mcp-docs"
    }
  }
}
```

### If you built locally

Use the full path to the built file:

```json
{
  "mcpServers": {
    "documentation": {
      "command": "node",
      "args": ["/path/to/mcp-docs/build/index.js"]
    }
  }
}
```

## Usage

After setup, restart Cursor and you can ask:

- "Search my docs for authentication"
- "Add docs from https://example.com/api"
- "What documentation files do I have?"
- "Show me the getting started guide"

## Troubleshooting

**Server won't start?**
- Check the path in your config
- Make sure you installed with `npm install -g @dpanshug/mcp-docs`
- Try running `mcp-docs` in terminal to test

**Cursor won't connect?**
- Restart Cursor completely
- Check MCP settings in Cursor settings to see server status

**No docs found?**
- The server auto-finds docs in `./docs`, `./README.md`, etc.
- Add custom paths: "Add documentation source /my/docs with name 'My Docs'"

## Configuration Options

### Environment Variables
You can pass environment variables to customize behavior:

```json
{
  "mcpServers": {
    "documentation": {
      "command": "mcp-docs",
      "env": {
        "DEBUG": "true",
        "MAX_FILE_SIZE": "10MB"
      }
    }
  }
}
```

### Multiple Projects
For team projects, each project can have its own `.cursor/mcp.json`:

```
my-frontend-project/
├── .cursor/
│   └── mcp.json          ← Points to documentation server
├── src/
└── docs/

my-backend-project/
├── .cursor/
│   └── mcp.json          ← Same server, different project
├── api/
└── documentation/
```

## Advanced Usage

### Custom Documentation Paths
If your docs are in non-standard locations:

*"Add documentation source /path/to/my/custom/docs with name 'Custom Docs'"*

### Multiple Online Sources
Set up a comprehensive documentation environment:

```
"Add online documentation from https://docs.company.com with name 'Company Docs'"
"Add online documentation from https://api-docs.service.com with name 'Service API'"
"Add online documentation from https://github.com/team/wiki with name 'Team Wiki'"
```

### Refresh Management
- **Automatic**: Online docs refresh every 60 minutes by default
- **Manual**: *"Refresh online documentation"*
- **Selective**: *"Refresh online documentation for https://specific-url.com"* 