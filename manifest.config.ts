import { defineManifest } from '@crxjs/vite-plugin';
import { version } from './package.json';

const atsMatchPatterns = [
  '*://boards.greenhouse.io/*',
  '*://jobs.lever.co/*',
  '*://*.myworkdayjobs.com/*',
  '*://*.ashbyhq.com/*',
  '*://*.bamboohr.com/*',
  '*://*.icims.com/*',
  '*://*.taleo.net/*',
  // J&J / Workday-hosted career sites
  '*://jnjcareers.com/*',
  '*://jobs.jnj.com/*',
  // Major Workday-hosted career sites
  '*://*.wd1.myworkdayjobs.com/*',
  '*://*.wd3.myworkdayjobs.com/*',
  '*://*.wd5.myworkdayjobs.com/*',
  '*://careers.google.com/*',
  '*://jobs.apple.com/*',
  '*://careers.microsoft.com/*',
  '*://amazon.jobs/*',
  '*://careers.meta.com/*',
  '*://careers.netflix.com/*',
  '*://careers.salesforce.com/*',
  '*://careers.servicenow.com/*',
  '*://careers.oracle.com/*',
  '*://careers.ibm.com/*',
  '*://careers.jpmorgan.com/*',
  '*://careers.goldmansachs.com/*',
  '*://careers.mckinsey.com/*',
  '*://careers.deloitte.com/*',
  '*://careers.pwc.com/*',
  '*://careers.kpmg.com/*',
  '*://careers.ey.com/*',
];

export default defineManifest({
  manifest_version: 3,
  name: 'AutoApply',
  version,
  permissions: [
    'sidePanel',
    'storage',
    'activeTab',
    'tabs',
    'alarms',
    'identity',
  ],
  host_permissions: [
    // Supabase backend (DB, Edge Functions, Storage, Auth)
    'https://yjmxfafvgqnnsnnwqvwc.supabase.co/*',
    // ATS job boards
    ...atsMatchPatterns,
  ],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
  content_scripts: [
    {
      matches: atsMatchPatterns,
      run_at: 'document_idle',
      js: ['src/content/index.ts'],
    },
  ],
  options_page: 'src/options/index.html',
  action: {
    default_title: 'AutoApply',
  },
  icons: {
    '16': 'public/icons/icon-16.png',
    '48': 'public/icons/icon-48.png',
    '128': 'public/icons/icon-128.png',
  },
});
