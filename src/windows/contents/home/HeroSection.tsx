import styles from './HeroSection.module.scss';
import { Highlight } from './Highlight';
import { Tag } from './Tag';

export function HeroSection() {
  return (
    <section className={styles.section}>
      <h1 className={styles.headline}>
        A <Highlight>full-service creative</Highlight> agency that&apos;s known for{' '}
        <Highlight>getting brands known</Highlight>.
      </h1>
      <div className={styles.tags}>
        <Tag>all work</Tag>
        <Tag>our services</Tag>
      </div>
    </section>
  );
}
