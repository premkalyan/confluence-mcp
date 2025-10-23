export default function Home() {
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto bg-white text-black">
      <h1 className="text-4xl font-bold mb-4 text-black">Confluence MCP Server</h1>
      <p className="mb-4 text-gray-700">Version 1.0.0 - Serverless with Project Registry Integration</p>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mt-8 mb-4 text-black">Available Endpoints</h2>
        <ul className="list-disc pl-6 space-y-2 text-black">
          <li><code className="bg-gray-100 px-2 py-1 rounded text-black">/api/health</code> - Health check</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-black">/api/mcp</code> - Main MCP endpoint (POST)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mt-8 mb-4 text-black">Available Tools (10 total)</h2>

        <h3 className="text-xl font-semibold mt-6 mb-3 text-black">Space Operations</h3>
        <ul className="list-disc pl-6 space-y-2 text-black">
          <li><strong className="text-black">get_spaces</strong> - Get list of all Confluence spaces</li>
          <li><strong className="text-black">get_space</strong> - Get details of a specific space</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3 text-black">Content Operations</h3>
        <ul className="list-disc pl-6 space-y-2 text-black">
          <li><strong className="text-black">get_content_by_id</strong> - Get page content by ID</li>
          <li><strong className="text-black">get_content_by_space_and_title</strong> - Get page by space key and title</li>
          <li><strong className="text-black">search</strong> - Search Confluence content using CQL</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3 text-black">Page Management</h3>
        <ul className="list-disc pl-6 space-y-2 text-black">
          <li><strong className="text-black">create_page</strong> - Create a new Confluence page</li>
          <li><strong className="text-black">update_page</strong> - Update an existing page</li>
          <li><strong className="text-black">get_page_children</strong> - Get child pages of a page</li>
          <li><strong className="text-black">get_page_attachments</strong> - Get attachments for a page</li>
          <li><strong className="text-black">add_page_labels</strong> - Add labels to a page</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mt-8 mb-4 text-black">Usage</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-black">
{`POST /api/mcp
Headers:
  X-API-Key: pk_your_api_key
  Content-Type: application/json

Body:
{
  "tool": "search",
  "arguments": {
    "cql": "type=page and space=MYSPACE",
    "limit": 10
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
        <h2 className="text-2xl font-bold mt-8 mb-4 text-black">Integration</h2>
        <p className="mb-4 text-black">This Confluence MCP server integrates with the Project Registry to fetch Confluence credentials securely:</p>
        <ol className="list-decimal pl-6 space-y-2 text-black">
          <li>Register your project with Confluence credentials in the Project Registry</li>
          <li>Use the provided API key in the X-API-Key header</li>
          <li>The server fetches and decrypts your Confluence credentials automatically</li>
          <li>Confluence operations are executed with your credentials</li>
        </ol>
      </section>

      <footer className="mt-12 pt-8 border-t border-gray-300 text-center text-sm text-gray-700">
        <p>Confluence MCP Server v1.0.0 - Part of the Prometheus MCP Ecosystem</p>
      </footer>
    </div>
  );
}
