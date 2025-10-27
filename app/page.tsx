export default function Home() {
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto bg-white text-black">
      <h1 className="text-4xl font-bold mb-4 text-black">Confluence MCP Server</h1>
      <p className="mb-4 text-gray-700">Version 2.0.0 - Serverless with Auto-Fetch Configuration</p>
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
        <p className="text-blue-700 font-semibold">✨ New in v2.0.0:</p>
        <p className="text-blue-600">spaceKey is now <strong>optional</strong> - automatically fetched from Project Registry via API key!</p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mt-8 mb-4 text-black">Available Endpoints</h2>
        <ul className="list-disc pl-6 space-y-2 text-black">
          <li><code className="bg-gray-100 px-2 py-1 rounded text-black">/api/health</code> - Health check</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-black">/api/mcp</code> - Main MCP endpoint (POST)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mt-8 mb-4 text-black">Available Tools (32 total)</h2>

        <h3 className="text-xl font-semibold mt-6 mb-3 text-black">Space Operations (2 tools)</h3>
        <ul className="list-disc pl-6 space-y-2 text-black">
          <li><strong className="text-black">get_spaces</strong> - Get list of all Confluence spaces</li>
          <li><strong className="text-black">get_space</strong> - Get details of a specific space <span className="text-blue-600">(spaceKey optional)</span></li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3 text-black">Content & Search (3 tools)</h3>
        <ul className="list-disc pl-6 space-y-2 text-black">
          <li><strong className="text-black">get_content_by_id</strong> - Get page content by ID</li>
          <li><strong className="text-black">get_content_by_space_and_title</strong> - Get page by space key and title <span className="text-blue-600">(spaceKey optional)</span></li>
          <li><strong className="text-black">search</strong> - Search Confluence content using CQL</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3 text-black">Page Management (5 tools)</h3>
        <ul className="list-disc pl-6 space-y-2 text-black">
          <li><strong className="text-black">create_page</strong> - Create a new Confluence page <span className="text-blue-600">(spaceKey optional)</span></li>
          <li><strong className="text-black">update_page</strong> - Update an existing page</li>
          <li><strong className="text-black">get_page_children</strong> - Get child pages of a page</li>
          <li><strong className="text-black">get_page_history</strong> - Get version history of page changes</li>
          <li><strong className="text-black">add_page_labels</strong> - Add labels to a page</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3 text-black">Document & Attachment Management (6 tools)</h3>
        <ul className="list-disc pl-6 space-y-2 text-black">
          <li><strong className="text-black">get_page_attachments</strong> - Get attachments for a page</li>
          <li><strong className="text-black">upload_document</strong> - Upload document/file as attachment</li>
          <li><strong className="text-black">update_document</strong> - Update existing document attachment</li>
          <li><strong className="text-black">delete_document</strong> - Delete document attachment</li>
          <li><strong className="text-black">list_documents</strong> - List all documents in a space <span className="text-blue-600">(spaceKey optional)</span></li>
          <li><strong className="text-black">embed_existing_attachment</strong> - Embed existing attachment in page</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3 text-black">Image Upload & Embedding (2 tools)</h3>
        <ul className="list-disc pl-6 space-y-2 text-black">
          <li><strong className="text-black">upload_and_embed_document</strong> - Upload and auto-embed document (supports base64 or blob URL)</li>
          <li><strong className="text-black">upload_and_embed_attachment</strong> - Upload file and embed as image/link in one operation</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3 text-black">Folder & Hierarchy (3 tools)</h3>
        <ul className="list-disc pl-6 space-y-2 text-black">
          <li><strong className="text-black">create_folder</strong> - Create folder for organizing docs <span className="text-blue-600">(spaceKey optional)</span></li>
          <li><strong className="text-black">get_folder_contents</strong> - Get all child pages within a folder</li>
          <li><strong className="text-black">move_page_to_folder</strong> - Move page to different parent folder</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3 text-black">Templates (4 tools)</h3>
        <ul className="list-disc pl-6 space-y-2 text-black">
          <li><strong className="text-black">create_page_template</strong> - Create reusable page template <span className="text-blue-600">(spaceKey optional)</span></li>
          <li><strong className="text-black">get_page_templates</strong> - Get all templates in a space <span className="text-blue-600">(spaceKey optional)</span></li>
          <li><strong className="text-black">apply_page_template</strong> - Create new page from template <span className="text-blue-600">(spaceKey optional)</span></li>
          <li><strong className="text-black">update_page_template</strong> - Update existing page template</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3 text-black">Labels & Organization (1 tool)</h3>
        <ul className="list-disc pl-6 space-y-2 text-black">
          <li><strong className="text-black">get_pages_by_label</strong> - Find pages tagged with specific label <span className="text-blue-600">(spaceKey optional)</span></li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3 text-black">Macros (3 tools)</h3>
        <ul className="list-disc pl-6 space-y-2 text-black">
          <li><strong className="text-black">insert_macro</strong> - Insert Confluence macro (status, info, warning, code, etc.)</li>
          <li><strong className="text-black">update_macro</strong> - Update existing macro parameters</li>
          <li><strong className="text-black">get_page_macros</strong> - List all macros on a page</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3 text-black">JIRA Integration (2 tools)</h3>
        <ul className="list-disc pl-6 space-y-2 text-black">
          <li><strong className="text-black">link_page_to_jira_issue</strong> - Add link from page to JIRA issue</li>
          <li><strong className="text-black">insert_jira_macro</strong> - Insert JIRA macro with JQL query</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3 text-black">Permissions (1 tool)</h3>
        <ul className="list-disc pl-6 space-y-2 text-black">
          <li><strong className="text-black">get_space_permissions</strong> - Get permission settings for a space <span className="text-blue-600">(spaceKey optional)</span></li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mt-8 mb-4 text-black">Usage Example</h2>
        <p className="mb-2 text-black font-semibold">Create a page (no spaceKey needed!):</p>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-black mb-4">
{`POST /api/mcp
Headers:
  X-API-Key: pk_your_api_key
  Content-Type: application/json

Body:
{
  "tool": "create_page",
  "arguments": {
    "title": "My New Page",
    "content": "<h1>Hello World</h1><p>This page was created without passing spaceKey!</p>"
  }
}`}
        </pre>

        <p className="mb-2 text-black font-semibold">Upload and embed a diagram:</p>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-black">
{`POST /api/mcp
Body:
{
  "tool": "upload_and_embed_document",
  "arguments": {
    "pageId": "264468459847682",
    "file": {
      "name": "diagram.png",
      "data": "base64_encoded_data_here",
      "mimeType": "image/png"
    },
    "width": 800,
    "position": "center"
  }
}`}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mt-8 mb-4 text-black">Example Response</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-black">
{`{
  "success": true,
  "tool": "search",
  "result": {
    "results": [...],
    "start": 0,
    "limit": 10,
    "size": 10
  }
}`}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mt-8 mb-4 text-black">Integration with Project Registry</h2>
        <p className="mb-4 text-black">This Confluence MCP server integrates with the Project Registry to fetch Confluence credentials and configuration automatically:</p>
        <ol className="list-decimal pl-6 space-y-2 text-black">
          <li>Register your project with Confluence credentials in the Project Registry</li>
          <li>Configure default <code className="bg-gray-100 px-2 py-1 rounded">spaceKey</code> in the registry (e.g., "SA1")</li>
          <li>Use the provided API key in the X-API-Key header</li>
          <li>The server automatically fetches:
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Confluence base URL</li>
              <li>Authentication credentials (email + API token)</li>
              <li><strong>Default spaceKey</strong> (no need to pass in API calls!)</li>
            </ul>
          </li>
          <li>Confluence operations are executed with your credentials</li>
        </ol>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-4">
          <p className="text-green-700 font-semibold">✅ Benefits:</p>
          <ul className="list-disc pl-6 text-green-600 space-y-1">
            <li>Cleaner API calls - no repetitive <code>spaceKey</code> parameters</li>
            <li>Single source of truth in Project Registry</li>
            <li>Can still override spaceKey when needed</li>
            <li>Supports hybrid file uploads: base64 (small files) or Vercel Blob (large files)</li>
          </ul>
        </div>
      </section>

      <footer className="mt-12 pt-8 border-t border-gray-300 text-center text-sm text-gray-700">
        <p>Confluence MCP Server v2.0.0 - Part of the Prometheus MCP Ecosystem</p>
        <p className="mt-2">Auto-Fetch Configuration • 32 Tools • Image Embedding • Serverless</p>
      </footer>
    </div>
  );
}
