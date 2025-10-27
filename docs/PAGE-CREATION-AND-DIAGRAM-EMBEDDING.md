# Page Creation and Diagram Embedding Guide

**Confluence MCP Server v2.0**
Complete guide for creating pages and embedding diagrams (including Mermaid)

---

## Table of Contents

1. [Creating Confluence Pages](#creating-confluence-pages)
2. [Embedding Images and Diagrams](#embedding-images-and-diagrams)
3. [Mermaid Diagram Workflow](#mermaid-diagram-workflow)
4. [Complete Examples](#complete-examples)
5. [Troubleshooting](#troubleshooting)

---

## Creating Confluence Pages

### Basic Page Creation

**Endpoint**: `create_page`
**Authentication**: Bearer token
**Space Key**: Optional (auto-fetched from Project Registry)

#### Minimal Example

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "create_page",
    "arguments": {
      "title": "My Documentation Page",
      "content": "<h1>Introduction</h1><p>This is the page content.</p>"
    }
  }
}
```

**Note**: `spaceKey` is automatically retrieved from your Project Registry config. You can override it by passing `"spaceKey": "YOUR_SPACE"`.

#### Page with Parent (Hierarchy)

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "create_page",
    "arguments": {
      "title": "Child Page",
      "content": "<h1>Child Content</h1>",
      "parentId": "123456789"
    }
  }
}
```

#### Page with Labels

First create the page, then add labels:

```json
// Step 1: Create page
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "create_page",
    "arguments": {
      "title": "Architecture Document",
      "content": "<h1>System Architecture</h1>"
    }
  }
}

// Step 2: Add labels (use pageId from step 1 response)
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "add_page_labels",
    "arguments": {
      "pageId": "123456789",
      "labels": ["architecture", "reviewed", "v2.0"]
    }
  }
}
```

### API Response Format

#### Successful create_page Response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "success": true,
    "tool": "create_page",
    "result": {
      "id": "264468461093805",
      "type": "page",
      "status": "current",
      "title": "My Documentation Page",
      "space": {
        "id": 123456,
        "key": "SA1",
        "name": "Project Space",
        "type": "global",
        "_links": {
          "self": "https://bounteous.jira.com/wiki/rest/api/space/SA1"
        }
      },
      "history": {
        "latest": true,
        "createdBy": {
          "type": "known",
          "accountId": "5d123abc456def789",
          "email": "user@example.com",
          "displayName": "User Name"
        },
        "createdDate": "2025-10-27T10:14:18.000Z"
      },
      "version": {
        "by": {
          "type": "known",
          "accountId": "5d123abc456def789",
          "email": "user@example.com",
          "displayName": "User Name"
        },
        "when": "2025-10-27T10:14:18.000Z",
        "number": 1,
        "minorEdit": false
      },
      "body": {
        "storage": {
          "value": "<h1>Introduction</h1><p>This is the page content.</p>",
          "representation": "storage"
        }
      },
      "_links": {
        "base": "https://bounteous.jira.com/wiki",
        "context": "/wiki",
        "self": "https://bounteous.jira.com/wiki/rest/api/content/264468461093805",
        "tinyui": "/x/rYCsXIjw",
        "editui": "/pages/resumedraft.action?draftId=264468461093805",
        "webui": "/spaces/SA1/pages/264468461093805/My+Documentation+Page"
      },
      "_expandable": {
        "container": "/rest/api/space/SA1",
        "metadata": "",
        "operations": "",
        "children": "/rest/api/content/264468461093805/child",
        "restrictions": "/rest/api/content/264468461093805/restriction/byOperation",
        "history": "/rest/api/content/264468461093805/history",
        "ancestors": "",
        "descendants": "/rest/api/content/264468461093805/descendant",
        "space": "/rest/api/space/SA1"
      }
    }
  }
}
```

#### Key Response Fields

**Essential Fields**:
- `result.result.id` - **Page ID** (use this for subsequent operations)
- `result.result.title` - Page title
- `result.result.space.key` - Space key (e.g., "SA1")
- `result.result.version.number` - Version number (starts at 1)
- `result.result._links.webui` - Relative URL path to page
- `result.result._links.base` - Base URL for Confluence instance

**Constructing Full Page URL**:
```javascript
const response = await createPage(...);
const pageData = response.result.result;
const fullUrl = `${pageData._links.base}${pageData._links.webui}`;
// Result: https://bounteous.jira.com/wiki/spaces/SA1/pages/264468461093805/My+Documentation+Page
```

**Extracting Page ID**:
```javascript
const response = await createPage(...);
const pageId = response.result.result.id;
// Use this pageId for upload_and_embed_document, add_page_labels, etc.
```

#### Error Response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32603,
    "message": "spaceKey required: provide in arguments or configure in project registry"
  }
}
```

**Common Error Codes**:
- `-32600` - Invalid Request (malformed JSON-RPC)
- `-32601` - Method Not Found (unknown tool name)
- `-32603` - Internal Error (Confluence API error or validation failure)
- `401` - Unauthorized (missing/invalid Bearer token)

### Confluence Storage Format (HTML)

Confluence uses a specific HTML format. Key elements:

```html
<!-- Headings -->
<h1>Main Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>

<!-- Paragraphs -->
<p>Regular paragraph text.</p>

<!-- Lists -->
<ul>
  <li>Bullet point</li>
  <li>Another point</li>
</ul>

<ol>
  <li>First item</li>
  <li>Second item</li>
</ol>

<!-- Links -->
<a href="https://example.com">External Link</a>

<!-- Code Blocks -->
<ac:structured-macro ac:name="code">
  <ac:parameter ac:name="language">javascript</ac:parameter>
  <ac:plain-text-body><![CDATA[
    const hello = "world";
    console.log(hello);
  ]]></ac:plain-text-body>
</ac:structured-macro>

<!-- Tables -->
<table>
  <tbody>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
    </tr>
    <tr>
      <td>Cell 1</td>
      <td>Cell 2</td>
    </tr>
  </tbody>
</table>
```

---

## Embedding Images and Diagrams

### Method 1: Upload and Embed in One Step (Recommended)

**Tool**: `upload_and_embed_document`
**Status**: ✅ Fully tested and working

#### Upload Base64 Image

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "upload_and_embed_document",
    "arguments": {
      "pageId": "123456789",
      "file": {
        "name": "diagram.png",
        "data": "iVBORw0KGgoAAAANSUhEUgAAAAUA...",
        "mimeType": "image/png"
      },
      "comment": "System architecture diagram",
      "width": 800,
      "position": "center"
    }
  }
}
```

**Parameters**:
- `pageId` (required): Confluence page ID
- `file` (required): Object with:
  - `name`: Filename (e.g., "diagram.png")
  - `data`: Base64-encoded image data
  - `mimeType`: MIME type (e.g., "image/png", "image/jpeg", "image/svg+xml")
- `comment` (optional): Upload comment
- `width` (optional): Display width in pixels (default: 800)
- `position` (optional): "inline", "center", "left", "right" (default: "inline")

#### Upload from URL

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "upload_and_embed_document",
    "arguments": {
      "pageId": "123456789",
      "fileUrl": "https://example.com/diagram.png",
      "filename": "architecture-diagram.png",
      "comment": "System architecture",
      "width": 1000,
      "position": "center"
    }
  }
}
```

### Method 2: Two-Step Process

#### Step 1: Upload Document

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "upload_document",
    "arguments": {
      "pageId": "123456789",
      "file": {
        "name": "diagram.png",
        "data": "iVBORw0KGgoAAAANSUhEUgAAAAUA...",
        "mimeType": "image/png"
      },
      "comment": "Architecture diagram"
    }
  }
}
```

#### Step 2: Embed Existing Attachment

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "embed_existing_attachment",
    "arguments": {
      "pageId": "123456789",
      "attachmentId": "att123456",
      "attachmentName": "diagram.png",
      "width": 800,
      "position": "center"
    }
  }
}
```

### Position Options

```json
{
  "position": "inline"   // Default, flows with text
}

{
  "position": "center"   // Centered, on its own line
}

{
  "position": "left"     // Float left with text wrap
}

{
  "position": "right"    // Float right with text wrap
}
```

### upload_and_embed_document Response

#### Successful Response

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "success": true,
    "tool": "upload_and_embed_document",
    "result": {
      "success": true,
      "attachmentId": "att987654321",
      "filename": "diagram.png",
      "fileSize": 34123,
      "mediaType": "image/png",
      "downloadUrl": "https://bounteous.jira.com/wiki/download/attachments/264468461093805/diagram.png",
      "pageId": "264468461093805",
      "pageUrl": "https://bounteous.jira.com/wiki/spaces/SA1/pages/264468461093805",
      "version": 2,
      "embedded": true,
      "message": "Document 'diagram.png' uploaded and embedded successfully"
    }
  }
}
```

#### Key Response Fields

**Essential Fields**:
- `result.result.attachmentId` - Attachment ID (use for delete_document)
- `result.result.filename` - Uploaded filename
- `result.result.fileSize` - File size in bytes (34123 = 33.36 KB)
- `result.result.downloadUrl` - Direct download link
- `result.result.pageId` - Page where image was embedded
- `result.result.pageUrl` - Full URL to page
- `result.result.version` - New page version after embedding
- `result.result.embedded` - Confirmation that image was embedded

**Example Usage**:
```javascript
const uploadResponse = await uploadAndEmbedDocument(...);
const result = uploadResponse.result.result;

console.log(`✅ Uploaded: ${result.filename}`);
console.log(`📏 Size: ${(result.fileSize / 1024).toFixed(2)} KB`);
console.log(`🔗 View: ${result.pageUrl}`);
console.log(`⬇️  Download: ${result.downloadUrl}`);
```

---

## Mermaid Diagram Workflow

Mermaid diagrams need to be converted to images before embedding in Confluence.

### Complete Workflow

```
Mermaid Code → Render to SVG/PNG → Base64 Encode → Upload to Confluence
```

### Step-by-Step Guide

#### 1. Create Your Mermaid Diagram

```mermaid
graph TD
    A[User] --> B[Frontend]
    B --> C[API Gateway]
    C --> D[Auth Service]
    C --> E[Database]
    D --> E
```

#### 2. Convert Mermaid to Image

**Option A: Using Mermaid CLI**

```bash
# Install mermaid-cli
npm install -g @mermaid-js/mermaid-cli

# Create diagram file
cat > diagram.mmd << EOF
graph TD
    A[User] --> B[Frontend]
    B --> C[API Gateway]
    C --> D[Auth Service]
    C --> E[Database]
    D --> E
EOF

# Generate PNG
mmdc -i diagram.mmd -o diagram.png -w 800 -b white
```

**Option B: Using Node.js with Puppeteer**

```javascript
import puppeteer from 'puppeteer';
import fs from 'fs';

async function renderMermaid(mermaidCode) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
      </head>
      <body>
        <div class="mermaid">
          ${mermaidCode}
        </div>
        <script>
          mermaid.initialize({ startOnLoad: true, theme: 'default' });
        </script>
      </body>
    </html>
  `;

  await page.setContent(html);
  await page.waitForSelector('.mermaid svg');

  const element = await page.$('.mermaid');
  const screenshot = await element.screenshot({ type: 'png' });

  await browser.close();
  return screenshot;
}

// Usage
const mermaidCode = `
graph TD
    A[User] --> B[Frontend]
    B --> C[API Gateway]
`;

const imageBuffer = await renderMermaid(mermaidCode);
fs.writeFileSync('diagram.png', imageBuffer);
```

**Option C: Using Online Services**

1. Go to https://mermaid.live/
2. Paste your Mermaid code
3. Click "Download PNG"
4. Use the downloaded file

#### 3. Convert Image to Base64

```bash
# Using base64 command
base64 -i diagram.png -o diagram.txt

# Or in Node.js
const fs = require('fs');
const imageBuffer = fs.readFileSync('diagram.png');
const base64Data = imageBuffer.toString('base64');
console.log(base64Data);
```

#### 4. Upload to Confluence

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "upload_and_embed_document",
    "arguments": {
      "pageId": "123456789",
      "file": {
        "name": "architecture-diagram.png",
        "data": "iVBORw0KGgoAAAANSUhEUg...",
        "mimeType": "image/png"
      },
      "comment": "Mermaid architecture diagram",
      "width": 800,
      "position": "center"
    }
  }
}
```

### Automated Mermaid Pipeline (Node.js Example)

```javascript
#!/usr/bin/env node

import puppeteer from 'puppeteer';
import fetch from 'node-fetch';

const CONFLUENCE_API = 'https://confluence-mcp-six.vercel.app/api/mcp';
const BEARER_TOKEN = 'your-bearer-token-here';

async function renderMermaid(mermaidCode) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({ width: 1200, height: 800 });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
        <style>
          body {
            background: white;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        </style>
      </head>
      <body>
        <div class="mermaid">${mermaidCode}</div>
        <script>
          mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            themeVariables: {
              fontSize: '16px'
            }
          });
        </script>
      </body>
    </html>
  `;

  await page.setContent(html);
  await page.waitForSelector('.mermaid svg', { timeout: 5000 });

  const element = await page.$('.mermaid');
  const screenshot = await element.screenshot({ type: 'png' });

  await browser.close();
  return screenshot;
}

async function uploadToConfluence(pageId, imageBuffer, title) {
  const base64Data = imageBuffer.toString('base64');

  const response = await fetch(CONFLUENCE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BEARER_TOKEN}`
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Math.random(),
      method: 'tools/call',
      params: {
        name: 'upload_and_embed_document',
        arguments: {
          pageId: pageId,
          file: {
            name: `${title}.png`,
            data: base64Data,
            mimeType: 'image/png'
          },
          comment: `Mermaid diagram: ${title}`,
          width: 800,
          position: 'center'
        }
      }
    })
  });

  return await response.json();
}

// Usage
const mermaidCode = `
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
`;

const imageBuffer = await renderMermaid(mermaidCode);
const result = await uploadToConfluence('264468461093805', imageBuffer, 'workflow-diagram');

console.log('✅ Diagram uploaded:', result);
```

---

## Complete Examples

### Example 1: Create Page with Embedded Diagram

```javascript
// Complete workflow: Create page and embed diagram

const CONFLUENCE_API = 'https://confluence-mcp-six.vercel.app/api/mcp';
const BEARER_TOKEN = 'pk_NTWl4DhbqsJ2xflMRtT9rhRJEj8FxQW-YCMPABtapFQ';

async function createPageWithDiagram() {
  // Step 1: Create page
  const createResponse = await fetch(CONFLUENCE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BEARER_TOKEN}`
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'create_page',
        arguments: {
          title: 'System Architecture Documentation',
          content: '<h1>Architecture Overview</h1><p>This page contains our system architecture diagrams.</p>'
        }
      }
    })
  });

  const createResult = await createResponse.json();

  // Extract page data from response
  const pageData = createResult.result.result;
  const pageId = pageData.id;
  const pageUrl = `${pageData._links.base}${pageData._links.webui}`;

  console.log('✅ Page created successfully!');
  console.log(`   Page ID: ${pageId}`);
  console.log(`   Title: ${pageData.title}`);
  console.log(`   Space: ${pageData.space.key}`);
  console.log(`   URL: ${pageUrl}`);
  console.log(`   Version: ${pageData.version.number}`);

  // Step 2: Generate and upload diagram
  const imageBuffer = await renderMermaid(`
    graph LR
      A[Client] --> B[Load Balancer]
      B --> C[Web Server 1]
      B --> D[Web Server 2]
      C --> E[Database]
      D --> E
  `);

  const base64Data = imageBuffer.toString('base64');

  const uploadResponse = await fetch(CONFLUENCE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BEARER_TOKEN}`
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'upload_and_embed_document',
        arguments: {
          pageId: pageId,
          file: {
            name: 'architecture.png',
            data: base64Data,
            mimeType: 'image/png'
          },
          width: 1000,
          position: 'center'
        }
      }
    })
  });

  const uploadResult = await uploadResponse.json();

  // Extract upload data from response
  const uploadData = uploadResult.result.result;

  console.log('✅ Diagram embedded successfully!');
  console.log(`   Filename: ${uploadData.filename}`);
  console.log(`   Size: ${(uploadData.fileSize / 1024).toFixed(2)} KB`);
  console.log(`   Media Type: ${uploadData.mediaType}`);
  console.log(`   Page Version: ${uploadData.version}`);
  console.log(`   Download: ${uploadData.downloadUrl}`);
  console.log(`   View Page: ${uploadData.pageUrl}`);

  return {
    pageId: pageId,
    pageUrl: pageUrl,
    attachmentId: uploadData.attachmentId,
    downloadUrl: uploadData.downloadUrl
  };
}

createPageWithDiagram();
```

### Example 2: Multiple Diagrams in One Page

```javascript
async function createPageWithMultipleDiagrams(pageId) {
  const diagrams = [
    {
      name: 'system-overview',
      mermaid: `
        graph TD
          A[Users] --> B[Application]
          B --> C[Database]
          B --> D[Cache]
      `
    },
    {
      name: 'deployment-flow',
      mermaid: `
        graph LR
          A[Git Push] --> B[CI Pipeline]
          B --> C[Build]
          C --> D[Test]
          D --> E[Deploy]
      `
    },
    {
      name: 'data-flow',
      mermaid: `
        sequenceDiagram
          User->>API: Request
          API->>DB: Query
          DB-->>API: Data
          API-->>User: Response
      `
    }
  ];

  for (const diagram of diagrams) {
    const imageBuffer = await renderMermaid(diagram.mermaid);
    const base64Data = imageBuffer.toString('base64');

    await fetch(CONFLUENCE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEARER_TOKEN}`
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Math.random(),
        method: 'tools/call',
        params: {
          name: 'upload_and_embed_document',
          arguments: {
            pageId: pageId,
            file: {
              name: `${diagram.name}.png`,
              data: base64Data,
              mimeType: 'image/png'
            },
            comment: diagram.name,
            width: 800,
            position: 'center'
          }
        }
      })
    });

    console.log(`✅ Embedded: ${diagram.name}`);
  }
}
```

### Example 3: Mermaid Diagram Types

#### Flowchart

```mermaid
graph TD
    Start([Start]) --> Input[/User Input/]
    Input --> Process[Process Data]
    Process --> Decision{Valid?}
    Decision -->|Yes| Success[Success]
    Decision -->|No| Error[Error]
    Error --> Input
    Success --> End([End])
```

#### Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant D as Database

    U->>F: Login Request
    F->>A: POST /auth/login
    A->>D: Verify Credentials
    D-->>A: User Data
    A-->>F: JWT Token
    F-->>U: Login Success
```

#### Class Diagram

```mermaid
classDiagram
    class User {
        +String username
        +String email
        +login()
        +logout()
    }

    class Order {
        +String orderId
        +Date createdAt
        +calculateTotal()
    }

    class Product {
        +String name
        +Float price
        +getDetails()
    }

    User "1" --> "*" Order
    Order "*" --> "*" Product
```

#### State Diagram

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> InReview: Submit
    InReview --> Approved: Approve
    InReview --> Rejected: Reject
    Rejected --> Draft: Revise
    Approved --> Published: Publish
    Published --> [*]
```

#### Entity Relationship Diagram

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER {
        string name
        string email
        string phone
    }
    ORDER {
        int orderId
        date orderDate
        float total
    }
    LINE-ITEM {
        int quantity
        float price
    }
```

---

## Troubleshooting

### Common Issues

#### 1. "File parameter must be an object"

**Problem**: Passing base64 string directly instead of object

```json
// ❌ Wrong
{
  "file": "iVBORw0KGgoAAAANSUhEUg..."
}

// ✅ Correct
{
  "file": {
    "name": "diagram.png",
    "data": "iVBORw0KGgoAAAANSUhEUg...",
    "mimeType": "image/png"
  }
}
```

#### 2. "Space key required"

**Problem**: No space configured in Project Registry

**Solution**:
1. Add space to Project Registry config
2. Or pass `spaceKey` explicitly:

```json
{
  "arguments": {
    "spaceKey": "SA1",
    "title": "My Page",
    "content": "..."
  }
}
```

#### 3. "401 Unauthorized"

**Problem**: Missing or invalid Bearer token

**Solution**: Check Authorization header:

```bash
Authorization: Bearer pk_NTWl4DhbqsJ2xflMRtT9rhRJEj8FxQW-YCMPABtapFQ
```

#### 4. "Image not displaying"

**Problem**: Invalid base64 encoding or MIME type

**Solution**:
- Verify base64 encoding is correct
- Match MIME type to file type:
  - PNG: `image/png`
  - JPEG: `image/jpeg`
  - SVG: `image/svg+xml`

#### 5. Mermaid rendering fails

**Problem**: Invalid Mermaid syntax

**Solution**: Test your diagram at https://mermaid.live/ first

### Debug Tips

#### Check Page ID

```bash
curl -X POST https://confluence-mcp-six.vercel.app/api/mcp \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_content_by_space_and_title",
      "arguments": {
        "title": "My Page Title"
      }
    }
  }'
```

#### Verify Image Upload

```bash
# List page attachments
curl -X POST https://confluence-mcp-six.vercel.app/api/mcp \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_page_attachments",
      "arguments": {
        "pageId": "123456789"
      }
    }
  }'
```

---

## Best Practices

### 1. Diagram Organization

- Use consistent naming: `architecture-{component}.png`
- Add descriptive comments when uploading
- Group related diagrams on the same page
- Use labels to categorize diagram pages

### 2. Image Optimization

- Keep diagrams under 2 MB
- Use PNG for diagrams with text
- Use JPEG for photos/screenshots
- Consider SVG for scalable diagrams

### 3. Page Structure

```html
<h1>Architecture Documentation</h1>

<h2>Overview</h2>
<p>High-level system overview...</p>
<!-- Embed system overview diagram here -->

<h2>Components</h2>
<p>Detailed component architecture...</p>
<!-- Embed component diagrams here -->

<h2>Data Flow</h2>
<p>How data moves through the system...</p>
<!-- Embed sequence diagrams here -->
```

### 4. Version Control

- Add version numbers to diagram names
- Keep old diagrams as attachments
- Document major changes in page history
- Use labels like `v1.0`, `v2.0` for tracking

---

## Resources

- **Confluence MCP API**: https://confluence-mcp-six.vercel.app/api/mcp
- **MCP Registry**: https://enhanced-context-mcp.vercel.app/api/mcp-registry
- **Project Registry**: https://project-registry-henna.vercel.app
- **Mermaid Documentation**: https://mermaid.js.org/
- **Mermaid Live Editor**: https://mermaid.live/
- **Test Result Example**: https://bounteous.jira.com/wiki/spaces/SA1/pages/264468461093805

---

**Last Updated**: October 27, 2025
**Version**: 2.0.0
**Status**: ✅ Fully tested and production-ready
