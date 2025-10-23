import { NextRequest, NextResponse } from 'next/server';
import { getConfluenceCredentials } from '@/lib/projectRegistry';
import { ConfluenceClient } from '@/lib/confluenceClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    const { tool, arguments: args } = await request.json();

    if (!tool) {
      return NextResponse.json({ error: 'Tool name required' }, { status: 400 });
    }

    // Get credentials from Project Registry
    const credentials = await getConfluenceCredentials(apiKey);

    // Create Confluence client
    const confluence = new ConfluenceClient(credentials);

    // Execute tool
    let result;
    switch (tool) {
      case 'get_spaces':
        result = await confluence.getSpaces(args.params || {});
        break;

      case 'get_space':
        result = await confluence.getSpace(args.spaceKey);
        break;

      case 'get_content_by_id':
        result = await confluence.getContentById(args.id, args.expand || []);
        break;

      case 'get_content_by_space_and_title':
        result = await confluence.getContentBySpaceAndTitle(args.spaceKey, args.title);
        break;

      case 'search':
        result = await confluence.search(args.cql, args.limit);
        break;

      case 'create_page':
        result = await confluence.createPage(args.spaceKey, args.title, args.content, args.parentId);
        break;

      case 'update_page':
        result = await confluence.updatePage(args.pageId, args.title, args.content, args.version);
        break;

      case 'get_page_attachments':
        result = await confluence.getPageAttachments(args.pageId);
        break;

      case 'get_page_children':
        result = await confluence.getPageChildren(args.pageId);
        break;

      case 'add_page_labels':
        result = await confluence.addPageLabels(args.pageId, args.labels);
        break;

      default:
        return NextResponse.json({ error: `Unknown tool: ${tool}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, tool, result });
  } catch (error) {
    console.error('MCP error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Confluence MCP Server',
    version: '1.0.0',
    availableTools: [
      'get_spaces',
      'get_space',
      'get_content_by_id',
      'get_content_by_space_and_title',
      'search',
      'create_page',
      'update_page',
      'get_page_attachments',
      'get_page_children',
      'add_page_labels'
    ],
    usage: 'POST to this endpoint with tool name and arguments'
  });
}
