const PROJECT_REGISTRY_URL = process.env.PROJECT_REGISTRY_URL || 'https://project-registry-henna.vercel.app';
const REGISTRY_AUTH_TOKEN = process.env.REGISTRY_AUTH_TOKEN;

export interface ConfluenceCredentials {
  url: string;
  username: string;
  apiToken: string;
  spaceKey?: string; // Default space from registry
}

export async function getConfluenceCredentials(apiKey: string): Promise<ConfluenceCredentials> {
  if (!PROJECT_REGISTRY_URL) {
    throw new Error('PROJECT_REGISTRY_URL environment variable is not configured');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };

  // Add registry auth token if available
  if (REGISTRY_AUTH_TOKEN) {
    headers['Authorization'] = `Bearer ${REGISTRY_AUTH_TOKEN}`;
  }

  const response = await fetch(`${PROJECT_REGISTRY_URL}/api/project?apiKey=${apiKey}`, {
    headers
  });

  if (!response.ok) {
    throw new Error('Invalid API key or project not found');
  }

  const { project } = await response.json();

  if (!project.configs?.confluence) {
    throw new Error('Confluence not configured for this project');
  }

  const confluenceConfig = project.configs.confluence;

  // Support multiple field name variations
  const url = confluenceConfig.baseUrl || confluenceConfig.url || confluenceConfig.host;
  const username = confluenceConfig.email || confluenceConfig.username || confluenceConfig.user;
  const apiToken = confluenceConfig.apiToken || confluenceConfig.token;
  const spaceKey = confluenceConfig.spaceKey || confluenceConfig.space;

  // Validate required fields
  if (!url) {
    throw new Error('Confluence URL not configured (expected baseUrl, url, or host)');
  }
  if (!username) {
    throw new Error('Confluence username not configured (expected email, username, or user)');
  }
  if (!apiToken) {
    throw new Error('Confluence API token not configured (expected apiToken or token)');
  }

  return {
    url,
    username,
    apiToken,
    spaceKey
  };
}
