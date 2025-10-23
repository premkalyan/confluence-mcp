import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Confluence MCP Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
}
