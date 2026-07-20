import Image from 'next/image';
import styles from './NewsfeedSection.module.scss';
import { Tag } from './Tag';
import { NEWSFEED_ITEMS } from '@/content/newsfeed';

export function NewsfeedSection() {
  return (
    <section className={styles.section}>
      <div className={styles.accent}>
        <Image
          src="/images/home/figma/newsfeed-accent.png"
          alt=""
          fill
          sizes="300px"
          className={`${styles.accentImage} duotone-cta`}
        />
      </div>
      {NEWSFEED_ITEMS.map((item, i) => (
        <div key={i} className={styles.row}>
          <p className={styles.meta}>{item.date}</p>
          <p className={styles.meta}>{item.type}</p>
          <h3 className={styles.title}>{item.title}</h3>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/home/figma/icon-minus.svg" alt="" className={styles.icon} />
        </div>
      ))}
      <Tag>get more gossip</Tag>
    </section>
  );
}
