#!/usr/bin/env node

import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MCPRequest {
  jsonrpc: string;
  id: number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: { message: string };
}

let serverProcess: ChildProcess | null = null;
let requestId = 1;

function log(message: string) {
  console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
}

async function startServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    const serverPath = path.join(__dirname, 'build', 'index.js');
    log(`Starting server: ${serverPath}`);
    
    serverProcess = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let started = false;

    serverProcess.stderr?.on('data', (data) => {
      const message = data.toString().trim();
      if (message.includes('MCP Docs server running on stdio')) {
        log('Server started');
        started = true;
        resolve();
      }
    });

    serverProcess.on('error', (error) => {
      log(`Server error: ${error.message}`);
      reject(error);
    });

    setTimeout(() => {
      if (!started) {
        reject(new Error('Server timeout'));
      }
    }, 5000);
  });
}

async function sendRequest(method: string, params?: any): Promise<MCPResponse> {
  return new Promise((resolve, reject) => {
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id: requestId++,
      method,
      params
    };

    const requestStr = JSON.stringify(request) + '\n';
    let responseBuffer = '';
    let received = false;

    const onData = (data: Buffer) => {
      responseBuffer += data.toString();
      
      const lines = responseBuffer.split('\n');
      for (const line of lines) {
        if (line.trim() && !received) {
          try {
            const response = JSON.parse(line);
            if (response.id === request.id) {
              received = true;
              serverProcess?.stdout?.removeListener('data', onData);
              resolve(response);
              return;
            }
          } catch (e) {
            // Not complete JSON yet
          }
        }
      }
    };

    serverProcess?.stdout?.on('data', onData);
    serverProcess?.stdin?.write(requestStr);

    setTimeout(() => {
      if (!received) {
        serverProcess?.stdout?.removeListener('data', onData);
        reject(new Error(`Timeout: ${method}`));
      }
    }, 10000);
  });
}

async function testListTools() {
  log('Testing list tools...');
  const response = await sendRequest('tools/list');
  
  if (response.error) {
    throw new Error(response.error.message);
  }

  const tools = response.result.tools;
  const expected = [
    'search_documentation',
    'get_documentation_content', 
    'list_documentation_files',
    'add_documentation_source',
    'add_online_documentation',
    'refresh_online_documentation',
    'remove_online_documentation',
    'list_online_sources'
  ];

  const actual = tools.map((t: any) => t.name);
  
  for (const tool of expected) {
    if (!actual.includes(tool)) {
      throw new Error(`Missing tool: ${tool}`);
    }
  }

  log(`Found ${tools.length} tools`);
}

async function testSearch() {
  log('Testing search...');
  const response = await sendRequest('tools/call', {
    name: 'search_documentation',
    arguments: { query: 'documentation', limit: 5 }
  });
  
  if (response.error) {
    throw new Error(response.error.message);
  }

  const results = JSON.parse(response.result.content[0].text);
  log(`Search found ${results.length} results`);
}

async function testListFiles() {
  log('Testing list files...');
  const response = await sendRequest('tools/call', {
    name: 'list_documentation_files',
    arguments: {}
  });
  
  if (response.error) {
    throw new Error(response.error.message);
  }

  const files = JSON.parse(response.result.content[0].text);
  log(`Found ${files.length} files`);
}

async function runTests() {
  const tests = [
    testListTools,
    testSearch,
    testListFiles
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await test();
      passed++;
      log(`✓ ${test.name}`);
    } catch (error) {
      failed++;
      log(`✗ ${test.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  log(`\nResults: ${passed} passed, ${failed} failed`);
  
  return failed === 0;
}

async function cleanup() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
}

async function main() {
  try {
    await startServer();
    const success = await runTests();
    await cleanup();
    process.exit(success ? 0 : 1);
  } catch (error) {
    log(`Test error: ${error instanceof Error ? error.message : String(error)}`);
    await cleanup();
    process.exit(1);
  }
}

main(); 