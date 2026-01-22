/**
 * Professional documentation structure following open-source best practices
 * Streamlined for optimal user experience and discoverability
 */
module.exports = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'introduction',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: ['getting-started/installation', 'getting-started/quick-start'],
    },
    {
      type: 'category',
      label: 'Concepts',
      collapsed: false,
      items: [
        'core-concepts/cta-system',
        {
          type: 'category',
          label: 'State Machine DSL',
          items: [
            'state-machine-dsl/overview',
            'state-machine-dsl/state-transitions',
            'state-machine-dsl/filters',
            'state-machine-dsl/actions',
            'state-machine-dsl/examples',
          ],
        },
        'core-concepts/behaviour-tags',
        'guides/frequency-control',
        'guides/grouping-ctas',
        'core-concepts/filters',
      ],
    },
    {
      type: 'category',
      label: 'Features',
      collapsed: false,
      items: ['features/nudges', 'features/tooltips', 'features/analytics'],
    },
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: ['guides/customization', 'guides/error-handling'],
    },
    {
      type: 'category',
      label: 'Examples',
      collapsed: true,
      items: ['examples/basic-cta', 'examples/multi-step-nudge'],
    },
    {
      type: 'category',
      label: 'API Reference',
      collapsed: true,
      items: [
        'api-reference/raven-client',
        'api-reference/cta-handler',
        'api-reference/tooltip-system',
        'api-reference/types',
      ],
    },
    {
      type: 'doc',
      id: 'troubleshooting',
      label: 'Troubleshooting',
    },
  ],
}
