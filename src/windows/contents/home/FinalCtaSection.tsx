import styles from './FinalCtaSection.module.scss';
import { Tag } from './Tag';
import { DotModelViewer } from '@/effects/DotModelViewer';

export function FinalCtaSection() {
  return (
    <section className={styles.section}>
      <div className={styles.accent}>
        <DotModelViewer
          src="/images/home/chatter_purple.glb"
          targetSize={450}
          offsetY={0}
          baseTiltX={0.25}
          baseTiltY={1.05}
        />
      </div>
      <div className={styles.headlineWrapper}>

        <h2 className={styles.headline}>
          We won&apos;t tell anyone.
          <br />
          We&apos;ll tell everyone.
        </h2>
        <Tag>contact us</Tag>
      </div>
    </section>
  );
}
