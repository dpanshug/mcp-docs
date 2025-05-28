import * as fs from "fs-extra";
import * as path from "path";
import fg from "fast-glob";
import matter from "gray-matter";
import { marked } from "marked";
import chokidar, { type FSWatcher } from "chokidar";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import TurndownService from "turndown";

export interface DocumentationFile {
  path: string;
  name: string;
  description?: string;
  mimeType: string;
  lastModified: Date;
  content?: string;
  metadata?: Record<string, any>;
  isOnline?: boolean;
  url?: string;
}

export interface DocumentationSource {
  name: string;
  path: string;
  patterns: string[];
  isOnline?: boolean;
}

export interface OnlineDocumentationSource {
  name: string;
  url: string;
  refreshInterval?: number; // minutes
  lastFetched?: Date;
  contentType?: 'markdown' | 'html' | 'auto';
}

export interface SearchResult {
  file: DocumentationFile;
  matches: string[];
  score: number;
}

export class DocumentationManager {
  private sources: DocumentationSource[] = [];
  private onlineSources: OnlineDocumentationSource[] = [];
  private cache: Map<string, DocumentationFile> = new Map();
  private watchers: Map<string, FSWatcher> = new Map();
  private turndownService: TurndownService;
  private refreshTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });
    this.loadDefaultSources();
  }

  private async loadDefaultSources() {
    // Look for common documentation directories
    const commonPaths = [
      "./docs",
      "./documentation",
      "./README.md",
      "./doc",
      "./*.md",
      "./guides",
      "./wiki",
    ];

    for (const docPath of commonPaths) {
      try {
        const fullPath = path.resolve(docPath);
        if (await fs.pathExists(fullPath)) {
          const stat = await fs.stat(fullPath);
          if (stat.isDirectory()) {
            await this.addDocumentationSource(fullPath, path.basename(fullPath));
          } else if (docPath.endsWith(".md")) {
            // Single markdown file
            await this.indexFile(fullPath);
          }
        }
      } catch (error) {
        // Silently ignore missing paths
      }
    }
  }

  async addDocumentationSource(sourcePath: string, name: string): Promise<void> {
    const fullPath = path.resolve(sourcePath);
    
    if (!(await fs.pathExists(fullPath))) {
      throw new Error(`Documentation source does not exist: ${fullPath}`);
    }

    const stat = await fs.stat(fullPath);
    if (!stat.isDirectory()) {
      throw new Error(`Documentation source must be a directory: ${fullPath}`);
    }

    const source: DocumentationSource = {
      name,
      path: fullPath,
      patterns: [
        "**/*.md",
        "**/*.mdx", 
        "**/*.txt",
        "**/*.rst",
        "**/*.adoc",
      ],
      isOnline: false,
    };

    this.sources.push(source);
    await this.indexSource(source);
    this.watchSource(source);
  }

  async addOnlineDocumentationSource(
    url: string, 
    name: string, 
    options: {
      refreshInterval?: number;
      contentType?: 'markdown' | 'html' | 'auto';
    } = {}
  ): Promise<void> {
    const { refreshInterval = 60, contentType = 'auto' } = options;

    const onlineSource: OnlineDocumentationSource = {
      name,
      url,
      refreshInterval,
      contentType,
    };

    this.onlineSources.push(onlineSource);
    await this.fetchOnlineDocumentation(onlineSource);
    
    // Set up periodic refresh
    if (refreshInterval > 0) {
      const timer = setInterval(() => {
        this.fetchOnlineDocumentation(onlineSource).catch(console.error);
      }, refreshInterval * 60 * 1000);
      
      this.refreshTimers.set(url, timer);
    }
  }

  private async fetchOnlineDocumentation(source: OnlineDocumentationSource): Promise<void> {
    try {
      console.error(`Fetching online documentation: ${source.url}`);
      
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'Documentation-MCP-Server/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const rawContent = await response.text();
      
      let content: string;
      let detectedType: string;

      if (source.contentType === 'markdown' || 
          (source.contentType === 'auto' && contentType.includes('text/markdown'))) {
        content = rawContent;
        detectedType = 'markdown';
      } else if (contentType.includes('text/html') || source.contentType === 'html') {
        // Parse HTML and convert to markdown
        const $ = cheerio.load(rawContent);
        
        // Remove script and style elements
        $('script, style, nav, header, footer, .sidebar, .menu').remove();
        
        // Try to find main content area
        const mainContent = $('main, article, .content, .documentation, .docs, #content').first();
        const htmlContent = mainContent.length > 0 ? mainContent.html() : $('body').html();
        
        content = this.turndownService.turndown(htmlContent || '');
        detectedType = 'html->markdown';
      } else {
        // Treat as plain text
        content = rawContent;
        detectedType = 'text';
      }

      // Parse frontmatter if it exists
      const parsed = matter(content);
      
      const file: DocumentationFile = {
        path: source.url,
        name: source.name,
        mimeType: 'text/markdown',
        lastModified: new Date(),
        content: parsed.content,
        metadata: {
          ...parsed.data,
          source: 'online',
          originalUrl: source.url,
          fetchedAt: new Date().toISOString(),
          contentType: detectedType,
        },
        description: parsed.data.description || parsed.data.title || `Online documentation: ${source.name}`,
        isOnline: true,
        url: source.url,
      };

      this.cache.set(source.url, file);
      source.lastFetched = new Date();
      
      console.error(`Successfully fetched and indexed: ${source.name}`);
    } catch (error) {
      console.error(`Error fetching online documentation ${source.url}:`, error);
    }
  }

  async refreshOnlineDocumentation(url?: string): Promise<void> {
    if (url) {
      const source = this.onlineSources.find(s => s.url === url);
      if (source) {
        await this.fetchOnlineDocumentation(source);
      } else {
        throw new Error(`Online source not found: ${url}`);
      }
    } else {
      // Refresh all online sources
      for (const source of this.onlineSources) {
        await this.fetchOnlineDocumentation(source);
      }
    }
  }

  async removeOnlineDocumentationSource(url: string): Promise<void> {
    const index = this.onlineSources.findIndex(s => s.url === url);
    if (index === -1) {
      throw new Error(`Online source not found: ${url}`);
    }

    // Clear refresh timer
    const timer = this.refreshTimers.get(url);
    if (timer) {
      clearInterval(timer);
      this.refreshTimers.delete(url);
    }

    // Remove from sources and cache
    this.onlineSources.splice(index, 1);
    this.cache.delete(url);
  }

  private async indexSource(source: DocumentationSource): Promise<void> {
    const files = await fg(source.patterns, {
      cwd: source.path,
      absolute: true,
      ignore: ["**/node_modules/**", "**/.git/**"],
    });

    for (const filePath of files) {
      await this.indexFile(filePath);
    }
  }

  private async indexFile(filePath: string): Promise<void> {
    try {
      const stat = await fs.stat(filePath);
      const content = await fs.readFile(filePath, "utf-8");
      
      // Parse frontmatter if it exists
      const parsed = matter(content);
      
      const file: DocumentationFile = {
        path: filePath,
        name: path.basename(filePath),
        mimeType: this.getMimeType(filePath),
        lastModified: stat.mtime,
        content: parsed.content,
        metadata: parsed.data,
        description: parsed.data.description || parsed.data.title,
        isOnline: false,
      };

      this.cache.set(filePath, file);
    } catch (error) {
      console.error(`Error indexing file ${filePath}:`, error);
    }
  }

  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case ".md":
      case ".mdx":
        return "text/markdown";
      case ".txt":
        return "text/plain";
      case ".rst":
        return "text/x-rst";
      case ".adoc":
        return "text/asciidoc";
      default:
        return "text/plain";
    }
  }

  private watchSource(source: DocumentationSource): void {
    if (source.isOnline) return; // Don't watch online sources

    const watcher = chokidar.watch(source.patterns, {
      cwd: source.path,
      ignored: ["**/node_modules/**", "**/.git/**"],
      persistent: true,
    });

    watcher
      .on("add", (filePath: string) => this.indexFile(path.resolve(source.path, filePath)))
      .on("change", (filePath: string) => this.indexFile(path.resolve(source.path, filePath)))
      .on("unlink", (filePath: string) => this.cache.delete(path.resolve(source.path, filePath)));

    this.watchers.set(source.path, watcher);
  }

  async searchDocumentation(query: string, limit: number = 10): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(Boolean);

    for (const file of this.cache.values()) {
      if (!file.content) continue;

      const searchText = [
        file.name,
        file.description || "",
        file.content,
        Object.values(file.metadata || {}).join(" "),
      ].join(" ").toLowerCase();

      const matches: string[] = [];
      let score = 0;

      // Search for exact phrase
      if (searchText.includes(queryLower)) {
        matches.push(`Exact match: "${query}"`);
        score += 10;
      }

      // Search for individual words
      for (const word of queryWords) {
        if (searchText.includes(word)) {
          matches.push(`Contains: "${word}"`);
          score += 1;
        }
      }

      // Boost score for matches in title/description
      if (file.name.toLowerCase().includes(queryLower) || 
          (file.description && file.description.toLowerCase().includes(queryLower))) {
        score += 5;
      }

      // Boost score for online documentation (might be more current)
      if (file.isOnline) {
        score += 2;
      }

      if (score > 0) {
        results.push({ file, matches, score });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async getDocumentationContent(filePath: string): Promise<string> {
    const file = this.cache.get(path.resolve(filePath)) || this.cache.get(filePath);
    if (!file) {
      // Try to load file if not in cache (for local files)
      if (await fs.pathExists(filePath)) {
        await this.indexFile(path.resolve(filePath));
        const reloadedFile = this.cache.get(path.resolve(filePath));
        if (reloadedFile?.content) {
          return reloadedFile.content;
        }
      }
      throw new Error(`Documentation file not found: ${filePath}`);
    }

    return file.content || "";
  }

  async listDocumentationFiles(filter?: string): Promise<DocumentationFile[]> {
    let files = Array.from(this.cache.values());

    if (filter) {
      const pattern = new RegExp(filter.replace(/\*/g, ".*"), "i");
      files = files.filter(file => 
        pattern.test(file.path) || pattern.test(file.name) || pattern.test(file.url || '')
      );
    }

    return files.sort((a, b) => {
      // Sort online sources first, then by name
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  getOnlineSources(): OnlineDocumentationSource[] {
    return [...this.onlineSources];
  }

  dispose(): void {
    // Clear all refresh timers
    for (const timer of this.refreshTimers.values()) {
      clearInterval(timer);
    }
    this.refreshTimers.clear();

    // Close file watchers
    for (const watcher of this.watchers.values()) {
      watcher.close();
    }
    this.watchers.clear();
    this.cache.clear();
  }
} 