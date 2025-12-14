'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function DocsPage() {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'Confluence MCP Server API',
      version: '2.0.0',
      description:
        'Confluence MCP Server - Serverless with Project Registry Integration. Provides comprehensive Confluence integration with page management, document operations, templates, and JIRA integration.',
      contact: {
        name: 'Confluence MCP',
        url: 'https://confluence-mcp-six.vercel.app',
      },
    },
    servers: [
      {
        url: 'https://confluence-mcp-six.vercel.app',
        description: 'Production Server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Local Development',
      },
    ],
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
    paths: {
      '/api/health': {
        get: {
          summary: 'Health Check',
          description: 'Check if the API is running and healthy',
          operationId: 'healthCheck',
          tags: ['System'],
          security: [],
          responses: {
            '200': {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'healthy' },
                      version: { type: 'string', example: '2.0.0' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/mcp': {
        post: {
          summary: 'Execute MCP Tool',
          description: 'Execute a Confluence MCP tool with provided arguments',
          operationId: 'executeTool',
          tags: ['MCP Tools'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ToolExecutionRequest',
                },
                examples: {
                  create_page: {
                    summary: 'Create a Page',
                    value: {
                      tool: 'create_page',
                      arguments: {
                        title: 'My New Page',
                        content: '<h1>Hello World</h1><p>Content here</p>',
                      },
                    },
                  },
                  search: {
                    summary: 'Search Content',
                    value: {
                      tool: 'search',
                      arguments: {
                        cql: 'type=page AND text~"API"',
                        limit: 10,
                      },
                    },
                  },
                  get_spaces: {
                    summary: 'List Spaces',
                    value: {
                      tool: 'get_spaces',
                      arguments: {},
                    },
                  },
                  upload_attachment: {
                    summary: 'Upload and Embed Attachment',
                    value: {
                      tool: 'upload_and_embed_document',
                      arguments: {
                        pageId: '12345678',
                        file: {
                          name: 'diagram.png',
                          data: 'base64_encoded_data',
                          mimeType: 'image/png',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Tool executed successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ToolExecutionResponse' },
                },
              },
            },
            '400': {
              description: 'Bad request - invalid tool or arguments',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for authentication. Register your project in the Project Registry to get an API key.',
        },
      },
      schemas: {
        ToolExecutionRequest: {
          type: 'object',
          required: ['tool'],
          properties: {
            tool: {
              type: 'string',
              description: 'Name of the tool to execute',
              enum: [
                'get_spaces',
                'get_space',
                'get_space_permissions',
                'get_content_by_id',
                'get_content_by_space_and_title',
                'search',
                'create_page',
                'update_page',
                'get_page_children',
                'get_page_history',
                'add_page_labels',
                'get_page_attachments',
                'upload_document',
                'update_document',
                'delete_document',
                'list_documents',
                'embed_existing_attachment',
                'upload_and_embed_document',
                'upload_and_embed_attachment',
                'create_folder',
                'get_folder_contents',
                'move_page_to_folder',
                'create_page_template',
                'get_page_templates',
                'apply_page_template',
                'update_page_template',
                'get_pages_by_label',
                'insert_macro',
                'update_macro',
                'get_page_macros',
                'link_page_to_jira_issue',
                'insert_jira_macro',
              ],
            },
            arguments: {
              type: 'object',
              description: 'Tool-specific arguments',
            },
          },
        },
        ToolExecutionResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            tool: { type: 'string' },
            result: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                error: 'Authentication required. Provide X-API-Key header.',
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'System', description: 'System health and status endpoints' },
      { name: 'MCP Tools', description: 'Confluence MCP tool execution - 32 tools available' },
    ],
  };

  return (
    <div className="min-h-screen">
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Confluence MCP Server</h1>
            <p className="text-blue-100">v2.0.0 - 32 Tools for Confluence Integration</p>
          </div>
          <div className="space-x-4">
            <a href="/" className="text-blue-100 hover:text-white">Home</a>
            <a href="https://project-registry-henna.vercel.app/docs" className="text-blue-100 hover:text-white">All MCPs</a>
          </div>
        </div>
      </div>
      <SwaggerUI spec={spec} />
    </div>
  );
}
