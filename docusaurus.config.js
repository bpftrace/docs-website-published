// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import versions from './versions.json';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

function getLatestVersion() {
  // versions[0] is "latest", versions[1] will contain the actual version number
  // of the latest version
  return versions[1];
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
          editUrl: 'https://github.com/bpftrace/bpftrace',
          versions: {
            current: {
              label: 'pre-release',
            },
            'latest': {
              path: 'latest',
              label: `latest (${getLatestVersion()})`,
            },
            '0.22': {
              banner: 'none',
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
        logo: {
          alt: 'bpftrace Logo',
          src: 'img/bpftrace_Full_Logo-Black.svg',
          href: 'https://bpftrace.org',
          target: '_self',
        },
        items: [
          {
            to: 'https://bpftrace.org/learn',
            label: 'Learn',
            target: '_self',
            position: 'left',
          },
          {
            to: `${getLatestVersion()}`,
            label: 'Docs',
            target: '_self', // open external link in current window
            position: 'left',
            className: 'navbar__link--active',
          },
          {
            to: 'https://bpftrace.org/blog',
            label: 'Blog',
            target: '_self',
            position: 'left',
          },
          {
            href: 'https://github.com/bpftrace/bpftrace/discussions',
            label: 'Discussions',
            target: '_self',
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
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs + Tutorials',
            items: [
              {
                label: 'Documentation',
                to: `${getLatestVersion()}`,
                target: '_self',
              },
              {
                label: 'One-Liner Introduction Tutorial',
                to: 'https://bpftrace.org/tutorial-one-liners',
                target: '_self',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'IRC',
                href: 'https://webchat.oftc.net/?nick=&channels=%23bpftrace',
              },
              {
                label: 'Talks',
                href: 'https://bpftrace.org/videos',
                target: '_self',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: 'https://bpftrace.org/blog',
                target: '_self',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/bpftrace/bpftrace',
              },
            ],
          },
        ],
        copyright: `Copyright © 2019 Alastair Robertson.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      colorMode: {
        defaultMode: 'light',
        disableSwitch: true,
      },
    }),
};

export default config;
