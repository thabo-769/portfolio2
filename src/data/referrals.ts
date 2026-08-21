import { Referral } from '../types';

export const initialReferrals: Referral[] = [
  {
    id: 'ref-1',
    name: 'Sarah Jenkins',
    role: 'Lead Product Manager',
    organization: 'Apex Digital Labs',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    message: 'Thabo is one of those rare software engineers who possesses both deep architectural mastery and an extraordinary eye for UI/3D design fidelity. On the Blade AI platform, he reduced our client-side latency dramatically while shipping an interface our users rave about daily. His communication and delivery speed are unmatched.',
    date: 'June 2024',
    relationship: 'Managed Thabo on Blade AI project',
    rating: 5,
    verified: true
  },
  {
    id: 'ref-2',
    name: 'Tendai Moyo',
    role: 'Chief Technology Officer',
    organization: 'Vanguard Mobility & Cloud',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    message: 'Thabo’s work on our e-commerce and logistics mobile applications exceeded every expectation. He writes robust, clean, modular code with rigorous TypeScript safety. He solves complex problems with composure and brings proactive ideas to every sprint.',
    date: 'March 2024',
    relationship: 'Technical Director for Multi-Vendor Platform',
    rating: 5,
    verified: true
  },
  {
    id: 'ref-3',
    name: 'Marcus Sterling',
    role: 'Creative Director & Founder',
    organization: 'Studio Luminary',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    message: 'Working with Thabo on the 3D interactive heritage archives was an absolute pleasure. He turned our wildest WebGL and motion design concepts into a silky-smooth 60fps reality that works flawlessly across low-end mobile devices and 4K displays.',
    date: 'November 2023',
    relationship: 'Collaborated on White Lions Legacies',
    rating: 5,
    verified: true
  }
];

const STORAGE_KEY = 'thabo_portfolio_referrals_v1';

export function getStoredReferrals(): Referral[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading referrals from storage', e);
  }
  return initialReferrals;
}

export function saveReferral(referral: Omit<Referral, 'id' | 'date' | 'verified'>): Referral {
  const current = getStoredReferrals();
  const newRef: Referral = {
    ...referral,
    id: `ref-${Date.now()}`,
    date: 'Recently Added',
    verified: false
  };
  const updated = [newRef, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving referral to storage', e);
  }
  return newRef;
}
