import styles from './NewsfeedSection.module.scss';
import { Tag } from './Tag';
import { NEWSFEED_ITEMS } from '@/content/newsfeed';
import { DotModelViewer } from '@/effects/DotModelViewer';

export function NewsfeedSection() {
  return (
    <section className={styles.section}>
      <div className={styles.accent}>
        <DotModelViewer
          src="/images/home/phone.glb"
          targetSize={400}
          offsetY={0}
          baseTiltX={0.4 + (40 * Math.PI) / 180}
          baseTiltY={0}
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
