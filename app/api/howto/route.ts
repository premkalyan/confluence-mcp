/**
 * Confluence MCP - How To Guide Endpoint
 * Returns JSON documentation about formats, tools, and usage
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const howto = {
    service: "Confluence MCP",
    version: "1.0.0",
    endpoint: "https://confluence-mcp-six.vercel.app/api/mcp",

    authentication: {
      method: "Bearer Token",
      header: "Authorization: Bearer {api_key}",
      how_to_get_key: [
        "1. Go to Project Registry: https://project-registry-henna.vercel.app/dashboard",
        "2. Register your project with Confluence credentials (URL, email, API token, spaceKey)",
        "3. Copy your API key (pk_xxx...)",
        "4. Use as Bearer token in Authorization header"
      ],
      registration_endpoint: "POST https://project-registry-henna.vercel.app/api/projects/register",
      registration_body: {
        projectId: "your-project-id",
        projectName: "Your Project Name",
        configs: {
          confluence: {
            url: "https://yourcompany.atlassian.net/wiki",
            email: "your-email@company.com",
            api_token: "your-confluence-api-token",
            spaceKey: "MYSPACE"
          }
        }
      }
    },

    rich_text_format: {
      name: "Confluence Storage Format (XHTML)",
      important: "Confluence uses XHTML storage format, NOT Markdown. Send HTML tags for formatting.",
      description: "Confluence storage format is XHTML-based. Use standard HTML tags for formatting.",

      supported_tags: {
        headers: "<h1>, <h2>, <h3>, <h4>, <h5>, <h6>",
        text_formatting: "<strong> (bold), <em> (italic), <u> (underline), <s> (strikethrough)",
        lists: "<ul><li>item</li></ul> (bullet), <ol><li>item</li></ol> (numbered)",
        links: "<a href='url'>text</a>",
        tables: "<table><tr><th>header</th></tr><tr><td>cell</td></tr></table>",
        code: "<code>inline</code>, <ac:structured-macro ac:name='code'>...</ac:structured-macro> (block)",
        images: "<ac:image><ri:attachment ri:filename='image.png'/></ac:image>",
        panels: "<ac:structured-macro ac:name='panel'>...</ac:structured-macro>",
        info_boxes: "<ac:structured-macro ac:name='info'>...</ac:structured-macro>"
      },

      example: {
        description: "Create a page with formatted content",
        content: `<h1>Policy Document</h1>
<p>This is a <strong>critical</strong> policy with <em>important</em> details.</p>
<h2>Requirements</h2>
<ul>
  <li>First requirement</li>
  <li>Second requirement</li>
</ul>
<h2>Details Table</h2>
<table>
  <tr>
    <th>Field</th>
    <th>Value</th>
  </tr>
  <tr>
    <td>Severity</td>
    <td><strong>CRITICAL</strong></td>
  </tr>
</table>
<p>For more info, see <a href="https://example.com">documentation</a>.</p>`
      },

      macros: {
        description: "Confluence macros for advanced content",
        code_block: {
          syntax: `<ac:structured-macro ac:name="code">
  <ac:parameter ac:name="language">javascript</ac:parameter>
  <ac:plain-text-body><![CDATA[const x = 1;]]></ac:plain-text-body>
</ac:structured-macro>`,
          description: "Code block with syntax highlighting"
        },
        info_panel: {
          syntax: `<ac:structured-macro ac:name="info">
  <ac:rich-text-body>
    <p>This is an info message</p>
  </ac:rich-text-body>
</ac:structured-macro>`,
          description: "Blue info panel"
        },
        warning_panel: {
          syntax: `<ac:structured-macro ac:name="warning">
  <ac:rich-text-body>
    <p>This is a warning</p>
  </ac:rich-text-body>
</ac:structured-macro>`,
          description: "Yellow warning panel"
        },
        note_panel: {
          syntax: `<ac:structured-macro ac:name="note">
  <ac:rich-text-body>
    <p>This is a note</p>
  </ac:rich-text-body>
</ac:structured-macro>`,
          description: "Yellow note panel"
        },
        toc: {
          syntax: `<ac:structured-macro ac:name="toc"/>`,
          description: "Table of contents"
        },
        jira_issue: {
          syntax: `<ac:structured-macro ac:name="jira">
  <ac:parameter ac:name="key">PROJ-123</ac:parameter>
</ac:structured-macro>`,
          description: "Embed Jira issue"
        }
      }
    },

    tools: {
      page_operations: [
        {
          name: "get_content_by_id",
          description: "Get page content by ID (returns body.storage by default)",
          parameters: {
            id: "Page ID (required)",
            expand: "Optional array: ['body.storage', 'version', 'ancestors']"
          }
        },
        {
          name: "get_content_by_space_and_title",
          description: "Find page by space key and title",
          parameters: {
            spaceKey: "Space key (required)",
            title: "Page title (required)"
          }
        },
        {
          name: "create_page",
          description: "Create new page with XHTML content",
          parameters: {
            spaceKey: "Space key (required)",
            title: "Page title (required)",
            content: "XHTML storage format content (required)",
            parentId: "Optional parent page ID"
          }
        },
        {
          name: "update_page",
          description: "Update existing page",
          parameters: {
            pageId: "Page ID (required)",
            title: "New title (required)",
            content: "New XHTML content (required)",
            version: "Current version number (required)"
          }
        },
        {
          name: "get_page_children",
          description: "Get child pages (returns body.storage by default)",
          parameters: {
            pageId: "Parent page ID (required)"
          }
        },
        {
          name: "get_pages_by_label",
          description: "Find pages with specific label",
          parameters: {
            label: "Label name (required)"
          }
        }
      ],
      space_operations: [
        {
          name: "get_spaces",
          description: "List all spaces"
        },
        {
          name: "get_space",
          description: "Get space details",
          parameters: {
            spaceKey: "Space key (required)"
          }
        }
      ],
      search: [
        {
          name: "search",
          description: "Search using CQL (Confluence Query Language)",
          parameters: {
            cql: "CQL query (required)",
            limit: "Max results (default: 25)"
          },
          note: "CQL may return 400 errors - use get_content_by_space_and_title as alternative"
        }
      ],
      attachments: [
        {
          name: "get_page_attachments",
          description: "List attachments on a page",
          parameters: {
            pageId: "Page ID (required)"
          }
        },
        {
          name: "upload_and_embed_attachment",
          description: "Upload file and embed in page",
          parameters: {
            pageId: "Page ID (required)",
            filename: "File name (required)",
            content: "Base64 encoded content (required)"
          }
        }
      ],
      labels: [
        {
          name: "add_page_labels",
          description: "Add labels to page",
          parameters: {
            pageId: "Page ID (required)",
            labels: "Array of label names (required)"
          }
        }
      ],
      macros: [
        {
          name: "insert_macro",
          description: "Insert Confluence macro into page",
          parameters: {
            pageId: "Page ID (required)",
            macroName: "Macro name (required)",
            parameters: "Macro parameters object"
          }
        },
        {
          name: "insert_jira_macro",
          description: "Insert Jira issue macro",
          parameters: {
            pageId: "Page ID (required)",
            issueKey: "Jira issue key (required)"
          }
        }
      ]
    },

    request_format: {
      protocol: "JSON-RPC 2.0",
      example: {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "create_page",
          arguments: {
            spaceKey: "MYSPACE",
            title: "My Page Title",
            content: "<h1>Welcome</h1><p>This is <strong>formatted</strong> content.</p>"
          }
        }
      }
    },

    tips: [
      "Use XHTML tags for formatting - Markdown is NOT supported",
      "Always include <p> tags around paragraphs",
      "Tables need proper <table><tr><th>/<td> structure",
      "Use Confluence macros for advanced features (code blocks, panels, etc.)",
      "get_content_by_id now returns body content by default",
      "Include version number when updating pages to avoid conflicts",
      "CQL search may fail - use get_content_by_space_and_title as fallback"
    ],

    links: {
      documentation: "https://confluence-mcp-six.vercel.app/api/mcp",
      project_registry: "https://project-registry-henna.vercel.app",
      storage_format_reference: "https://developer.atlassian.com/cloud/confluence/storage-format/",
      confluence_api_docs: "https://developer.atlassian.com/cloud/confluence/rest/v1/"
    }
  };

  return NextResponse.json(howto);
}
