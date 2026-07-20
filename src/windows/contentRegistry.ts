import type { ComponentType } from 'react';
import HomeContent from './contents/HomeContent';
import AboutContent from './contents/AboutContent';
import FeaturedWorkContent from './contents/FeaturedWorkContent';
import NewsfeedContent from './contents/NewsfeedContent';
import CareersContent from './contents/CareersContent';
import ContactContent from './contents/ContactContent';

export const CONTENT_REGISTRY: Record<string, ComponentType> = {
  home: HomeContent,
  about: AboutContent,
  'featured-work': FeaturedWorkContent,
  newsfeed: NewsfeedContent,
  careers: CareersContent,
  contact: ContactContent,
};
