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
}
