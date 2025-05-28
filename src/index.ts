#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { DocumentationManager, type DocumentationFile } from "./documentation-manager.js";

class DocumentationMCPServer {
  private server: Server;
  private documentationManager: DocumentationManager;

  constructor() {
    this.server = new Server(
      {
        name: "mcp-docs",
        version: "1.0.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.documentationManager = new DocumentationManager();
    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "search_documentation",
            description: "Search through documentation files using keywords or queries",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Search query to find relevant documentation",
                },
                limit: {
                  type: "number",
                  description: "Maximum number of results to return (default: 10)",
                  default: 10,
                },
              },
              required: ["query"],
            },
          },
          {
            name: "get_documentation_content",
            description: "Get the full content of a specific documentation file",
            inputSchema: {
              type: "object",
              properties: {
                file_path: {
                  type: "string",
                  description: "Path to the documentation file or URL",
                },
              },
              required: ["file_path"],
            },
          },
          {
            name: "list_documentation_files",
            description: "List all available documentation files",
            inputSchema: {
              type: "object",
              properties: {
                filter: {
                  type: "string",
                  description: "Optional filter pattern (e.g., '*.md', 'api/*')",
                },
              },
            },
          },
          {
            name: "add_documentation_source",
            description: "Add a new documentation source directory to monitor",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "Path to the documentation directory",
                },
                name: {
                  type: "string",
                  description: "Name for this documentation source",
                },
              },
              required: ["path", "name"],
            },
          },
          {
            name: "add_online_documentation",
            description: "Add online documentation from a URL (supports HTML and Markdown)",
            inputSchema: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "URL to the online documentation",
                },
                name: {
                  type: "string",
                  description: "Name for this online documentation source",
                },
                refresh_interval: {
                  type: "number",
                  description: "How often to refresh content in minutes (default: 60, 0 to disable)",
                  default: 60,
                },
                content_type: {
                  type: "string",
                  enum: ["auto", "html", "markdown"],
                  description: "Type of content to expect (auto-detect if not specified)",
                  default: "auto",
                },
              },
              required: ["url", "name"],
            },
          },
          {
            name: "refresh_online_documentation",
            description: "Manually refresh online documentation sources",
            inputSchema: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "Specific URL to refresh (leave empty to refresh all)",
                },
              },
            },
          },
          {
            name: "remove_online_documentation",
            description: "Remove an online documentation source",
            inputSchema: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "URL of the online documentation to remove",
                },
              },
              required: ["url"],
            },
          },
          {
            name: "list_online_sources",
            description: "List all configured online documentation sources",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "search_documentation":
            if (!args?.query) {
              throw new Error("Missing required parameter: query");
            }
            const searchResults = await this.documentationManager.searchDocumentation(
              args.query as string,
              (args.limit as number) || 10
            );
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(searchResults, null, 2),
                },
              ],
            };

          case "get_documentation_content":
            if (!args?.file_path) {
              throw new Error("Missing required parameter: file_path");
            }
            const content = await this.documentationManager.getDocumentationContent(
              args.file_path as string
            );
            return {
              content: [
                {
                  type: "text",
                  text: content,
                },
              ],
            };

          case "list_documentation_files":
            const files = await this.documentationManager.listDocumentationFiles(
              args?.filter as string
            );
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(files, null, 2),
                },
              ],
            };

          case "add_documentation_source":
            if (!args?.path || !args?.name) {
              throw new Error("Missing required parameters: path and name");
            }
            await this.documentationManager.addDocumentationSource(
              args.path as string,
              args.name as string
            );
            return {
              content: [
                {
                  type: "text",
                  text: `Successfully added documentation source: ${args.name} at ${args.path}`,
                },
              ],
            };

          case "add_online_documentation":
            if (!args?.url || !args?.name) {
              throw new Error("Missing required parameters: url and name");
            }
            await this.documentationManager.addOnlineDocumentationSource(
              args.url as string,
              args.name as string,
              {
                refreshInterval: (args.refresh_interval as number) || 60,
                contentType: (args.content_type as 'auto' | 'html' | 'markdown') || 'auto',
              }
            );
            return {
              content: [
                {
                  type: "text",
                  text: `Successfully added online documentation: ${args.name} from ${args.url}`,
                },
              ],
            };

          case "refresh_online_documentation":
            await this.documentationManager.refreshOnlineDocumentation(
              args?.url as string
            );
            return {
              content: [
                {
                  type: "text",
                  text: args?.url 
                    ? `Refreshed online documentation: ${args.url}`
                    : "Refreshed all online documentation sources",
                },
              ],
            };

          case "remove_online_documentation":
            if (!args?.url) {
              throw new Error("Missing required parameter: url");
            }
            await this.documentationManager.removeOnlineDocumentationSource(
              args.url as string
            );
            return {
              content: [
                {
                  type: "text",
                  text: `Removed online documentation source: ${args.url}`,
                },
              ],
            };

          case "list_online_sources":
            const onlineSources = this.documentationManager.getOnlineSources();
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(onlineSources, null, 2),
                },
              ],
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const files = await this.documentationManager.listDocumentationFiles();
      return {
        resources: files.map((file: DocumentationFile) => ({
          uri: file.isOnline ? file.url! : `doc://${file.path}`,
          name: file.name,
          description: file.description || `Documentation file: ${file.name}`,
          mimeType: file.mimeType,
        })),
      };
    });

    // Read resource content
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;
      
      let filePath: string;
      if (uri.startsWith("doc://")) {
        filePath = uri.slice(6); // Remove "doc://" prefix
      } else if (uri.startsWith("http://") || uri.startsWith("https://")) {
        filePath = uri; // Use URL as-is for online sources
      } else {
        throw new Error(`Unsupported URI scheme: ${uri}`);
      }

      const content = await this.documentationManager.getDocumentationContent(filePath);

      return {
        contents: [
          {
            uri,
            mimeType: "text/plain",
            text: content,
          },
        ],
      };
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("MCP Docs server running on stdio");
  }
}

const server = new DocumentationMCPServer();
server.run().catch(console.error); 