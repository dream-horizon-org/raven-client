import React, {useEffect} from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import {useLocation} from '@docusaurus/router'
import Layout from '@theme/Layout'
import styles from './raven.module.css'

function RavenHero() {
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Raven</h1>
          <p className={styles.heroSubtitle}>
            The Complete Platform for Customer Engagement and User Experience
            Management
          </p>
        </div>
      </div>
    </header>
  )
}

function PlatformCard({icon, title, description, href, badge}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.platformCard}>
      {badge && <span className={styles.badge}>{badge}</span>}
      <div className={styles.platformIcon}>{icon}</div>
      <h3 className={styles.platformTitle}>{title}</h3>
      <p className={styles.platformDescription}>{description}</p>
      <div className={styles.platformLink}>Learn More →</div>
    </a>
  )
}

function PlatformSection() {
  return (
    <section className={styles.platformSection}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Raven Platform Components</h2>
        <p className={styles.sectionSubtitle}>
          A complete suite of tools working together to deliver exceptional user
          experiences
        </p>
        <div className={styles.platformGrid}>
          <PlatformCard
            icon="📱"
            title="Raven Client"
            description="React Native SDK for in-app messaging, nudges, tooltips, and engagement. Built with a sophisticated state machine system for complex, event-driven user experiences."
            href="https://dream-horizon-org.github.io/raven-client/"
            badge="SDK"
          />
          <PlatformCard
            icon="⚡"
            title="Raven Thunder"
            description="High-performance backend service built with Java 17 + Vert.x for managing user journeys, nudges, and engagement logic. Scalable and event-driven architecture."
            href="https://dream-horizon-org.github.io/raven-thunder/"
            badge="Backend"
          />
          <PlatformCard
            icon="📊"
            title="Raven Panel"
            description="Intuitive dashboard for managing customer journeys, in-app messaging, and user engagement. Create, configure, and monitor your engagement campaigns with ease."
            href="https://dream-horizon-org.github.io/raven-panel/"
            badge="Dashboard"
          />
        </div>
      </div>
    </section>
  )
}

function Feature({icon, title, description}) {
  return (
    <div className={clsx('col col--4', styles.feature)}>
      <div className={styles.featureIcon}>{icon}</div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDescription}>{description}</p>
    </div>
  )
}

function FeaturesSection() {
  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Why Choose Raven?</h2>
        <p className={styles.sectionSubtitle}>
          Powerful features designed to help you create exceptional user
          experiences
        </p>
        <div className="row">
          <Feature
            icon="🎯"
            title="Contextual Engagement"
            description="Display contextual nudges, bottom sheets, and tooltips that engage users at the right moment with intelligent timing and personalization."
          />
          <Feature
            icon="🔄"
            title="State Machine DSL"
            description="Define complex user flows with a powerful State Machine DSL. Create multi-step nudges, conditional transitions, and sophisticated user journeys."
          />
          <Feature
            icon="📊"
            title="Event-Driven Architecture"
            description="Trigger engagement based on app events in real-time. Create experiences that respond dynamically to user behavior and app state."
          />
          <Feature
            icon="⏱️"
            title="Frequency Control"
            description="Fine-grained frequency rules including session-based, window-based, and lifespan-based controls to prevent engagement fatigue."
          />
          <Feature
            icon="🏷️"
            title="Behaviour Tags"
            description="Organize and manage multiple engagements together using behaviour tags with shared exposure rules and relationships."
          />
          <Feature
            icon="📱"
            title="Cross-Platform"
            description="Works seamlessly on both iOS and Android with a unified API, ensuring consistent experiences across all platforms."
          />
          <Feature
            icon="🎨"
            title="Fully Customizable"
            description="Customize every aspect of UI components to match your app's design system and branding. Complete control over appearance and behavior."
          />
          <Feature
            icon="🚀"
            title="High Performance"
            description="Built with performance in mind. Lightweight SDK, efficient state management, and optimized rendering for smooth user experiences."
          />
          <Feature
            icon="🔒"
            title="Enterprise Ready"
            description="Scalable architecture, comprehensive analytics, error handling, and production-ready features for enterprise applications."
          />
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
          <p className={styles.ctaDescription}>
            Start building exceptional user experiences with Raven today. Choose
            the component that fits your needs or explore the complete platform.
          </p>
          <div className={styles.ctaButtons}>
            <Link
              className="button button--primary button--lg"
              to="/getting-started/installation">
              Get Started with Raven Client
            </Link>
            <a
              href="https://github.com/dream-horizon-org/raven-client"
              target="_blank"
              rel="noopener noreferrer"
              className="button button--secondary button--lg">
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Raven() {
  const location = useLocation()

  useEffect(() => {
    // Check if we're on the raven page (handle both with and without baseUrl)
    const pathname = location.pathname
    const isRavenPage =
      pathname.includes('/raven') ||
      pathname.endsWith('/raven') ||
      pathname === '/raven' ||
      pathname === '/raven-client/raven' ||
      pathname === '/raven-client/raven/'

    const hideNavbar = () => {
      document.body.classList.add('raven-page')
      // Directly hide navbar with multiple selectors
      const selectors = ['.navbar', 'nav.navbar', '[role="banner"]']
      selectors.forEach((selector) => {
        const element = document.querySelector(selector)
        if (element) {
          element.style.display = 'none'
          element.style.visibility = 'hidden'
          element.style.height = '0'
          element.style.overflow = 'hidden'
          element.style.margin = '0'
          element.style.padding = '0'
        }
      })
    }

    const restoreNavbar = () => {
      document.body.classList.remove('raven-page')
      const selectors = ['.navbar', 'nav.navbar', '[role="banner"]']
      selectors.forEach((selector) => {
        const element = document.querySelector(selector)
        if (element) {
          element.style.display = ''
          element.style.visibility = ''
          element.style.height = ''
          element.style.overflow = ''
          element.style.margin = ''
          element.style.padding = ''
        }
      })
    }

    if (isRavenPage) {
      // Hide immediately
      hideNavbar()

      // Also hide after delays to catch any late-rendering navbar
      const timeout1 = setTimeout(hideNavbar, 50)
      const timeout2 = setTimeout(hideNavbar, 200)
      const timeout3 = setTimeout(hideNavbar, 500)

      return () => {
        clearTimeout(timeout1)
        clearTimeout(timeout2)
        clearTimeout(timeout3)
        restoreNavbar()
      }
    } else {
      restoreNavbar()
    }
  }, [location])

  return (
    <Layout
      title="Raven - Complete Platform for Customer Engagement Platform"
      description="Raven is a comprehensive ecosystem for customer engagement. Explore Raven Client, Raven Thunder, and Raven Panel.">
      <RavenHero />
      <main>
        <PlatformSection />
        <FeaturesSection />
        <CTASection />
      </main>
    </Layout>
  )
}
