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
        result = await confluence.listDocuments(args.spaceKey, args.type, args.limit);
        break;

      case 'create_folder':
        result = await confluence.createFolder(args.spaceKey, args.title, args.parentId);
        break;

      case 'get_folder_contents':
        result = await confluence.getFolderContents(args.pageId, args.expand);
        break;

      case 'move_page_to_folder':
        result = await confluence.movePageToFolder(args.pageId, args.newParentId, args.currentVersion);
        break;

      case 'create_page_template':
        result = await confluence.createPageTemplate(args.spaceKey, args.name, args.content, args.description);
        break;

      case 'get_page_templates':
        result = await confluence.getPageTemplates(args.spaceKey);
        break;

      case 'apply_page_template':
        result = await confluence.applyPageTemplate(args.templateId, args.spaceKey, args.title, args.parentId);
        break;

      case 'update_page_template':
        result = await confluence.updatePageTemplate(args.templateId, args.name, args.content, args.version);
        break;

      case 'get_pages_by_label':
        result = await confluence.getPagesByLabel(args.spaceKey, args.label, args.limit);
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
        result = await confluence.getSpacePermissions(args.spaceKey);
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
    version: '2.0.0',
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
      'add_page_labels',
      'upload_document',
      'update_document',
      'delete_document',
      'list_documents',
      'create_folder',
      'get_folder_contents',
      'move_page_to_folder',
      'create_page_template',
      'get_page_templates',
      'apply_page_template',
      'update_page_template',
      'get_pages_by_label',
      'get_page_history',
      'insert_macro',
      'update_macro',
      'get_page_macros',
      'link_page_to_jira_issue',
      'insert_jira_macro',
      'get_space_permissions',
      'embed_existing_attachment',
      'upload_and_embed_document',
      'upload_and_embed_attachment'
    ],
    usage: 'POST to this endpoint with tool name and arguments'
  });
}
