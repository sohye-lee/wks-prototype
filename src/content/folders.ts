export interface FolderMeta {
  id: string;
  title: string;
  contentKey: string;
  defaultSize: { w: number; h: number };
}

export const HOME_WINDOW: FolderMeta = {
  id: 'home',
  title: 'Homepage',
  contentKey: 'home',
  defaultSize: { w: 1160, h: 760 },
};

export const FOLDERS: FolderMeta[] = [
  { id: 'about', title: 'About Us', contentKey: 'about', defaultSize: { w: 640, h: 480 } },
  {
    id: 'featured-work',
    title: 'Featured Work',
    contentKey: 'featured-work',
    defaultSize: { w: 720, h: 520 },
  },
  { id: 'newsfeed', title: 'Newsfeed', contentKey: 'newsfeed', defaultSize: { w: 640, h: 520 } },
  { id: 'careers', title: 'Careers', contentKey: 'careers', defaultSize: { w: 640, h: 480 } },
  { id: 'contact', title: 'Contact', contentKey: 'contact', defaultSize: { w: 560, h: 420 } },
];

const META_BY_CONTENT_KEY: Record<string, FolderMeta> = Object.fromEntries(
  [HOME_WINDOW, ...FOLDERS].map((meta) => [meta.contentKey, meta])
);

export function getWindowMeta(contentKey: string): FolderMeta {
  const meta = META_BY_CONTENT_KEY[contentKey];
  if (!meta) throw new Error(`Unknown contentKey: ${contentKey}`);
  return meta;
}
