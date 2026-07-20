import Image from 'next/image';
import styles from './WorkSection.module.scss';
import { CapabilityTags } from './CapabilityTags';
import { WORKS, type WorkItem } from '@/content/works';

function WorkCard({ work }: { work: WorkItem }) {
  const cardClass =
    work.size === 'featured'
      ? styles.cardFeatured
      : work.size === 'medium'
        ? styles.cardMedium
        : styles.cardCompact;

  return (
    <div className={`${styles.card} ${cardClass}`}>
      <CapabilityTags tags={work.tags} />
      <div className={styles.imageFrame}>
        <Image src={work.image} alt="" fill sizes="50vw" className={styles.image} />
      </div>
      {work.eyebrow && <p className={styles.eyebrow}>{work.eyebrow}</p>}
      <h3 className={work.size === 'featured' ? styles.headlineFeatured : styles.headlineMedium}>
        {work.headline}
      </h3>
      {work.stats && (
        <div className={styles.stats}>
          {work.stats.map((stat) => (
            <p key={stat} className={styles.stat}>
              {stat}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function WorkSection() {
  const [wmata1, penfed1, luray, rewind, penfed2, wmata2, wmata3] = WORKS;

  return (
    <section className={styles.section}>
      <div className={styles.row}>
        <WorkCard work={wmata1} />
        <WorkCard work={penfed1} />
      </div>
      <div className={styles.row}>
        <WorkCard work={luray} />
        <WorkCard work={rewind} />
        <WorkCard work={penfed2} />
      </div>
      <div className={styles.row}>
        <WorkCard work={wmata2} />
        <WorkCard work={wmata3} />
      </div>
    </section>
  );
}
