import Image from 'next/image';
import styles from './ClientsSection.module.scss';
import { CLIENT_LOGOS } from '@/content/clients';

export function ClientsSection() {
  return (
    <section className={styles.section}>
      <div className={styles.mouth}>
        <Image
          src="/images/home/figma/mouth.png"
          alt=""
          fill
          sizes="50vw"
          className={styles.mouthImage}
        />
      </div>
      <h2 className={styles.headline}>
        We don&apos;t keep quiet.
        <br />
        We keep clients.
      </h2>
      <div className={styles.logos}>
        {CLIENT_LOGOS.map((client, i) => (
          <div key={`${client.name}-${i}`} className={styles.logo}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={client.src} alt={client.name} className={styles.logoImage} />
          </div>
        ))}
      </div>
    </section>
  );
}
