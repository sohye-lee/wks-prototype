import styles from './StatsSection.module.scss';
import { Tag } from './Tag';
import { STATS } from '@/content/stats';

export function StatsSection() {
  return (
    <section className={styles.section}>
      <div className={styles.cards}>
        {STATS.map((stat, i) => (
          <div key={`${stat.eyebrow}-${i}`} className={styles.card}>
            <p className={styles.eyebrow}>{stat.eyebrow}</p>
            <p className={styles.value}>{stat.value}</p>
          </div>
        ))}
      </div>
      <div className={styles.ctas}>
        <Tag>see careers</Tag>
        <Tag>contact us</Tag>
      </div>
    </section>
  );
}
