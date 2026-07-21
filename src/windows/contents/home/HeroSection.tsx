import styles from './HeroSection.module.scss';
import { PixelHighlight } from './PixelHighlight';
import { Tag } from './Tag';

export function HeroSection() {
  return (
    <section className={styles.section}>
      <h1 className={styles.headline}>
        A <PixelHighlight startDelay={0.4}>full-service creative</PixelHighlight>{' '}
        agency that&apos;s known for{' '}
        <PixelHighlight startDelay={1.2}>getting brands known</PixelHighlight>.
      </h1>
      <div className={styles.tags}>
        <Tag>all work</Tag>
        <Tag>our services</Tag>
      </div>
    </section>
  );
}
