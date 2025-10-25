const PROJECT_REGISTRY_URL = process.env.PROJECT_REGISTRY_URL;

export interface ConfluenceCredentials {
  url: string;
  username: string;
  apiToken: string;
}

export async function getConfluenceCredentials(apiKey: string): Promise<ConfluenceCredentials> {
  if (!PROJECT_REGISTRY_URL) {
    throw new Error('PROJECT_REGISTRY_URL environment variable is not configured');
  }

  const response = await fetch(`${PROJECT_REGISTRY_URL}/api/project?apiKey=${apiKey}`);

  if (!response.ok) {
    throw new Error('Invalid API key or project not found');
  }

  const { project } = await response.json();

  if (!project.configs?.confluence) {
    throw new Error('Confluence not configured for this project');
  }

  return {
    url: project.configs.confluence.baseUrl,
    username: project.configs.confluence.email,
    apiToken: project.configs.confluence.apiToken
  };
}
