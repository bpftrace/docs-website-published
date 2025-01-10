import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import useBaseUrl from '@docusaurus/useBaseUrl';

import Heading from '@theme/Heading';
import styles from './index.module.css';


function HomepageHeader() {
    const {siteConfig} = useDocusaurusContext();
    const latestVersion = useDocusaurusContext().siteConfig.customFields.latestVersion;
    return (
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
        </div>
        <p>
          <Link to={`${latestVersion}/manpage`}>
            Latest Version ({latestVersion})
          </Link>
        </p>
        <p>
          <Link to="0.21/manpage">
            Older Versions (TODO)
          </Link>
        </p>
      </header>
    );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}: dynamic tracing for the Linux platform`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
    </Layout>
  );
}
