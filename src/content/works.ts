export type WorkCardSize = 'featured' | 'medium' | 'compact';

export interface WorkItem {
  id: string;
  size: WorkCardSize;
  image: string;
  tags: string[];
  eyebrow?: string;
  headline: string;
  stats?: string[];
}

// the bottom two "featured" slots intentionally repeat work-1.jpg — real
// case studies for those two slots aren't ready yet, per the wireframe note
export const WORKS: WorkItem[] = [
  {
    id: 'wmata-1',
    size: 'featured',
    image: '/images/home/works/work-1.jpg',
    tags: ['design', 'strategy', 'campaign', 'digital'],
    eyebrow: 'wmata',
    headline: 'More than a recap: a cultural collage of the DMV',
    stats: [
      '68K social views in 8 hours',
      'Tens of thousands of organic views',
      'Established ongoing partnership between EARS',
    ],
  },
  {
    id: 'penfed-tysons',
    size: 'medium',
    image: '/images/home/works/work-2.jpg',
    tags: ['design', 'strategy', 'campaign'],
    eyebrow: 'Penfed',
    headline: 'At Tysons Plaza, the dog days aren’t ever over',
  },
  {
    id: 'luray',
    size: 'compact',
    image: '/images/home/works/work-3.jpg',
    tags: ['design', 'strategy', 'campaign', 'digital'],
    headline: 'Luray Caverns was carved over time',
  },
  {
    id: 'rewind',
    size: 'compact',
    image: '/images/home/works/work-4.jpg',
    tags: ['design', 'strategy', 'campaign'],
    headline: 'Riding the Year in Review Train',
  },
  {
    id: 'penfed-tunnel',
    size: 'compact',
    image: '/images/home/works/work-5.jpg',
    tags: ['campaign', 'digital'],
    headline: 'The Tunnel of Love... for PenFed',
  },
  {
    id: 'wmata-2',
    size: 'featured',
    image: '/images/home/works/work-1.jpg',
    tags: ['design', 'strategy', 'campaign', 'digital'],
    eyebrow: 'wmata',
    headline: 'More than a recap: a cultural collage of the DMV',
    stats: [
      '68K social views in 8 hours',
      'Tens of thousands of organic views',
      'Established ongoing partnership between EARS',
    ],
  },
  {
    id: 'wmata-3',
    size: 'featured',
    image: '/images/home/works/work-1.jpg',
    tags: ['design', 'strategy', 'campaign', 'digital'],
    eyebrow: 'wmata',
    headline: 'More than a recap: a cultural collage of the DMV',
    stats: [
      '68K social views in 8 hours',
      'Tens of thousands of organic views',
      'Established ongoing partnership between EARS',
    ],
  },
];
