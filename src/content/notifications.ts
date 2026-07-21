export interface FakeNotification {
  id: string;
  app: string;
  title: string;
  body: string;
}

// placeholder set for the fake-notification feature — eventually generated
// by AI, for now a fixed mix of "real" (WKS News) and joke notifications.
// [0] is always shown first in a session; the rest shuffle randomly.
export const FAKE_NOTIFICATIONS: FakeNotification[] = [
  {
    id: 'wks-news-1',
    app: 'WKS News',
    title: 'New post just dropped',
    body: "Someone's spilling the tea on our latest campaign. Go read it before it's old news.",
  },
  {
    id: 'ubereats-1',
    app: 'Uber Eats',
    title: 'Almost there',
    body: 'Your delivery is arriving in 3 minutes.',
  },
  {
    id: 'messages-hannah-1',
    app: 'Messages',
    title: 'Hannah (WKS)',
    body: 'hey... did you see what the client just sent 👀',
  },
  {
    id: 'messages-hannah-2',
    app: 'Messages',
    title: 'Hannah (WKS)',
    body: 'ok this stays between us right?',
  },
  {
    id: 'slack-1',
    app: 'Slack',
    title: '#general',
    body: 'someone just leaked the mood board. again.',
  },
  {
    id: 'calendar-1',
    app: 'Calendar',
    title: 'Starting now',
    body: 'Emergency gossip huddle — mandatory attendance.',
  },
  {
    id: 'findmy-1',
    app: 'Find My',
    title: 'Your focus',
    body: 'has left the building.',
  },
  {
    id: 'weather-1',
    app: 'Weather',
    title: 'Today',
    body: 'Perfect conditions for keeping a secret. Or not.',
  },
  {
    id: 'reminders-1',
    app: 'Reminders',
    title: "Don't forget",
    body: 'Everyone already knows.',
  },
  {
    id: 'bank-1',
    app: 'Bank Alert',
    title: 'Approved',
    body: 'A charge for "one more brand refresh" just went through.',
  },
];
