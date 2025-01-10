// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import versions from './versions.json';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

function getLatestVersion() {
  return versions[0];
}
const latestVersion = getLatestVersion();

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'bpftrace',
  tagline: 'Dynamic Tracing for the Linux Platform',
  favicon: 'img/bpftrace_Icon-Black-Yellow_BG.svg',

  // Set the production url of your site here
  url: 'https://docs.bpftrace.org',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',
  // baseUrl: '',
  trailingSlash: false,

  organizationName: 'bpftrace',
  projectName: 'docs-website',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          editUrl: 'https://github.com/bpftrace/bpftrace/',
          versions: {
            current: {
              label: 'pre-release',
            },
            '0.22': {
              path: `${getLatestVersion()}`,
            },
          },
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],
  customFields: {
    latestVersion,
  },

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/bpftrace_Full_Logo-Black-Yellow_BG.svg',
      navbar: {
        title: 'bpftrace',
        logo: {
          alt: 'bpftrace Logo',
          src: 'img/bpftrace_Icon-Black-Yellow_BG.svg',
          href: 'https://bpftrace.org',
          target: '_self',
        },
        items: [
          {
            to: `${getLatestVersion()}`,
            label: 'Docs',
            position: 'left',
          },
          {
            to: 'https://bpftrace.org/blog',
            label: 'Blog',
            target: '_self',
            position: 'left',
          },
          {
              href: 'https://github.com/bpftrace/bpftrace/discussions',
              label: 'Community Discussions',
              position: 'left',
          },
          {
            type: 'docsVersionDropdown',
            position: 'right',
          },
          {
            href: 'https://github.com/bpftrace/bpftrace',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
