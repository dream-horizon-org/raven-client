// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Raven Client',
  tagline: "Raven's React Native SDK powers messaging, nudges, tooltips, and CTAs as its in-app delivery layer",
  favicon: 'img/favicon.svg',

  // Set the production url of your site here
  url: 'https://dream-horizon-org.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/raven-client/',
  // Ensure trailing slashes for GitHub Pages compatibility
  trailingSlash: true,

  // GitHub pages deployment config.
  organizationName: 'dream-horizon-org',
  projectName: 'raven-client',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'warn',
    },
  },

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
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
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/dream-horizon-org/raven-client/tree/main/docs/',
          routeBasePath: '/',
          includeCurrentVersion: true,
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],


  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/logo.svg',
      navbar: {
        title: 'Raven Client',
        logo: {
          alt: 'Raven Client Logo',
          src: 'img/logo.svg',
          href: '/',
          target: '_self',
        },
        hideOnScroll: true,
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            type: 'search',
            position: 'right',
          },
          {
            href: 'https://github.com/dream-horizon-org/raven-client',
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub repository',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              {
                label: 'Getting Started',
                to: '/getting-started/prerequisites',
              },
              {
                label: 'State Machine DSL',
                to: '/state-machine-dsl/overview',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/dream-horizon-org/raven-client',
              },
              {
                label: 'Issues',
                href: 'https://github.com/dream-horizon-org/raven-client/issues',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'License',
                href: 'https://github.com/dream-horizon-org/raven-client/blob/main/LICENSE',
              },
              {
                label: 'Contributing',
                href: 'https://github.com/dream-horizon-org/raven-client/blob/main/CONTRIBUTING.md',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Dream Horizon.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['typescript', 'javascript', 'json', 'bash'],
      },
    }),
};

module.exports = config;

