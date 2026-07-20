import { HeroSection } from './home/HeroSection';
import { WorkSection } from './home/WorkSection';
import { ClientsSection } from './home/ClientsSection';
import { StatsSection } from './home/StatsSection';
import { NewsfeedSection } from './home/NewsfeedSection';
import { FinalCtaSection } from './home/FinalCtaSection';

export default function HomeContent() {
  return (
    <div>
      <HeroSection />
      <WorkSection />
      <ClientsSection />
      <StatsSection />
      <NewsfeedSection />
      <FinalCtaSection />
    </div>
  );
}
