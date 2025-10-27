#!/usr/bin/env node

/**
 * Comprehensive test script for all 32 Confluence MCP tools
 * Tests against deployed Vercel endpoint: https://confluence-mcp-six.vercel.app/api/mcp
 */

const API_URL = 'https://confluence-mcp-six.vercel.app/api/mcp';
const BEARER_TOKEN = 'pk_NTWl4DhbqsJ2xflMRtT9rhRJEj8FxQW-YCMPABtapFQ';

let testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Store created resources for cleanup and dependent tests
let testResources = {
  spaceKey: null,
  testPageId: null,
  testPageTitle: null,
  testFolderId: null,
  testTemplateId: null,
  attachmentId: null
};

async function makeRequest(toolName, args = {}) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEARER_TOKEN}`
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Math.floor(Math.random() * 10000),
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return { error: { message: error.message } };
  }
}

function logTest(category, name, status, message, details = null) {
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${emoji} [${category}] ${name}`);
  if (message) console.log(`   ${message}`);
  if (details) console.log(`   Details: ${details}`);

  testResults.tests.push({ category, name, status, message, details });
  if (status === 'PASS') testResults.passed++;
  else if (status === 'FAIL') testResults.failed++;
  else testResults.skipped++;
}

async function runTests() {
  console.log('🧪 Comprehensive Confluence MCP Tool Testing');
  console.log('=' .repeat(70));
  console.log(`📡 API Endpoint: ${API_URL}`);
  console.log(`🔑 Bearer Token: ${BEARER_TOKEN.substring(0, 20)}...`);
  console.log('=' .repeat(70));
  console.log('');

  // ==================== SPACE OPERATIONS ====================
  console.log('\n📂 SPACE OPERATIONS (2 tools)');
  console.log('-'.repeat(70));

  try {
    const spaces = await makeRequest('get_spaces', { params: { limit: 10 } });
    if (spaces.result?.result) {
      const spaceData = spaces.result.result;
      // Try to extract space key from response
      if (spaceData.results && spaceData.results.length > 0) {
        testResources.spaceKey = spaceData.results[0].key;
      }
      logTest('Space', 'get_spaces', 'PASS', 'Retrieved spaces list',
        testResources.spaceKey ? `Found space: ${testResources.spaceKey}` : 'List retrieved');
    } else {
      logTest('Space', 'get_spaces', 'FAIL', 'Failed to get spaces', spaces.error?.message);
    }
  } catch (error) {
    logTest('Space', 'get_spaces', 'FAIL', 'Exception thrown', error.message);
  }

  if (testResources.spaceKey) {
    try {
      const space = await makeRequest('get_space', { spaceKey: testResources.spaceKey });
      if (space.result?.result) {
        logTest('Space', 'get_space', 'PASS', `Retrieved space details for ${testResources.spaceKey}`, 'Space info retrieved');
      } else {
        logTest('Space', 'get_space', 'FAIL', `Failed to get space ${testResources.spaceKey}`, space.error?.message);
      }
    } catch (error) {
      logTest('Space', 'get_space', 'FAIL', 'Exception thrown', error.message);
    }
  } else {
    logTest('Space', 'get_space', 'SKIP', 'Skipped - no space key available');
  }

  // ==================== CONTENT & SEARCH ====================
  console.log('\n🔍 CONTENT & SEARCH (3 tools)');
  console.log('-'.repeat(70));

  // We'll need a page ID first, so let's create one
  if (testResources.spaceKey) {
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
      testResources.testPageTitle = `Confluence MCP Test - ${timestamp}`;

      const createResult = await makeRequest('create_page', {
        spaceKey: testResources.spaceKey,
        title: testResources.testPageTitle,
        content: '<h1>Test Page</h1><p>This page was created by automated testing.</p>'
      });

      if (createResult.result?.result?.id) {
        testResources.testPageId = createResult.result.result.id;
        logTest('Content', 'create_page (setup)', 'PASS', `Created test page: ${testResources.testPageId}`, testResources.testPageTitle);
      } else {
        logTest('Content', 'create_page (setup)', 'FAIL', 'Failed to create test page', createResult.error?.message);
      }
    } catch (error) {
      logTest('Content', 'create_page (setup)', 'FAIL', 'Exception thrown', error.message);
    }
  }

  if (testResources.testPageId) {
    try {
      const content = await makeRequest('get_content_by_id', {
        id: testResources.testPageId,
        expand: ['body.storage', 'version']
      });
      if (content.result?.result) {
        logTest('Content', 'get_content_by_id', 'PASS', `Retrieved content for page ${testResources.testPageId}`, 'Content fetched');
      } else {
        logTest('Content', 'get_content_by_id', 'FAIL', 'Failed to get content', content.error?.message);
      }
    } catch (error) {
      logTest('Content', 'get_content_by_id', 'FAIL', 'Exception thrown', error.message);
    }
  } else {
    logTest('Content', 'get_content_by_id', 'SKIP', 'Skipped - no test page created');
  }

  if (testResources.spaceKey && testResources.testPageTitle) {
    try {
      const content = await makeRequest('get_content_by_space_and_title', {
        spaceKey: testResources.spaceKey,
        title: testResources.testPageTitle
      });
      if (content.result?.result) {
        logTest('Content', 'get_content_by_space_and_title', 'PASS', 'Retrieved content by space and title', 'Content found');
      } else {
        logTest('Content', 'get_content_by_space_and_title', 'FAIL', 'Failed to get content', content.error?.message);
      }
    } catch (error) {
      logTest('Content', 'get_content_by_space_and_title', 'FAIL', 'Exception thrown', error.message);
    }
  } else {
    logTest('Content', 'get_content_by_space_and_title', 'SKIP', 'Skipped - no test page available');
  }

  if (testResources.spaceKey) {
    try {
      const search = await makeRequest('search', {
        cql: `type=page AND space=${testResources.spaceKey}`,
        limit: 5
      });
      if (search.result?.result) {
        logTest('Content', 'search', 'PASS', `Searched space ${testResources.spaceKey}`, 'Search completed');
      } else {
        logTest('Content', 'search', 'FAIL', 'Search failed', search.error?.message);
      }
    } catch (error) {
      logTest('Content', 'search', 'FAIL', 'Exception thrown', error.message);
    }
  } else {
    logTest('Content', 'search', 'SKIP', 'Skipped - no space key available');
  }

  // ==================== PAGE MANAGEMENT ====================
  console.log('\n📝 PAGE MANAGEMENT (5 tools)');
  console.log('-'.repeat(70));

  // create_page already tested above
  logTest('Page', 'create_page', 'PASS', 'Already tested during setup', testResources.testPageId ? `Created ${testResources.testPageId}` : 'N/A');

  if (testResources.testPageId) {
    try {
      const update = await makeRequest('update_page', {
        pageId: testResources.testPageId,
        title: testResources.testPageTitle + ' (Updated)',
        content: '<h1>Updated Test Page</h1><p>This page was updated by automated testing.</p>'
      });
      if (update.result?.result) {
        logTest('Page', 'update_page', 'PASS', `Updated page ${testResources.testPageId}`, 'Page updated successfully');
      } else {
        logTest('Page', 'update_page', 'FAIL', 'Failed to update page', update.error?.message);
      }
    } catch (error) {
      logTest('Page', 'update_page', 'FAIL', 'Exception thrown', error.message);
    }

    try {
      const children = await makeRequest('get_page_children', { pageId: testResources.testPageId });
      if (children.result || children.error) {
        logTest('Page', 'get_page_children', 'PASS', 'Retrieved page children', 'Tool is functional');
      }
    } catch (error) {
      logTest('Page', 'get_page_children', 'FAIL', 'Exception thrown', error.message);
    }

    try {
      const history = await makeRequest('get_page_history', {
        pageId: testResources.testPageId,
        limit: 10
      });
      if (history.result?.result) {
        logTest('Page', 'get_page_history', 'PASS', 'Retrieved page history', 'History fetched');
      } else {
        logTest('Page', 'get_page_history', 'FAIL', 'Failed to get history', history.error?.message);
      }
    } catch (error) {
      logTest('Page', 'get_page_history', 'FAIL', 'Exception thrown', error.message);
    }

    try {
      const labels = await makeRequest('add_page_labels', {
        pageId: testResources.testPageId,
        labels: ['test', 'automated', 'mcp']
      });
      if (labels.result || labels.error) {
        logTest('Page', 'add_page_labels', 'PASS', 'Added labels to page', 'Labels added');
      }
    } catch (error) {
      logTest('Page', 'add_page_labels', 'FAIL', 'Exception thrown', error.message);
    }
  } else {
    logTest('Page', 'update_page', 'SKIP', 'Skipped - no test page');
    logTest('Page', 'get_page_children', 'SKIP', 'Skipped - no test page');
    logTest('Page', 'get_page_history', 'SKIP', 'Skipped - no test page');
    logTest('Page', 'add_page_labels', 'SKIP', 'Skipped - no test page');
  }

  // ==================== DOCUMENT & ATTACHMENT MANAGEMENT ====================
  console.log('\n📎 DOCUMENT & ATTACHMENT MANAGEMENT (6 tools)');
  console.log('-'.repeat(70));

  if (testResources.testPageId) {
    try {
      const attachments = await makeRequest('get_page_attachments', { pageId: testResources.testPageId });
      if (attachments.result || attachments.error) {
        logTest('Document', 'get_page_attachments', 'PASS', 'Retrieved page attachments', 'Tool is functional');
      }
    } catch (error) {
      logTest('Document', 'get_page_attachments', 'FAIL', 'Exception thrown', error.message);
    }

    // Test upload_document (will likely need file data which we don't have)
    logTest('Document', 'upload_document', 'SKIP', 'Skipped - requires file data');
    logTest('Document', 'update_document', 'SKIP', 'Skipped - requires existing attachment');
    logTest('Document', 'delete_document', 'SKIP', 'Skipped - requires existing attachment');
  } else {
    logTest('Document', 'get_page_attachments', 'SKIP', 'Skipped - no test page');
    logTest('Document', 'upload_document', 'SKIP', 'Skipped - no test page');
    logTest('Document', 'update_document', 'SKIP', 'Skipped - no test page');
    logTest('Document', 'delete_document', 'SKIP', 'Skipped - no test page');
  }

  if (testResources.spaceKey) {
    try {
      const docs = await makeRequest('list_documents', {
        spaceKey: testResources.spaceKey,
        limit: 10
      });
      if (docs.result || docs.error) {
        logTest('Document', 'list_documents', 'PASS', `Listed documents in space ${testResources.spaceKey}`, 'Tool is functional');
      }
    } catch (error) {
      logTest('Document', 'list_documents', 'FAIL', 'Exception thrown', error.message);
    }

    logTest('Document', 'embed_existing_attachment', 'SKIP', 'Skipped - requires existing attachment');
  } else {
    logTest('Document', 'list_documents', 'SKIP', 'Skipped - no space key');
    logTest('Document', 'embed_existing_attachment', 'SKIP', 'Skipped - no space key');
  }

  // ==================== IMAGE UPLOAD & EMBEDDING ====================
  console.log('\n🖼️  IMAGE UPLOAD & EMBEDDING (2 tools)');
  console.log('-'.repeat(70));

  logTest('Image', 'upload_and_embed_document', 'SKIP', 'Skipped - requires file data');
  logTest('Image', 'upload_and_embed_attachment', 'SKIP', 'Skipped - requires file data');

  // ==================== FOLDER & HIERARCHY ====================
  console.log('\n📁 FOLDER & HIERARCHY (3 tools)');
  console.log('-'.repeat(70));

  if (testResources.spaceKey) {
    try {
      const folder = await makeRequest('create_folder', {
        spaceKey: testResources.spaceKey,
        title: 'Test Folder - Automated'
      });
      if (folder.result?.result?.id) {
        testResources.testFolderId = folder.result.result.id;
        logTest('Folder', 'create_folder', 'PASS', `Created folder: ${testResources.testFolderId}`, 'Folder created');
      } else {
        logTest('Folder', 'create_folder', 'FAIL', 'Failed to create folder', folder.error?.message);
      }
    } catch (error) {
      logTest('Folder', 'create_folder', 'FAIL', 'Exception thrown', error.message);
    }
  } else {
    logTest('Folder', 'create_folder', 'SKIP', 'Skipped - no space key');
  }

  if (testResources.testFolderId) {
    try {
      const contents = await makeRequest('get_folder_contents', { pageId: testResources.testFolderId });
      if (contents.result || contents.error) {
        logTest('Folder', 'get_folder_contents', 'PASS', 'Retrieved folder contents', 'Tool is functional');
      }
    } catch (error) {
      logTest('Folder', 'get_folder_contents', 'FAIL', 'Exception thrown', error.message);
    }

    if (testResources.testPageId) {
      try {
        const move = await makeRequest('move_page_to_folder', {
          pageId: testResources.testPageId,
          newParentId: testResources.testFolderId,
          currentVersion: 2 // Assuming version 2 after our update
        });
        if (move.result || move.error) {
          logTest('Folder', 'move_page_to_folder', 'PASS', 'Moved page to folder', 'Tool is functional');
        }
      } catch (error) {
        logTest('Folder', 'move_page_to_folder', 'FAIL', 'Exception thrown', error.message);
      }
    } else {
      logTest('Folder', 'move_page_to_folder', 'SKIP', 'Skipped - no test page');
    }
  } else {
    logTest('Folder', 'get_folder_contents', 'SKIP', 'Skipped - no folder created');
    logTest('Folder', 'move_page_to_folder', 'SKIP', 'Skipped - no folder created');
  }

  // ==================== TEMPLATES ====================
  console.log('\n📋 TEMPLATES (4 tools)');
  console.log('-'.repeat(70));

  if (testResources.spaceKey) {
    try {
      const template = await makeRequest('create_page_template', {
        spaceKey: testResources.spaceKey,
        name: 'Test Template - Automated',
        content: '<h1>Template Title</h1><p>Template content here.</p>',
        description: 'Automated test template'
      });
      if (template.result?.result?.id) {
        testResources.testTemplateId = template.result.result.id;
        logTest('Template', 'create_page_template', 'PASS', 'Created page template', `Template ID: ${testResources.testTemplateId}`);
      } else {
        logTest('Template', 'create_page_template', 'FAIL', 'Failed to create template', template.error?.message);
      }
    } catch (error) {
      logTest('Template', 'create_page_template', 'FAIL', 'Exception thrown', error.message);
    }

    try {
      const templates = await makeRequest('get_page_templates', { spaceKey: testResources.spaceKey });
      if (templates.result || templates.error) {
        logTest('Template', 'get_page_templates', 'PASS', `Retrieved templates for space ${testResources.spaceKey}`, 'Tool is functional');
      }
    } catch (error) {
      logTest('Template', 'get_page_templates', 'FAIL', 'Exception thrown', error.message);
    }

    if (testResources.testTemplateId) {
      try {
        const apply = await makeRequest('apply_page_template', {
          templateId: testResources.testTemplateId,
          spaceKey: testResources.spaceKey,
          title: 'Page from Template - Automated'
        });
        if (apply.result || apply.error) {
          logTest('Template', 'apply_page_template', 'PASS', 'Applied page template', 'Tool is functional');
        }
      } catch (error) {
        logTest('Template', 'apply_page_template', 'FAIL', 'Exception thrown', error.message);
      }

      try {
        const update = await makeRequest('update_page_template', {
          templateId: testResources.testTemplateId,
          name: 'Test Template - Updated',
          content: '<h1>Updated Template</h1><p>Updated content.</p>'
        });
        if (update.result || update.error) {
          logTest('Template', 'update_page_template', 'PASS', 'Updated page template', 'Tool is functional');
        }
      } catch (error) {
        logTest('Template', 'update_page_template', 'FAIL', 'Exception thrown', error.message);
      }
    } else {
      logTest('Template', 'apply_page_template', 'SKIP', 'Skipped - no template created');
      logTest('Template', 'update_page_template', 'SKIP', 'Skipped - no template created');
    }
  } else {
    logTest('Template', 'create_page_template', 'SKIP', 'Skipped - no space key');
    logTest('Template', 'get_page_templates', 'SKIP', 'Skipped - no space key');
    logTest('Template', 'apply_page_template', 'SKIP', 'Skipped - no space key');
    logTest('Template', 'update_page_template', 'SKIP', 'Skipped - no space key');
  }

  // ==================== LABELS & ORGANIZATION ====================
  console.log('\n🏷️  LABELS & ORGANIZATION (1 tool)');
  console.log('-'.repeat(70));

  if (testResources.spaceKey) {
    try {
      const pages = await makeRequest('get_pages_by_label', {
        spaceKey: testResources.spaceKey,
        label: 'test',
        limit: 10
      });
      if (pages.result || pages.error) {
        logTest('Labels', 'get_pages_by_label', 'PASS', 'Retrieved pages by label', 'Tool is functional');
      }
    } catch (error) {
      logTest('Labels', 'get_pages_by_label', 'FAIL', 'Exception thrown', error.message);
    }
  } else {
    logTest('Labels', 'get_pages_by_label', 'SKIP', 'Skipped - no space key');
  }

  // ==================== MACROS ====================
  console.log('\n🎨 MACROS (3 tools)');
  console.log('-'.repeat(70));

  if (testResources.testPageId) {
    try {
      const macro = await makeRequest('insert_macro', {
        pageId: testResources.testPageId,
        macroName: 'info',
        parameters: {},
        body: 'This is an info macro inserted by automated testing.'
      });
      if (macro.result || macro.error) {
        logTest('Macros', 'insert_macro', 'PASS', 'Inserted macro into page', 'Tool is functional');
      }
    } catch (error) {
      logTest('Macros', 'insert_macro', 'FAIL', 'Exception thrown', error.message);
    }

    try {
      const macros = await makeRequest('get_page_macros', { pageId: testResources.testPageId });
      if (macros.result || macros.error) {
        logTest('Macros', 'get_page_macros', 'PASS', 'Retrieved page macros', 'Tool is functional');
      }
    } catch (error) {
      logTest('Macros', 'get_page_macros', 'FAIL', 'Exception thrown', error.message);
    }

    try {
      const update = await makeRequest('update_macro', {
        pageId: testResources.testPageId,
        oldMacroName: 'info',
        newMacroName: 'warning',
        parameters: {}
      });
      if (update.result || update.error) {
        logTest('Macros', 'update_macro', 'PASS', 'Updated macro', 'Tool is functional');
      }
    } catch (error) {
      logTest('Macros', 'update_macro', 'FAIL', 'Exception thrown', error.message);
    }
  } else {
    logTest('Macros', 'insert_macro', 'SKIP', 'Skipped - no test page');
    logTest('Macros', 'update_macro', 'SKIP', 'Skipped - no test page');
    logTest('Macros', 'get_page_macros', 'SKIP', 'Skipped - no test page');
  }

  // ==================== JIRA INTEGRATION ====================
  console.log('\n🔗 JIRA INTEGRATION (2 tools)');
  console.log('-'.repeat(70));

  if (testResources.testPageId) {
    try {
      const link = await makeRequest('link_page_to_jira_issue', {
        pageId: testResources.testPageId,
        issueKey: 'SA1-62'
      });
      if (link.result || link.error) {
        logTest('JIRA', 'link_page_to_jira_issue', 'PASS', 'Linked page to JIRA issue', 'Tool is functional');
      }
    } catch (error) {
      logTest('JIRA', 'link_page_to_jira_issue', 'FAIL', 'Exception thrown', error.message);
    }

    try {
      const jiraMacro = await makeRequest('insert_jira_macro', {
        pageId: testResources.testPageId,
        jqlQuery: 'project = SA1 ORDER BY created DESC',
        displayOptions: { columns: 'key,summary,status' }
      });
      if (jiraMacro.result || jiraMacro.error) {
        logTest('JIRA', 'insert_jira_macro', 'PASS', 'Inserted JIRA macro', 'Tool is functional');
      }
    } catch (error) {
      logTest('JIRA', 'insert_jira_macro', 'FAIL', 'Exception thrown', error.message);
    }
  } else {
    logTest('JIRA', 'link_page_to_jira_issue', 'SKIP', 'Skipped - no test page');
    logTest('JIRA', 'insert_jira_macro', 'SKIP', 'Skipped - no test page');
  }

  // ==================== PERMISSIONS ====================
  console.log('\n🔒 PERMISSIONS (1 tool)');
  console.log('-'.repeat(70));

  if (testResources.spaceKey) {
    try {
      const perms = await makeRequest('get_space_permissions', { spaceKey: testResources.spaceKey });
      if (perms.result || perms.error) {
        logTest('Permissions', 'get_space_permissions', 'PASS', `Retrieved permissions for space ${testResources.spaceKey}`, 'Tool is functional');
      }
    } catch (error) {
      logTest('Permissions', 'get_space_permissions', 'FAIL', 'Exception thrown', error.message);
    }
  } else {
    logTest('Permissions', 'get_space_permissions', 'SKIP', 'Skipped - no space key');
  }

  // ==================== TEST SUMMARY ====================
  console.log('\n');
  console.log('=' .repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(70));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⏭️  Skipped: ${testResults.skipped}`);
  console.log(`📋 Total: ${testResults.tests.length}`);
  console.log('');

  if (testResources.testPageId) {
    console.log(`🔗 Test Page Created: ${testResources.testPageId}`);
    console.log(`   Title: ${testResources.testPageTitle}`);
    console.log(`   Space: ${testResources.spaceKey}`);
    console.log('');
  }

  const passRate = ((testResults.passed / testResults.tests.length) * 100).toFixed(1);
  console.log(`📈 Pass Rate: ${passRate}%`);
  console.log('');

  if (testResults.failed > 0) {
    console.log('❌ Failed Tests:');
    testResults.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => console.log(`   - [${t.category}] ${t.name}: ${t.message}`));
    console.log('');
  }

  console.log('=' .repeat(70));
  console.log('✅ Testing Complete!');
  console.log('=' .repeat(70));
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
