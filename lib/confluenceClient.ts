import axios, { AxiosInstance } from 'axios';

export interface ConfluenceConfig {
  url: string;
  username: string;
  apiToken: string;
}

export class ConfluenceClient {
  private baseUrl: string;
  private auth: { username: string; apiToken: string };
  private client: AxiosInstance;

  constructor(config: ConfluenceConfig) {
    this.baseUrl = config.url;
    this.auth = { username: config.username, apiToken: config.apiToken };

    // Create axios instance with base configuration
    this.client = axios.create({
      baseURL: `${this.baseUrl}/rest/api`,
      headers: this.getAuthHeader(),
      timeout: 30000
    });
  }

  private getAuthHeader() {
    const token = Buffer.from(`${this.auth.username}:${this.auth.apiToken}`).toString('base64');
    return { Authorization: `Basic ${token}` };
  }

  async getSpaces(params: Record<string, unknown> = {}) {
    const queryParams = new URLSearchParams(params as Record<string, string>).toString();
    const response = await this.client.get(`/space?${queryParams}`);
    return response.data;
  }

  async getSpace(spaceKey: string) {
    const response = await this.client.get(`/space/${spaceKey}`);
    return response.data;
  }

  async getContentById(id: string, expand: string[] = []) {
    const expandParam = expand.length ? `?expand=${expand.join(',')}` : '';
    const response = await this.client.get(`/content/${id}${expandParam}`);
    return response.data;
  }

  async getContentBySpaceAndTitle(spaceKey: string, title: string) {
    const params = new URLSearchParams({
      spaceKey,
      title,
      expand: 'body.storage,version'
    }).toString();
    const response = await this.client.get(`/content?${params}`);
    return response.data;
  }

  async search(cql: string, limit = 10) {
    const params = new URLSearchParams({
      cql,
      limit: limit.toString()
    }).toString();
    const response = await this.client.get(`/search?${params}`);
    return response.data;
  }

  async createPage(spaceKey: string, title: string, content: string, parentId?: string) {
    const body = {
      type: 'page',
      title,
      space: { key: spaceKey },
      body: {
        storage: {
          value: content,
          representation: 'storage'
        }
      },
      ...(parentId && { ancestors: [{ id: parentId }] })
    };
    const response = await this.client.post('/content', body, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  }

  async updatePage(pageId: string, title: string, content: string, version: number) {
    const body = {
      version: { number: version + 1 },
      title,
      type: 'page',
      body: {
        storage: {
          value: content,
          representation: 'storage'
        }
      }
    };
    const response = await this.client.put(`/content/${pageId}`, body, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  }

  async getPageAttachments(pageId: string) {
    const response = await this.client.get(`/content/${pageId}/child/attachment`);
    return response.data;
  }

  async getPageChildren(pageId: string) {
    const response = await this.client.get(`/content/${pageId}/child/page`);
    return response.data;
  }

  async addPageLabels(pageId: string, labels: string[]) {
    const labelObjects = labels.map(label => ({ prefix: 'global', name: label }));
    const response = await this.client.post(`/content/${pageId}/label`, labelObjects, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  }

  // Document/Attachment operations
  async uploadDocument(pageId: string, file: { name: string; data: string | Buffer; mimeType: string }, comment?: string) {
    // Handle both base64 string and Buffer
    const buffer = typeof file.data === 'string'
      ? Buffer.from(file.data, 'base64')
      : file.data;

    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', buffer, { filename: file.name, contentType: file.mimeType });
    form.append('minorEdit', 'true');
    if (comment) {
      form.append('comment', comment);
    }

    const response = await this.client.post(`/content/${pageId}/child/attachment`, form, {
      headers: {
        ...form.getHeaders(),
        'X-Atlassian-Token': 'no-check'
      }
    });
    return response.data;
  }

  async updateDocument(pageId: string, attachmentId: string, file: { name: string; data: Buffer; mimeType: string }, comment?: string) {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', file.data, { filename: file.name, contentType: file.mimeType });
    if (comment) {
      form.append('comment', comment);
    }
    const response = await this.client.post(`/content/${pageId}/child/attachment/${attachmentId}/data`, form, {
      headers: { ...form.getHeaders() }
    });
    return response.data;
  }

  async deleteDocument(attachmentId: string) {
    const response = await this.client.delete(`/content/${attachmentId}`);
    return response.data;
  }

  async listDocuments(spaceKey: string, type = 'attachment', limit = 25) {
    const params = new URLSearchParams({
      spaceKey,
      type,
      limit: limit.toString()
    }).toString();
    const response = await this.client.get(`/content?${params}`);
    return response.data;
  }

  // Folder/Page hierarchy operations
  async createFolder(spaceKey: string, title: string, parentId?: string) {
    // Folders are just pages in Confluence
    return this.createPage(spaceKey, title, '<p>This is a folder page.</p>', parentId);
  }

  async getFolderContents(pageId: string, expand: string[] = ['version', 'body.storage']) {
    const expandParam = expand.length ? `&expand=${expand.join(',')}` : '';
    const response = await this.client.get(`/content/${pageId}/child/page?limit=100${expandParam}`);
    return response.data;
  }

  async movePageToFolder(pageId: string, newParentId: string, currentVersion: number) {
    const body = {
      version: { number: currentVersion + 1 },
      ancestors: [{ id: newParentId }]
    };
    const response = await this.client.put(`/content/${pageId}`, body, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  }

  // Template operations
  async createPageTemplate(spaceKey: string, name: string, content: string, description?: string) {
    const body = {
      type: 'page',
      title: name,
      space: { key: spaceKey },
      body: {
        storage: {
          value: content,
          representation: 'storage'
        }
      },
      metadata: {
        labels: [{ prefix: 'global', name: 'template' }]
      },
      ...(description && { description: { plain: { value: description, representation: 'plain' } } })
    };
    const response = await this.client.post('/content/blueprint/instance', body, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  }

  async getPageTemplates(spaceKey: string) {
    const cql = `space = "${spaceKey}" AND label = "template"`;
    return this.search(cql, 50);
  }

  async applyPageTemplate(templateId: string, spaceKey: string, title: string, parentId?: string) {
    const template = await this.getContentById(templateId, ['body.storage']);
    const content = (template.body?.storage?.value as string) || '';
    return this.createPage(spaceKey, title, content, parentId);
  }

  async updatePageTemplate(templateId: string, name: string, content: string, version: number) {
    return this.updatePage(templateId, name, content, version);
  }

  // Label operations
  async getPagesByLabel(spaceKey: string, label: string, limit = 25) {
    const cql = `space = "${spaceKey}" AND label = "${label}"`;
    return this.search(cql, limit);
  }

  // History operations
  async getPageHistory(pageId: string, limit = 10) {
    const params = new URLSearchParams({
      limit: limit.toString()
    }).toString();
    const response = await this.client.get(`/content/${pageId}/history?${params}`);
    return response.data;
  }

  // Macro operations
  async insertMacro(pageId: string, macroName: string, parameters: Record<string, unknown>, body?: string) {
    const page = await this.getContentById(pageId, ['body.storage', 'version']);
    const currentContent = (page.body?.storage?.value as string) || '';
    const version = (page.version?.number as number) || 1;

    const paramString = Object.entries(parameters)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    const macroHtml = body
      ? `<ac:structured-macro ac:name="${macroName}" ${paramString}><ac:rich-text-body>${body}</ac:rich-text-body></ac:structured-macro>`
      : `<ac:structured-macro ac:name="${macroName}" ${paramString}/>`;

    const newContent = currentContent + macroHtml;

    return this.updatePage(pageId, page.title as string, newContent, version);
  }

  async updateMacro(pageId: string, oldMacroName: string, newMacroName: string, parameters: Record<string, unknown>) {
    const page = await this.getContentById(pageId, ['body.storage', 'version']);
    const currentContent = (page.body?.storage?.value as string) || '';
    const version = (page.version?.number as number) || 1;

    const paramString = Object.entries(parameters)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    const regex = new RegExp(`<ac:structured-macro ac:name="${oldMacroName}"[^>]*>.*?</ac:structured-macro>`, 'g');
    const newContent = currentContent.replace(regex, `<ac:structured-macro ac:name="${newMacroName}" ${paramString}/>`);

    return this.updatePage(pageId, page.title as string, newContent, version);
  }

  async getPageMacros(pageId: string) {
    const page = await this.getContentById(pageId, ['body.storage']);
    const content = (page.body?.storage?.value as string) || '';

    const macroRegex = /<ac:structured-macro ac:name="([^"]+)"[^>]*>/g;
    const macros = [];
    let match;

    while ((match = macroRegex.exec(content)) !== null) {
      macros.push({ name: match[1], position: match.index });
    }

    return { macros, count: macros.length };
  }

  // JIRA integration
  async linkPageToJiraIssue(pageId: string, issueKey: string) {
    const page = await this.getContentById(pageId, ['body.storage', 'version']);
    const currentContent = (page.body?.storage?.value as string) || '';
    const version = (page.version?.number as number) || 1;

    const jiraLink = `<p><a href="${this.baseUrl.replace('confluence', 'jira')}/browse/${issueKey}">${issueKey}</a></p>`;
    const newContent = currentContent + jiraLink;

    return this.updatePage(pageId, page.title as string, newContent, version);
  }

  async insertJiraMacro(pageId: string, jqlQuery: string, displayOptions: Record<string, unknown> = {}) {
    const parameters = {
      jqlQuery,
      ...displayOptions
    };
    return this.insertMacro(pageId, 'jira', parameters);
  }

  // Permissions
  async getSpacePermissions(spaceKey: string) {
    const response = await this.client.get(`/space/${spaceKey}/permission`);
    return response.data;
  }

  // Attachment embedding
  async embedExistingAttachment(
    pageId: string,
    attachmentId: string,
    attachmentName: string,
    width: number = 800,
    position: 'inline' | 'center' | 'left' | 'right' = 'inline'
  ) {
    const page = await this.getContentById(pageId, ['body.storage', 'version']);
    const currentContent = (page.body?.storage?.value as string) || '';
    const version = (page.version?.number as number) || 1;

    // Generate image macro with width and positioning
    let embedHtml = `<ac:image ac:width="${width}"><ri:attachment ri:filename="${attachmentName}"/></ac:image>`;

    // Wrap with positioning if needed
    switch (position) {
      case 'center':
        embedHtml = `<p style="text-align: center;">${embedHtml}</p>`;
        break;
      case 'left':
        embedHtml = `<div style="float: left; margin-right: 10px;">${embedHtml}</div>`;
        break;
      case 'right':
        embedHtml = `<div style="float: right; margin-left: 10px;">${embedHtml}</div>`;
        break;
      default:
        // inline - no wrapper needed
        break;
    }

    const newContent = currentContent + '\n\n' + embedHtml;

    return this.updatePage(pageId, page.title as string, newContent, version);
  }

  async uploadAndEmbedDocument(
    pageId: string,
    args: {
      file?: { name: string; data: string | Buffer; mimeType: string };
      fileUrl?: string;
      filename?: string;
      comment?: string;
      width?: number;
      position?: 'inline' | 'center' | 'left' | 'right';
    }
  ) {
    let buffer: Buffer;
    let filename: string;
    let mimeType: string;
    let blobUrl: string | null = null;

    try {
      // Handle both base64 and blob URL patterns
      if (args.file) {
        // Pattern A: Base64 data (for HTTP clients and small files)
        buffer = typeof args.file.data === 'string'
          ? Buffer.from(args.file.data, 'base64')
          : args.file.data;
        filename = args.file.name;
        mimeType = args.file.mimeType;
      } else if (args.fileUrl) {
        // Pattern B: Blob URL (for cloud-to-cloud and large files)
        const response = await fetch(args.fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
        }
        buffer = Buffer.from(await response.arrayBuffer());
        filename = args.filename || 'document.png';
        mimeType = response.headers.get('content-type') || 'application/octet-stream';
        blobUrl = args.fileUrl;
      } else {
        throw new Error('Either file or fileUrl must be provided');
      }

      // Upload to Confluence with proper FormData
      const uploadResult = await this.uploadDocument(
        pageId,
        { name: filename, data: buffer, mimeType },
        args.comment
      );

      const attachmentId = uploadResult.results?.[0]?.id;
      if (!attachmentId) {
        throw new Error('Upload succeeded but no attachment ID returned');
      }

      // Embed the uploaded attachment with width and position
      await this.embedExistingAttachment(
        pageId,
        attachmentId,
        filename,
        args.width || 800,
        args.position || 'center'
      );

      // Cleanup blob if it was from Vercel Blob Storage
      if (blobUrl && blobUrl.includes('vercel-storage.com')) {
        try {
          const { del } = await import('@vercel/blob');
          await del(blobUrl);
        } catch (cleanupError) {
          console.error('Blob cleanup failed:', cleanupError);
          // Don't fail the whole operation if cleanup fails
        }
      }

      return {
        success: true,
        attachmentId,
        filename,
        message: `Successfully uploaded and embedded ${filename}`
      };
    } catch (error) {
      // Cleanup blob on error
      if (blobUrl && blobUrl.includes('vercel-storage.com')) {
        try {
          const { del } = await import('@vercel/blob');
          await del(blobUrl);
        } catch (cleanupError) {
          console.error('Blob cleanup on error failed:', cleanupError);
        }
      }
      throw error;
    }
  }

  async uploadAndEmbedAttachment(
    pageId: string,
    args: {
      file?: { name: string; data: string | Buffer; mimeType: string };
      fileUrl?: string;
      filename?: string;
      comment?: string;
      width?: number;
      position?: 'inline' | 'center' | 'left' | 'right';
    }
  ) {
    return this.uploadAndEmbedDocument(pageId, args);
  }
}
