# Documentation MCP Server

A Model Context Protocol (MCP) server that provides seamless integration between your documentation and Cursor IDE, allowing AI assistants to access and search through both **local and online documentation** in real-time.

## Features

- 🔍 **Real-time search**: Search through all documentation files using natural language queries
- 📁 **File monitoring**: Automatically updates when documentation files change
- 📄 **Multiple formats**: Supports Markdown, text, reStructuredText, and AsciiDoc files
- 🏷️ **Metadata support**: Extracts and uses frontmatter metadata for better search results
- 🌐 **Online documentation**: Fetch and index documentation from URLs (HTML pages, Markdown files)
- 🔄 **Auto-refresh**: Automatically refresh online documentation at configurable intervals
- 🔌 **Easy integration**: Simple setup with Cursor IDE

## Supported Documentation Sources

### Local Files
- `./docs/` - Main documentation folder
- `./README.md` - Project readme
- `./documentation/` - Alternative doc folder
- `./guides/` - Guides directory
- `./wiki/` - Wiki directory

### Online Sources
- **GitHub/GitLab**: Direct links to README and documentation files
- **Documentation websites**: HTML pages automatically converted to searchable text
- **Team wikis**: Notion, Confluence, GitBook pages
- **API documentation**: Swagger, Postman, vendor documentation sites
- **Service docs**: AWS, Google Cloud, third-party service documentation

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Server

```bash
npm run build
```

### 3. Configure Cursor

Add the following to your Cursor settings (usually found in `~/.cursor/config/settings.json`):

```json
{
  "mcp": {
    "servers": {
      "documentation": {
        "command": "node",
        "args": ["/path/to/your/project/build/index.js"],
        "env": {}
      }
    }
  }
}
```

### 4. Start Using

Once configured, you can use these capabilities in Cursor:

#### Local Documentation
- Search your documentation: "Search for information about API authentication"
- Get file contents: "Show me the content of the getting started guide"
- List available docs: "What documentation files are available?"

#### Online Documentation
- Add online docs: "Add online documentation from https://docs.stripe.com/api with name 'Stripe API'"
- Search across all sources: "Find payment processing examples"
- Refresh online content: "Refresh online documentation"
- Manage sources: "List all online documentation sources"

## Configuration

The server automatically detects common documentation directories and supports adding online sources on-demand.

### Adding Online Documentation

You can add online documentation sources in several ways:

```
# Add a GitHub README
"Add online documentation from https://raw.githubusercontent.com/user/repo/main/README.md with name 'Project README'"

# Add a documentation website with custom refresh interval
"Add online documentation from https://docs.example.com with name 'API Docs' with refresh interval 30 minutes"

# Add with specific content type
"Add online documentation from https://notion.site/page with name 'Team Wiki' with content type html"
```

### Refresh Settings
- **Default refresh**: 60 minutes
- **Custom intervals**: 5 minutes to several hours
- **Manual refresh**: Available via API
- **Disable refresh**: Set interval to 0

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

All files support frontmatter metadata extraction for enhanced search capabilities.

## Development

### Run in Development Mode

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

## Available Tools

The MCP server provides these tools for interacting with documentation:

### Local Documentation
- `search_documentation` - Search through all documentation
- `get_documentation_content` - Get content of specific files
- `list_documentation_files` - List all available files
- `add_documentation_source` - Add local documentation directories

### Online Documentation
- `add_online_documentation` - Add documentation from URLs
- `refresh_online_documentation` - Manually refresh online sources
- `remove_online_documentation` - Remove online sources
- `list_online_sources` - List configured online sources

## Examples

### Common Use Cases

```
# Multi-source search
"Find authentication examples" (searches local + online docs)

# Specific source queries  
"Show me the latest Stripe API documentation"

# Cross-reference information
"Compare our authentication with Auth0's recommendations"

# Stay up-to-date
"What's new in the AWS S3 documentation?"
```

### Popular Online Sources

- **API Documentation**: Stripe, AWS, Google Cloud, GitHub API
- **Framework Docs**: React, Vue, Angular official documentation  
- **Service Docs**: Auth0, Firebase, Vercel, Netlify
- **Team Resources**: Notion wikis, Confluence spaces, GitBook sites

## API Reference

See [docs/api-reference.md](./docs/api-reference.md) for complete API documentation.

## Architecture

The server consists of:

- **DocumentationManager**: Handles file indexing, searching, and monitoring
- **Online Documentation Handler**: Fetches, converts, and caches online content
- **MCP Server**: Provides the protocol interface for Cursor integration
- **File Watchers**: Real-time monitoring of local documentation changes
- **Auto-refresh System**: Periodic updates of online documentation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 