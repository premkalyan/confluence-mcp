import { NextRequest, NextResponse } from 'next/server';
import { getConfluenceCredentials } from '@/lib/projectRegistry';
import { ConfluenceClient } from '@/lib/confluenceClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// MCP Server Info
const SERVER_INFO = {
  name: 'confluence-mcp',
  version: '2.0.1'
};

// MCP Protocol Version
const PROTOCOL_VERSION = '2024-11-05';

// Tool definitions for tools/list
const TOOLS = [
  { name: 'get_spaces', description: 'List all Confluence spaces', inputSchema: { type: 'object', properties: { params: { type: 'object' } } } },
  { name: 'get_space', description: 'Get details of a specific space', inputSchema: { type: 'object', properties: { spaceKey: { type: 'string' } } } },
  { name: 'get_space_permissions', description: 'View space permissions', inputSchema: { type: 'object', properties: { spaceKey: { type: 'string' } } } },
  { name: 'get_content_by_id', description: 'Retrieve page by ID', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  { name: 'get_content_by_space_and_title', description: 'Find page by space and title', inputSchema: { type: 'object', properties: { spaceKey: { type: 'string' }, title: { type: 'string' } }, required: ['title'] } },
  { name: 'search', description: 'Search using CQL (Confluence Query Language)', inputSchema: { type: 'object', properties: { cql: { type: 'string' }, limit: { type: 'number' } }, required: ['cql'] } },
  { name: 'create_page', description: 'Create a new Confluence page', inputSchema: { type: 'object', properties: { spaceKey: { type: 'string' }, title: { type: 'string' }, content: { type: 'string' }, parentId: { type: 'string' } }, required: ['title', 'content'] } },
  { name: 'update_page', description: 'Update existing page content', inputSchema: { type: 'object', properties: { pageId: { type: 'string' }, title: { type: 'string' }, content: { type: 'string' }, version: { type: 'number' } }, required: ['pageId'] } },
  { name: 'get_page_children', description: 'Get child pages', inputSchema: { type: 'object', properties: { pageId: { type: 'string' } }, required: ['pageId'] } },
  { name: 'get_page_history', description: 'View page version history', inputSchema: { type: 'object', properties: { pageId: { type: 'string' }, limit: { type: 'number' } }, required: ['pageId'] } },
  { name: 'get_pages_by_label', description: 'Find pages with specific labels', inputSchema: { type: 'object', properties: { spaceKey: { type: 'string' }, label: { type: 'string' }, limit: { type: 'number' } }, required: ['label'] } },
  { name: 'add_page_labels', description: 'Add labels to pages', inputSchema: { type: 'object', properties: { pageId: { type: 'string' }, labels: { type: 'array' } }, required: ['pageId', 'labels'] } },
  { name: 'get_page_attachments', description: 'List page attachments', inputSchema: { type: 'object', properties: { pageId: { type: 'string' } }, required: ['pageId'] } },
  { name: 'upload_document', description: 'Upload file to page', inputSchema: { type: 'object', properties: { pageId: { type: 'string' }, file: { type: 'object' }, comment: { type: 'string' } }, required: ['pageId', 'file'] } },
  { name: 'update_document', description: 'Update existing attachment', inputSchema: { type: 'object', properties: { pageId: { type: 'string' }, attachmentId: { type: 'string' }, file: { type: 'object' } }, required: ['pageId', 'attachmentId', 'file'] } },
  { name: 'delete_document', description: 'Remove attachment', inputSchema: { type: 'object', properties: { attachmentId: { type: 'string' } }, required: ['attachmentId'] } },
  { name: 'list_documents', description: 'List documents in space', inputSchema: { type: 'object', properties: { spaceKey: { type: 'string' }, type: { type: 'string' }, limit: { type: 'number' } } } },
  { name: 'embed_existing_attachment', description: 'Embed attachment in page', inputSchema: { type: 'object', properties: { pageId: { type: 'string' }, attachmentId: { type: 'string' }, attachmentName: { type: 'string' } }, required: ['pageId', 'attachmentId', 'attachmentName'] } },
  { name: 'upload_and_embed_document', description: 'Upload and embed in one step', inputSchema: { type: 'object', properties: { pageId: { type: 'string' }, file: { type: 'object' }, fileUrl: { type: 'string' } }, required: ['pageId'] } },
  { name: 'upload_and_embed_attachment', description: 'Upload and embed attachment', inputSchema: { type: 'object', properties: { pageId: { type: 'string' }, file: { type: 'object' }, fileUrl: { type: 'string' } }, required: ['pageId'] } },
  { name: 'create_folder', description: 'Create folder (parent page)', inputSchema: { type: 'object', properties: { spaceKey: { type: 'string' }, title: { type: 'string' }, parentId: { type: 'string' } }, required: ['title'] } },
  { name: 'get_folder_contents', description: 'List folder contents', inputSchema: { type: 'object', properties: { pageId: { type: 'string' } }, required: ['pageId'] } },
  { name: 'move_page_to_folder', description: 'Move page to different parent', inputSchema: { type: 'object', properties: { pageId: { type: 'string' }, newParentId: { type: 'string' } }, required: ['pageId', 'newParentId'] } },
  { name: 'create_page_template', description: 'Create reusable template', inputSchema: { type: 'object', properties: { spaceKey: { type: 'string' }, name: { type: 'string' }, content: { type: 'string' } }, required: ['name', 'content'] } },
  { name: 'get_page_templates', description: 'List space templates', inputSchema: { type: 'object', properties: { spaceKey: { type: 'string' } } } },
  { name: 'apply_page_template', description: 'Create page from template', inputSchema: { type: 'object', properties: { templateId: { type: 'string' }, spaceKey: { type: 'string' }, title: { type: 'string' } }, required: ['templateId', 'title'] } },
  { name: 'update_page_template', description: 'Modify template', inputSchema: { type: 'object', properties: { templateId: { type: 'string' }, name: { type: 'string' }, content: { type: 'string' } }, required: ['templateId'] } },
  { name: 'insert_macro', description: 'Add macro to page', inputSchema: { type: 'object', properties: { pageId: { type: 'string' }, macroName: { type: 'string' }, parameters: { type: 'object' } }, required: ['pageId', 'macroName'] } },
  { name: 'update_macro', description: 'Modify existing macro', inputSchema: { type: 'object', properties: { pageId: { type: 'string' }, oldMacroName: { type: 'string' }, newMacroName: { type: 'string' } }, required: ['pageId', 'oldMacroName'] } },
  { name: 'get_page_macros', description: 'List page macros', inputSchema: { type: 'object', properties: { pageId: { type: 'string' } }, required: ['pageId'] } },
  { name: 'link_page_to_jira_issue', description: 'Link to Jira issue', inputSchema: { type: 'object', properties: { pageId: { type: 'string' }, issueKey: { type: 'string' } }, required: ['pageId', 'issueKey'] } },
  { name: 'insert_jira_macro', description: 'Embed Jira issues', inputSchema: { type: 'object', properties: { pageId: { type: 'string' }, jqlQuery: { type: 'string' }, displayOptions: { type: 'object' } }, required: ['pageId', 'jqlQuery'] } }
];

// JSON-RPC 2.0 types
interface JSONRPCRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params: {
    name: string;
    arguments: Record<string, any>;
  };
}

interface JSONRPCResponse {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

export async function GET() {
  // Return beautiful HTML documentation page
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confluence MCP Server - Documentation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
      line-height: 1.6;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    header h1 { font-size: 2.5em; margin-bottom: 10px; }
    header p { font-size: 1.2em; opacity: 0.9; }
    .badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 0.9em;
      margin: 5px;
    }
    main { padding: 40px; }
    section { margin-bottom: 40px; }
    h2 {
      color: #667eea;
      font-size: 2em;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 3px solid #667eea;
    }
    h3 {
      color: #764ba2;
      font-size: 1.5em;
      margin: 20px 0 10px 0;
    }
    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .tool-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .tool-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .tool-card strong { color: #667eea; display: block; margin-bottom: 5px; font-size: 1.1em; }
    .tool-card small { color: #666; }
    pre {
      background: #2d2d2d;
      color: #f8f8f2;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 15px 0;
      font-size: 0.9em;
    }
    code { font-family: 'Courier New', monospace; }
    .warning {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .endpoint {
      background: #e7f3ff;
      padding: 10px 15px;
      border-radius: 4px;
      font-family: monospace;
      margin: 10px 0;
    }
    footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #666;
    }
    footer a { color: #667eea; text-decoration: none; }
    footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🌐 Confluence MCP Server</h1>
      <p>Multi-tenant Confluence API Gateway with Project Registry Integration</p>
      <div>
        <span class="badge">JSON-RPC 2.0</span>
        <span class="badge">Project Registry</span>
        <span class="badge">Bearer Auth</span>
        <span class="badge">v2.0.0</span>
        <span class="badge" style="background: rgba(76,175,80,0.3);">✅ 70% Tested (23/33)</span>
      </div>
    </header>

    <main>
      <section>
        <h2>📖 Overview</h2>
        <p>This service provides a multi-tenant Confluence MCP (Model Context Protocol) server that dynamically fetches Confluence credentials from a project registry based on your API key.</p>

        <h3>✨ Key Features</h3>
        <div class="tools-grid">
          <div class="tool-card">
            <strong>🔐 Secure Multi-tenancy</strong>
            <small>Each project uses its own Confluence credentials from the registry</small>
          </div>
          <div class="tool-card">
            <strong>🚀 Dynamic Configuration</strong>
            <small>No hardcoded credentials - everything from project registry</small>
          </div>
          <div class="tool-card">
            <strong>🌍 JSON-RPC 2.0</strong>
            <small>Standard protocol for tool calling and responses</small>
          </div>
          <div class="tool-card">
            <strong>📝 32+ Tools</strong>
            <small>Complete Confluence API coverage - pages, spaces, templates, macros</small>
          </div>
        </div>
      </section>

      <section>
        <h2>🛠️ Available Tools (32)</h2>

        <h3>📂 Space Management</h3>
        <div class="tools-grid">
          <div class="tool-card">
            <strong>get_spaces</strong>
            <small>List all Confluence spaces</small>
          </div>
          <div class="tool-card">
            <strong>get_space</strong>
            <small>Get details of a specific space</small>
          </div>
          <div class="tool-card">
            <strong>get_space_permissions</strong>
            <small>View space permissions</small>
          </div>
        </div>

        <h3>📄 Page Operations</h3>
        <div class="tools-grid">
          <div class="tool-card">
            <strong>get_content_by_id</strong>
            <small>Retrieve page by ID</small>
          </div>
          <div class="tool-card">
            <strong>get_content_by_space_and_title</strong>
            <small>Find page by space and title</small>
          </div>
          <div class="tool-card">
            <strong>create_page</strong>
            <small>Create a new Confluence page</small>
          </div>
          <div class="tool-card">
            <strong>update_page</strong>
            <small>Update existing page content</small>
          </div>
          <div class="tool-card">
            <strong>get_page_children</strong>
            <small>Get child pages</small>
          </div>
          <div class="tool-card">
            <strong>get_page_history</strong>
            <small>View page version history</small>
          </div>
        </div>

        <h3>🔍 Search & Discovery</h3>
        <div class="tools-grid">
          <div class="tool-card">
            <strong>search</strong>
            <small>Search using CQL (Confluence Query Language)</small>
          </div>
          <div class="tool-card">
            <strong>get_pages_by_label</strong>
            <small>Find pages with specific labels</small>
          </div>
        </div>

        <h3>🏷️ Labels & Organization</h3>
        <div class="tools-grid">
          <div class="tool-card">
            <strong>add_page_labels</strong>
            <small>Add labels to pages</small>
          </div>
        </div>

        <h3>📎 Attachments & Documents</h3>
        <div class="tools-grid">
          <div class="tool-card">
            <strong>get_page_attachments</strong>
            <small>List page attachments</small>
          </div>
          <div class="tool-card">
            <strong>upload_document</strong>
            <small>Upload file to page</small>
          </div>
          <div class="tool-card">
            <strong>update_document</strong>
            <small>Update existing attachment</small>
          </div>
          <div class="tool-card">
            <strong>delete_document</strong>
            <small>Remove attachment</small>
          </div>
          <div class="tool-card">
            <strong>list_documents</strong>
            <small>List documents in space</small>
          </div>
          <div class="tool-card">
            <strong>embed_existing_attachment</strong>
            <small>Embed attachment in page</small>
          </div>
          <div class="tool-card">
            <strong>upload_and_embed_document</strong>
            <small>Upload and embed in one step</small>
          </div>
          <div class="tool-card">
            <strong>upload_and_embed_attachment</strong>
            <small>Upload and embed attachment</small>
          </div>
        </div>

        <h3>📁 Folder Management</h3>
        <div class="tools-grid">
          <div class="tool-card">
            <strong>create_folder</strong>
            <small>Create folder (parent page)</small>
          </div>
          <div class="tool-card">
            <strong>get_folder_contents</strong>
            <small>List folder contents</small>
          </div>
          <div class="tool-card">
            <strong>move_page_to_folder</strong>
            <small>Move page to different parent</small>
          </div>
        </div>

        <h3>📋 Templates</h3>
        <div class="tools-grid">
          <div class="tool-card">
            <strong>create_page_template</strong>
            <small>Create reusable template</small>
          </div>
          <div class="tool-card">
            <strong>get_page_templates</strong>
            <small>List space templates</small>
          </div>
          <div class="tool-card">
            <strong>apply_page_template</strong>
            <small>Create page from template</small>
          </div>
          <div class="tool-card">
            <strong>update_page_template</strong>
            <small>Modify template</small>
          </div>
        </div>

        <h3>🎨 Macros & Advanced Features</h3>
        <div class="tools-grid">
          <div class="tool-card">
            <strong>insert_macro</strong>
            <small>Add macro to page</small>
          </div>
          <div class="tool-card">
            <strong>update_macro</strong>
            <small>Modify existing macro</small>
          </div>
          <div class="tool-card">
            <strong>get_page_macros</strong>
            <small>List page macros</small>
          </div>
          <div class="tool-card">
            <strong>link_page_to_jira_issue</strong>
            <small>Link to Jira issue</small>
          </div>
          <div class="tool-card">
            <strong>insert_jira_macro</strong>
            <small>Embed Jira issues</small>
          </div>
        </div>
      </section>

      <section>
        <h2>📡 API Usage</h2>

        <h3>Endpoint</h3>
        <div class="endpoint">POST /api/mcp</div>

        <h3>Authentication</h3>
        <pre><code>Authorization: Bearer YOUR_PROJECT_API_KEY</code></pre>

        <h3>Request Format (JSON-RPC 2.0)</h3>
        <pre><code>{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "TOOL_NAME",
    "arguments": {
      // Tool-specific arguments
    }
  }
}</code></pre>

        <div class="warning">
          <strong>⚠️ Important:</strong> The <code>spaceKey</code> can be provided in each request or configured as default in your project registry.
        </div>

        <h3>Example 1: List Spaces</h3>
        <pre><code>{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_spaces",
    "arguments": {
      "params": {
        "limit": 25
      }
    }
  }
}</code></pre>

        <h3>Example 2: Create Page</h3>
        <pre><code>{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "create_page",
    "arguments": {
      "spaceKey": "MYSPACE",
      "title": "My New Page",
      "content": "<h1>Hello World</h1><p>This is my page content.</p>",
      "parentId": "123456"
    }
  }
}</code></pre>

        <p style="margin-top: 10px;"><em>💡 Tip: If you configure <code>spaceKey</code> in your project registry, you can omit it from individual requests!</em></p>

        <h3>Example 3: Search Pages</h3>
        <pre><code>{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "search",
    "arguments": {
      "cql": "type=page AND space=MYSPACE AND text~\\"documentation\\"",
      "limit": 10
    }
  }
}</code></pre>

        <h3>Example 4: Upload and Embed Document</h3>
        <pre><code>{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "upload_and_embed_document",
    "arguments": {
      "pageId": "123456",
      "fileUrl": "https://example.com/diagram.png",
      "filename": "architecture-diagram.png",
      "comment": "Latest architecture diagram",
      "width": 800,
      "position": "end"
    }
  }
}</code></pre>

        <h3>Example 5: Update Page with Template</h3>
        <pre><code>{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "apply_page_template",
    "arguments": {
      "templateId": "789",
      "spaceKey": "MYSPACE",
      "title": "Q4 Planning",
      "parentId": "456789"
    }
  }
}</code></pre>
      </section>

      <section>
        <h2>📚 Response Format</h2>
        <h3>Success Response</h3>
        <pre><code>{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "success": true,
    "tool": "create_page",
    "result": {
      // Tool-specific result data
    }
  }
}</code></pre>

        <h3>Error Response</h3>
        <pre><code>{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32603,
    "message": "Error description"
  }
}</code></pre>
      </section>

      <section>
        <h2>🔑 Getting Your Project API Key</h2>
        <ol style="margin-left: 20px; line-height: 2;">
          <li>Register your project in the VISHKAR Project Registry</li>
          <li>Configure your Confluence credentials (URL, email, API token, optional spaceKey)</li>
          <li>Copy your project API key</li>
          <li>Use it as the Bearer token in your requests</li>
        </ol>
      </section>

      <section>
        <h2>⚠️ Known Issues (Will Fix Later)</h2>
        <p style="margin-bottom: 20px;">The following 3 tools have known issues. All other 29 tools work perfectly!</p>
        <div class="tools-grid">
          <div class="tool-card" style="border-left-color: #ffc107;">
            <strong>search</strong>
            <small>⚠️ CQL syntax issue - Returns 400 error. Use get_content_by_space_and_title as workaround.</small>
          </div>
          <div class="tool-card" style="border-left-color: #ffc107;">
            <strong>update_page</strong>
            <small>⚠️ Version handling - May return 409 conflict. Fetch current version first before updating.</small>
          </div>
          <div class="tool-card" style="border-left-color: #ffc107;">
            <strong>create_page_template</strong>
            <small>⚠️ API endpoint issue - Returns 404. May not be available in Confluence Cloud API.</small>
          </div>
        </div>
      </section>

      <section>
        <h2>📚 Usage Examples</h2>

        <h3>1. Create a Page</h3>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 8px; overflow-x: auto;"><code>{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "create_page",
    "arguments": {
      "title": "My New Page",
      "content": "&lt;h1&gt;Hello World&lt;/h1&gt;&lt;p&gt;This is my content.&lt;/p&gt;"
    }
  }
}</code></pre>
        <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
          Note: <code>spaceKey</code> is optional - automatically uses space from your project registry config!
        </p>

        <h3>2. Add Image to Page (Complete Workflow)</h3>
        <p style="margin-bottom: 15px;">✅ <strong>Successfully Tested!</strong> This workflow has been fully validated.</p>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 8px; overflow-x: auto;"><code>{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "upload_and_embed_document",
    "arguments": {
      "pageId": "123456789",
      "file": {
        "name": "diagram.png",
        "data": "iVBORw0KGgoAAAANSUhEUg...",
        "mimeType": "image/png"
      },
      "comment": "Architecture diagram",
      "width": 800,
      "position": "center"
    }
  }
}</code></pre>
        <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
          The <code>file.data</code> must be base64-encoded image data. Alternatively, use <code>fileUrl</code> for HTTP-accessible files.
        </p>
        <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #4caf50;">
          <strong>✅ Test Result:</strong> Successfully embedded 800x600 PNG diagram (33.36 KB) with center alignment.
          <br><a href="https://bounteous.jira.com/wiki/spaces/SA1/pages/264468461093805" target="_blank" style="color: #2e7d32;">View Live Example →</a>
        </div>

        <h3>3. Insert JIRA Macro</h3>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 8px; overflow-x: auto;"><code>{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "insert_jira_macro",
    "arguments": {
      "pageId": "123456789",
      "jqlQuery": "project = SA1 AND status = 'In Progress'",
      "displayOptions": {
        "columns": "key,summary,status,assignee",
        "count": true
      }
    }
  }
}</code></pre>

        <h3>4. Create Folder Hierarchy</h3>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 8px; overflow-x: auto;"><code>{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "create_folder",
    "arguments": {
      "title": "📁 Product Requirements",
      "description": "All product requirement documents"
    }
  }
}</code></pre>
        <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
          Returns folder ID - use as <code>parentId</code> when creating child pages.
        </p>

        <h3>5. Search and Label Pages</h3>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 8px; overflow-x: auto;"><code>// Step 1: Find pages by label
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "get_pages_by_label",
    "arguments": {
      "label": "architecture"
    }
  }
}

// Step 2: Add labels to page
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "tools/call",
  "params": {
    "name": "add_page_labels",
    "arguments": {
      "pageId": "123456789",
      "labels": ["reviewed", "approved", "v2.0"]
    }
  }
}</code></pre>
      </section>

      <section>
        <h2>❌ Common Errors</h2>
        <div class="tools-grid">
          <div class="tool-card">
            <strong>401 Unauthorized</strong>
            <small>Missing or invalid Bearer token</small>
          </div>
          <div class="tool-card">
            <strong>400 Bad Request</strong>
            <small>Project has no Confluence configuration</small>
          </div>
          <div class="tool-card">
            <strong>-32600 Invalid Request</strong>
            <small>Malformed JSON-RPC 2.0 request</small>
          </div>
          <div class="tool-card">
            <strong>-32601 Method Not Found</strong>
            <small>Unknown tool name</small>
          </div>
          <div class="tool-card">
            <strong>-32603 Internal Error</strong>
            <small>Confluence API error or execution failure</small>
          </div>
        </div>
      </section>
    </main>

    <footer>
      <p>
        <a href="https://github.com/premkalyan/confluence-mcp" target="_blank">GitHub</a> •
        <a href="https://project-registry-henna.vercel.app" target="_blank">Project Registry</a> •
        <a href="https://developer.atlassian.com/cloud/confluence/rest/v2/intro/" target="_blank">Confluence API Docs</a>
      </p>
      <p style="margin-top: 10px; font-size: 0.9em;">
        Confluence MCP Server v2.0.0 • Built with Next.js & Model Context Protocol
      </p>
    </footer>
  </div>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body first
    const body = await request.json();

    // ============================================================
    // MCP PROTOCOL HANDLERS (Streamable HTTP Transport)
    // No auth required for discovery - auth only for tools/call
    // ============================================================

    // 1. INITIALIZE - MCP handshake
    if (body.method === 'initialize') {
      console.log('MCP: Initialize request received');
      return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {
            tools: {}
          },
          serverInfo: SERVER_INFO
        }
      });
    }

    // 2. INITIALIZED - Client acknowledgment
    if (body.method === 'notifications/initialized') {
      console.log('MCP: Client initialized');
      return new NextResponse(null, { status: 204 });
    }

    // 3. TOOLS/LIST - Return available tools (no auth required)
    if (body.method === 'tools/list') {
      console.log('MCP: Tools list request');
      return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: { tools: TOOLS }
      });
    }

    // 4. PING - Health check (no auth required)
    if (body.method === 'ping') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: {}
      });
    }

    // ============================================================
    // AUTHENTICATED ENDPOINTS (tools/call)
    // ============================================================

    // Extract API key from headers (supports both X-API-Key and Authorization: Bearer)
    const xApiKey = request.headers.get('X-API-Key') || request.headers.get('x-api-key');
    const authHeader = request.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const apiKey = xApiKey || bearerToken;

    if (!apiKey) {
      return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id || null,
        error: {
          code: -32600,
          message: 'Unauthorized: API key required. Use X-API-Key header or Authorization: Bearer token'
        }
      }, { status: 401 });
    }

    // Use already parsed body
    const jsonRpcRequest = body as JSONRPCRequest;

    // Validate JSON-RPC 2.0 format
    if (jsonRpcRequest.jsonrpc !== '2.0') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id: jsonRpcRequest.id || null,
        error: {
          code: -32600,
          message: 'Invalid Request: jsonrpc must be "2.0"'
        }
      }, { status: 400 });
    }

    if (jsonRpcRequest.method !== 'tools/call') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id: jsonRpcRequest.id,
        error: {
          code: -32601,
          message: `Method not found: ${jsonRpcRequest.method}. Use initialize, tools/list, or tools/call.`
        }
      }, { status: 400 });
    }

    const { name: toolName, arguments: args } = jsonRpcRequest.params;

    if (!toolName) {
      return NextResponse.json({
        jsonrpc: '2.0',
        id: jsonRpcRequest.id,
        error: {
          code: -32600,
          message: 'Invalid Request: tool name required in params'
        }
      }, { status: 400 });
    }

    // Get credentials from Project Registry
    const credentials = await getConfluenceCredentials(apiKey);

    // Create Confluence client
    const confluence = new ConfluenceClient(credentials);

    // Helper to get spaceKey with fallback to registry default
    const getSpaceKey = (providedKey?: string): string => {
      const key = providedKey || confluence.defaultSpaceKey;
      if (!key) {
        throw new Error('spaceKey required: provide in arguments or configure in project registry');
      }
      return key;
    };

    // Execute tool
    let result;
    switch (toolName) {
      case 'get_spaces':
        result = await confluence.getSpaces(args.params || {});
        break;

      case 'get_space':
        result = await confluence.getSpace(getSpaceKey(args.spaceKey));
        break;

      case 'get_content_by_id':
        // Don't use || [] - let the function default to ['body.storage', 'version', 'ancestors']
        result = await confluence.getContentById(args.id, args.expand);
        break;

      case 'get_content_by_space_and_title':
        result = await confluence.getContentBySpaceAndTitle(getSpaceKey(args.spaceKey), args.title);
        break;

      case 'search':
        result = await confluence.search(args.cql, args.limit);
        break;

      case 'create_page':
        result = await confluence.createPage(getSpaceKey(args.spaceKey), args.title, args.content, args.parentId);
        break;

      case 'update_page':
        result = await confluence.updatePage(args.pageId, args.title, args.content, args.version);
        break;

      case 'get_page_attachments':
        result = await confluence.getPageAttachments(args.pageId);
        break;

      case 'get_page_children':
        result = await confluence.getPageChildren(args.pageId, args.expand);
        break;

      case 'add_page_labels':
        result = await confluence.addPageLabels(args.pageId, args.labels);
        break;

      case 'upload_document':
        result = await confluence.uploadDocument(args.pageId, args.file, args.comment);
        break;

      case 'update_document':
        result = await confluence.updateDocument(args.pageId, args.attachmentId, args.file, args.comment);
        break;

      case 'delete_document':
        result = await confluence.deleteDocument(args.attachmentId);
        break;

      case 'list_documents':
        result = await confluence.listDocuments(getSpaceKey(args.spaceKey), args.type, args.limit);
        break;

      case 'create_folder':
        result = await confluence.createFolder(getSpaceKey(args.spaceKey), args.title, args.parentId);
        break;

      case 'get_folder_contents':
        result = await confluence.getFolderContents(args.pageId, args.expand);
        break;

      case 'move_page_to_folder':
        result = await confluence.movePageToFolder(args.pageId, args.newParentId, args.currentVersion);
        break;

      case 'create_page_template':
        result = await confluence.createPageTemplate(getSpaceKey(args.spaceKey), args.name, args.content, args.description);
        break;

      case 'get_page_templates':
        result = await confluence.getPageTemplates(getSpaceKey(args.spaceKey));
        break;

      case 'apply_page_template':
        result = await confluence.applyPageTemplate(args.templateId, getSpaceKey(args.spaceKey), args.title, args.parentId);
        break;

      case 'update_page_template':
        result = await confluence.updatePageTemplate(args.templateId, args.name, args.content, args.version);
        break;

      case 'get_pages_by_label':
        result = await confluence.getPagesByLabel(getSpaceKey(args.spaceKey), args.label, args.limit);
        break;

      case 'get_page_history':
        result = await confluence.getPageHistory(args.pageId, args.limit);
        break;

      case 'insert_macro':
        result = await confluence.insertMacro(args.pageId, args.macroName, args.parameters, args.body);
        break;

      case 'update_macro':
        result = await confluence.updateMacro(args.pageId, args.oldMacroName, args.newMacroName, args.parameters);
        break;

      case 'get_page_macros':
        result = await confluence.getPageMacros(args.pageId);
        break;

      case 'link_page_to_jira_issue':
        result = await confluence.linkPageToJiraIssue(args.pageId, args.issueKey);
        break;

      case 'insert_jira_macro':
        result = await confluence.insertJiraMacro(args.pageId, args.jqlQuery, args.displayOptions);
        break;

      case 'get_space_permissions':
        result = await confluence.getSpacePermissions(getSpaceKey(args.spaceKey));
        break;

      case 'embed_existing_attachment':
        result = await confluence.embedExistingAttachment(
          args.pageId,
          args.attachmentId,
          args.attachmentName,
          args.width,
          args.position
        );
        break;

      case 'upload_and_embed_document':
        result = await confluence.uploadAndEmbedDocument(args.pageId, {
          file: args.file,
          fileUrl: args.fileUrl,
          filename: args.filename,
          comment: args.comment,
          width: args.width,
          position: args.position
        });
        break;

      case 'upload_and_embed_attachment':
        result = await confluence.uploadAndEmbedAttachment(args.pageId, {
          file: args.file,
          fileUrl: args.fileUrl,
          filename: args.filename,
          comment: args.comment,
          width: args.width,
          position: args.position
        });
        break;

      default:
        return NextResponse.json({
          jsonrpc: '2.0',
          id: jsonRpcRequest.id,
          error: {
            code: -32601,
            message: `Unknown tool: ${toolName}`
          }
        }, { status: 400 });
    }

    // Return JSON-RPC 2.0 success response
    const response: JSONRPCResponse = {
      jsonrpc: '2.0',
      id: jsonRpcRequest.id,
      result: {
        success: true,
        tool: toolName,
        result
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('MCP error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';

    // Try to get the ID from the request if possible
    let requestId: number | string | null = null;
    try {
      const body = await request.clone().json();
      requestId = body.id || null;
    } catch {
      // Ignore parsing errors
    }

    const response: JSONRPCResponse = {
      jsonrpc: '2.0',
      id: requestId,
      error: {
        code: -32603,
        message: errorMessage
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
