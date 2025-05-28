---
title: Cursor Integration Guide
description: Step-by-step guide to integrate the MCP Docs server with Cursor IDE
tags: [cursor, integration, setup]
---

# Cursor Integration Guide

This guide shows you how to integrate the MCP Docs Server with Cursor IDE.

## Quick Setup

### Option 1: Project-Specific Configuration (Recommended)

Create a `.cursor/mcp.json` file **in your project** (not in this MCP server codebase):

```json
{
  "mcpServers": {
    "documentation": {
      "command": "mcp-docs",
      "env": {}
    }
  }
}
```

**Benefits:**
- Project-specific configuration
- Team members get the same setup
- Can be version controlled
- Works with relative paths

### Option 2: Global Configuration

Add to your Cursor settings file (`~/.cursor/config/settings.json`):

```json
{
  "mcp": {
    "servers": {
      "documentation": {
        "command": "mcp-docs",
        "env": {}
      }
    }
  }
}
```

**Benefits:**
- Available in all projects
- Single configuration

## Detailed Setup Steps

### 1. Install the MCP Server

```bash
# Install globally via npm
npm install -g mcp-docs

# Or clone and build for development
git clone https://github.com/dpanshug/mcp-docs.git
cd mcp-docs
npm install
npm run build
```

### 2. Choose Your Configuration Method

#### Project-Specific Setup (If installed via npm)

1. **In your actual project** (not this MCP server folder), create `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "documentation": {
      "command": "mcp-docs",
      "env": {}
    }
  }
}
```

#### Project-Specific Setup (If cloned/built locally)

```json
{
  "mcpServers": {
    "documentation": {
      "command": "node",
      "args": ["/full/path/to/mcp-docs/build/index.js"],
      "env": {}
    }
  }
}
```

2. **Replace** `/full/path/to/mcp-docs/` with the actual path where you installed this MCP server.

#### Global Setup (If installed via npm)

1. Find your Cursor config file:
   - **macOS**: `~/.cursor/config/settings.json`
   - **Linux**: `~/.config/cursor/settings.json`  
   - **Windows**: `%APPDATA%\cursor\settings.json`

2. Add the MCP configuration:

```json
{
  "mcp": {
    "servers": {
      "documentation": {
        "command": "mcp-docs",
        "env": {}
      }
    }
  }
}
```

#### Global Setup (If cloned/built locally)

```json
{
  "mcp": {
    "servers": {
      "documentation": {
        "command": "node",
        "args": ["/full/path/to/mcp-docs/build/index.js"],
        "env": {}
      }
    }
  }
}
```

### 3. Restart Cursor

Close and reopen Cursor completely for the changes to take effect.

## Usage Examples

Once configured, you can ask Cursor:

### Local Documentation
- *"Search for API authentication information"*
- *"What documentation files are available?"*
- *"Show me the content of the getting started guide"*

### Online Documentation
- *"Add online documentation from https://docs.stripe.com/api with name 'Stripe API'"*
- *"Add GitHub README from https://raw.githubusercontent.com/user/repo/main/README.md"*
- *"Refresh online documentation"*

### Cross-Source Search
- *"Find information about payment processing"* (searches both local and online docs)
- *"Show me the latest API changes"*
- *"Compare our authentication with industry standards"*

## Troubleshooting

### Server Not Starting
1. **Check the path** in your configuration file
2. **Verify the build** exists (if using local build): `ls /path/to/mcp-docs/build/index.js`
3. **Test manually** (if using local build): `node /path/to/mcp-docs/build/index.js`
4. **Check npm installation** (if using npm): `which mcp-docs`

### Cursor Not Connecting
1. **Restart Cursor** completely
2. **Check Developer Console** (`Cmd+Option+I` / `Ctrl+Shift+I`)
3. **Look for MCP errors** in the console

### No Documentation Found
- The server automatically finds docs in common locations
- Add your documentation directories manually: *"Add documentation source /path/to/docs with name 'My Docs'"*

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