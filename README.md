# MCP Docs

A Model Context Protocol (MCP) server that provides seamless integration between your documentation and Cursor IDE, allowing AI assistants to access and search through both **local and online documentation** in real-time.

## 📦 Installation

```bash
npm install -g @dpanshug/mcp-docs
```

## Setup

Add this to your Cursor settings (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
      "documentation": {
        "command": "mcp-docs"
      }
  }
}
```

#### If cloned/built locally:
```json
{
  "mcpServers": {
      "documentation": {
        "command": "node",
        "args": ["/path/to/your/project/build/index.js"],
        "env": {}
      }
  }
}
```

## What it does

- Finds and indexes markdown files in common folders (`./docs`, `./README.md`, etc.)
- Lets you add online documentation from URLs
- Provides search across all your docs
- Watches for file changes and updates automatically

## Usage

Once configured, you can ask Cursor:

- "Search my docs for authentication examples"
- "Show me the getting started guide" 
- "Add docs from https://api.example.com/docs"
- "What documentation files do I have?"

## Adding online docs

```
"Add online documentation from https://docs.stripe.com/api with name 'Stripe API'"
```

The server will fetch the page, convert HTML to markdown, and make it searchable. You can set refresh intervals if the docs change frequently.

## Supported files

- Markdown (`.md`, `.mdx`)
- Plain text (`.txt`) 
- reStructuredText (`.rst`)
- AsciiDoc (`.adoc`)

## Development

```bash
git clone https://github.com/dpanshug/mcp-docs.git
cd mcp-docs
npm install
npm run build
```

## Why use this?

Honestly, you can just paste URLs directly to LLM and it works fine. This is mainly useful if:

- You have lots of local docs that change frequently
- You want to aggregate multiple documentation sources
- You're in an environment where you can't share URLs directly

## License

MIT License - see LICENSE file for details. 