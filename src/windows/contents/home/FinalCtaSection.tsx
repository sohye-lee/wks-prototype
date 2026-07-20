import Image from 'next/image';
import styles from './FinalCtaSection.module.scss';
import { Tag } from './Tag';

export function FinalCtaSection() {
  return (
    <section className={styles.section}>
      <div className={styles.accent}>
        <Image
          src="/images/home/figma/final-cta-accent.png"
          alt=""
          fill
          sizes="500px"
          className={`${styles.accentImage} duotone-cta`}
        />
      </div>
      <h2 className={styles.headline}>
        We won&apos;t tell anyone.
        <br />
        We&apos;ll tell everyone.
      </h2>
      <Tag>contact us</Tag>
    </section>
  );
}
