#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPServerTester {
  constructor() {
    this.serverProcess = null;
    this.testResults = [];
    this.currentRequestId = 1;
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toLocaleTimeString();
    const icon = {
      'INFO': '📋',
      'SUCCESS': '✅',
      'ERROR': '❌',
      'WARN': '⚠️',
      'TEST': '🧪'
    }[type] || '📋';
    
    console.log(`${icon} [${timestamp}] ${message}`);
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      const serverPath = path.join(__dirname, 'build', 'index.js');
      this.log(`Starting MCP server: ${serverPath}`);
      
      this.serverProcess = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let serverReady = false;

      this.serverProcess.stderr.on('data', (data) => {
        const message = data.toString().trim();
        if (message.includes('MCP Docs server running on stdio')) {
          this.log('Server started successfully', 'SUCCESS');
          serverReady = true;
          resolve();
        }
      });

      this.serverProcess.on('error', (error) => {
        this.log(`Server error: ${error.message}`, 'ERROR');
        reject(error);
      });

      // Timeout if server doesn't start in 5 seconds
      setTimeout(() => {
        if (!serverReady) {
          this.log('Server startup timeout', 'ERROR');
          reject(new Error('Server startup timeout'));
        }
      }, 5000);
    });
  }

  async sendMCPRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        id: this.currentRequestId++,
        method,
        params
      };

      const requestStr = JSON.stringify(request) + '\n';
      
      let responseBuffer = '';
      let responseReceived = false;

      const onData = (data) => {
        responseBuffer += data.toString();
        
        // Look for complete JSON response
        const lines = responseBuffer.split('\n');
        for (const line of lines) {
          if (line.trim() && !responseReceived) {
            try {
              const response = JSON.parse(line);
              if (response.id === request.id) {
                responseReceived = true;
                this.serverProcess.stdout.removeListener('data', onData);
                resolve(response);
                return;
              }
            } catch (e) {
              // Not a complete JSON line yet, continue
            }
          }
        }
      };

      this.serverProcess.stdout.on('data', onData);
      
      // Send request
      this.serverProcess.stdin.write(requestStr);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!responseReceived) {
          this.serverProcess.stdout.removeListener('data', onData);
          reject(new Error(`Request timeout for ${method}`));
        }
      }, 10000);
    });
  }

  async runTest(testName, testFn) {
    this.log(`Running test: ${testName}`, 'TEST');
    try {
      await testFn();
      this.testResults.push({ name: testName, status: 'PASS' });
      this.log(`✓ ${testName}`, 'SUCCESS');
    } catch (error) {
      this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
      this.log(`✗ ${testName}: ${error.message}`, 'ERROR');
    }
  }

  async testListTools() {
    const response = await this.sendMCPRequest('tools/list');
    
    if (response.error) {
      throw new Error(`MCP Error: ${response.error.message}`);
    }

    const tools = response.result.tools;
    const expectedTools = [
      'search_documentation',
      'get_documentation_content', 
      'list_documentation_files',
      'add_documentation_source',
      'add_online_documentation',
      'refresh_online_documentation',
      'remove_online_documentation',
      'list_online_sources'
    ];

    const actualToolNames = tools.map(tool => tool.name);
    
    for (const expectedTool of expectedTools) {
      if (!actualToolNames.includes(expectedTool)) {
        throw new Error(`Missing tool: ${expectedTool}`);
      }
    }

    this.log(`Found ${tools.length} tools: ${actualToolNames.join(', ')}`);
  }

  async testListResources() {
    const response = await this.sendMCPRequest('resources/list');
    
    if (response.error) {
      throw new Error(`MCP Error: ${response.error.message}`);
    }

    const resources = response.result.resources;
    this.log(`Found ${resources.length} documentation resources`);
    
    // Should have at least some local documentation files
    if (resources.length === 0) {
      this.log('Warning: No documentation resources found', 'WARN');
    }
  }

  async testSearchDocumentation() {
    const response = await this.sendMCPRequest('tools/call', {
      name: 'search_documentation',
      arguments: {
        query: 'documentation',
        limit: 5
      }
    });
    
    if (response.error) {
      throw new Error(`MCP Error: ${response.error.message}`);
    }

    const results = JSON.parse(response.result.content[0].text);
    this.log(`Search returned ${results.length} results`);
    
    if (results.length === 0) {
      this.log('Warning: Search returned no results', 'WARN');
    }
  }

  async testListDocumentationFiles() {
    const response = await this.sendMCPRequest('tools/call', {
      name: 'list_documentation_files',
      arguments: {}
    });
    
    if (response.error) {
      throw new Error(`MCP Error: ${response.error.message}`);
    }

    const files = JSON.parse(response.result.content[0].text);
    this.log(`Found ${files.length} documentation files`);
    
    // Check for local and online file differentiation
    const localFiles = files.filter(f => !f.isOnline);
    const onlineFiles = files.filter(f => f.isOnline);
    
    this.log(`Local files: ${localFiles.length}, Online files: ${onlineFiles.length}`);
  }

  async testOnlineDocumentationWorkflow() {
    // Test adding online documentation
    this.log('Testing online documentation workflow...');
    
    // Add a simple online source (httpbin for testing)
    const addResponse = await this.sendMCPRequest('tools/call', {
      name: 'add_online_documentation',
      arguments: {
        url: 'https://httpbin.org/html',
        name: 'Test HTML Page',
        refresh_interval: 0, // Disable auto-refresh for testing
        content_type: 'html'
      }
    });

    if (addResponse.error) {
      throw new Error(`Failed to add online documentation: ${addResponse.error.message}`);
    }

    this.log('✓ Added online documentation source');

    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // List online sources
    const listResponse = await this.sendMCPRequest('tools/call', {
      name: 'list_online_sources',
      arguments: {}
    });

    if (listResponse.error) {
      throw new Error(`Failed to list online sources: ${listResponse.error.message}`);
    }

    const sources = JSON.parse(listResponse.result.content[0].text);
    if (sources.length === 0) {
      throw new Error('No online sources found after adding one');
    }

    this.log(`✓ Found ${sources.length} online sources`);

    // Test getting content
    const contentResponse = await this.sendMCPRequest('tools/call', {
      name: 'get_documentation_content',
      arguments: {
        file_path: 'https://httpbin.org/html'
      }
    });

    if (contentResponse.error) {
      throw new Error(`Failed to get online content: ${contentResponse.error.message}`);
    }

    const content = contentResponse.result.content[0].text;
    if (!content || content.length < 10) {
      throw new Error('Online content appears to be empty or too short');
    }

    this.log('✓ Successfully retrieved online documentation content');

    // Clean up - remove the test source
    const removeResponse = await this.sendMCPRequest('tools/call', {
      name: 'remove_online_documentation',
      arguments: {
        url: 'https://httpbin.org/html'
      }
    });

    if (removeResponse.error) {
      this.log(`Warning: Failed to clean up test source: ${removeResponse.error.message}`, 'WARN');
    } else {
      this.log('✓ Cleaned up test online documentation source');
    }
  }

  async testErrorHandling() {
    // Test with invalid tool call
    const response = await this.sendMCPRequest('tools/call', {
      name: 'nonexistent_tool',
      arguments: {}
    });

    if (!response.error && !response.result.isError) {
      throw new Error('Expected error for nonexistent tool, but got success');
    }

    this.log('✓ Error handling works correctly');
  }

  async runAllTests() {
    this.log('Starting MCP Server Test Suite', 'TEST');
    
    try {
      await this.startServer();
      
      // Wait a moment for server to be fully ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      await this.runTest('List Tools', () => this.testListTools());
      await this.runTest('List Resources', () => this.testListResources());
      await this.runTest('Search Documentation', () => this.testSearchDocumentation());
      await this.runTest('List Documentation Files', () => this.testListDocumentationFiles());
      await this.runTest('Online Documentation Workflow', () => this.testOnlineDocumentationWorkflow());
      await this.runTest('Error Handling', () => this.testErrorHandling());

    } catch (error) {
      this.log(`Test suite setup failed: ${error.message}`, 'ERROR');
    } finally {
      await this.cleanup();
      this.printResults();
    }
  }

  async cleanup() {
    if (this.serverProcess) {
      this.log('Shutting down server...');
      this.serverProcess.kill('SIGTERM');
      
      // Wait for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!this.serverProcess.killed) {
        this.log('Force killing server...', 'WARN');
        this.serverProcess.kill('SIGKILL');
      }
    }
  }

  printResults() {
    this.log('\n=== TEST RESULTS ===', 'TEST');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    this.testResults.forEach(result => {
      const status = result.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
      this.log(`${status}: ${result.name}`);
      if (result.error) {
        this.log(`   Error: ${result.error}`, 'ERROR');
      }
    });
    
    this.log('\n=== SUMMARY ===', 'TEST');
    this.log(`Total tests: ${this.testResults.length}`);
    this.log(`Passed: ${passed}`, passed === this.testResults.length ? 'SUCCESS' : 'INFO');
    this.log(`Failed: ${failed}`, failed > 0 ? 'ERROR' : 'INFO');
    
    if (failed === 0) {
      this.log('🎉 All tests passed!', 'SUCCESS');
      process.exit(0);
    } else {
      this.log('💥 Some tests failed!', 'ERROR');
      process.exit(1);
    }
  }
}

// Run the tests
const tester = new MCPServerTester();
tester.runAllTests().catch(error => {
  console.error('❌ Test suite crashed:', error);
  process.exit(1);
}); 