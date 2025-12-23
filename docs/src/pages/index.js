import React from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import styles from './index.module.css'

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext()
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">
            Raven's React Native SDK powers messaging, nudges, tooltips, and CTAs as
            its in-app delivery layer.
          </p>
          <div className={styles.buttons}>
            <Link
              className="button button--secondary button--lg"
              to="/getting-started/installation">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

function Feature({title, description, icon}) {
  return (
    <div className={clsx('col col--4', styles.feature)}>
      <div className={styles.featureIcon}>{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <Feature
            title="In App Engagement"
            description="Display contextual nudges and bottom sheets that engage users at the right moment with a sophisticated state machine system."
            icon="🎯"
          />
          <Feature
            title="ToolTip"
            description="Powerful tooltip system with screen tracking that helps guide users through your app with native performance."
            icon="💬"
          />
          <Feature
            title="Event Driven Engagement"
            description="Trigger Engagement based on app events, creating contextual experiences that respond to user behavior in real-time."
            icon="📊"
          />
          <Feature
            title="State Management"
            description="Built-in state machine for CTA lifecycle management, enabling complex user flows and multi-step interactions."
            icon="🔄"
          />
          <Feature
            title="Cross-Platform"
            description="Works seamlessly on both iOS and Android with a unified API, ensuring consistent experiences across platforms."
            icon="📱"
          />
          <Feature
            title="Fully Customizable"
            description="Customize every aspect of the UI components to match your app's design system and branding."
            icon="🎨"
          />
        </div>
      </div>
    </section>
  )
}

function QuickLinks() {
  return (
    <section className={styles.quickLinks}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Quick Links</h2>
        <div className={styles.linkGrid}>
          <Link to="/getting-started/installation" className={styles.linkCard}>
            <div className={styles.linkIcon}>📦</div>
            <h3>Installation</h3>
            <p>Get started with Raven Client in minutes</p>
          </Link>
          <Link to="/getting-started/quick-start" className={styles.linkCard}>
            <div className={styles.linkIcon}>⚡</div>
            <h3>Quick Start</h3>
            <p>Build your first nudge in 5 minutes</p>
          </Link>
          <Link to="/core-concepts/cta-system" className={styles.linkCard}>
            <div className={styles.linkIcon}>🎯</div>
            <h3>Engagement System</h3>
            <p>Learn about the Engagement architecture</p>
          </Link>
          <Link to="/state-machine-dsl/overview" className={styles.linkCard}>
            <div className={styles.linkIcon}>🔄</div>
            <h3>State Machine DSL</h3>
            <p>Create complex user flows</p>
          </Link>
          <Link to="/api-reference/nudge-client" className={styles.linkCard}>
            <div className={styles.linkIcon}>📚</div>
            <h3>API Reference</h3>
            <p>Complete API documentation</p>
          </Link>
          <Link to="/examples/basic-cta" className={styles.linkCard}>
            <div className={styles.linkIcon}>💡</div>
            <h3>Examples</h3>
            <p>Real-world code examples</p>
          </Link>
          <a
            href="https://github.com/dream-horizon-org/raven-client"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkCard}>
            <div className={styles.linkIcon}>🐙</div>
            <h3>GitHub</h3>
            <p>View source code and contribute</p>
          </a>
        </div>
      </div>
    </section>
  )
}

function PlatformComponents() {
  return (
    <section className={styles.platformComponents}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Platform Components</h2>
        <div className={styles.linkGrid}>
          <a
            href="https://dream-horizon-org.github.io/raven-panel/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkCard}>
            <div className={styles.linkIcon}>📊</div>
            <h3>Raven Panel</h3>
            <p>
              Dashboard for managing customer journeys, in-app messaging, and
              user engagement
            </p>
          </a>
          <a
            href="https://dream-horizon-org.github.io/raven-thunder/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkCard}>
            <div className={styles.linkIcon}>⚡</div>
            <h3>Raven Thunder</h3>
            <p>
              Backend service built with Java 17 + Vert.x for managing user
              journeys and nudges
            </p>
          </a>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext()
  return (
    <Layout
      title={`${siteConfig.title} - ${siteConfig.tagline}`}
      description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <PlatformComponents />
        <QuickLinks />
      </main>
    </Layout>
  )
}
