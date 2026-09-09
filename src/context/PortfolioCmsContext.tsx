import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  archiveMessageEntry,
  createMessageEntry,
  createProjectEntry,
  deleteMediaEntry,
  deleteMessageEntry,
  deleteReferralEntry,
  deleteSkillEntry,
  deriveAnalyticsSummary,
  getDefaultContent,
  getDefaultSettings,
  getLocalAnalyticsSummary,
  permanentlyDeleteProjectEntry,
  recordActivity,
  recordAnalyticsEvent,
  reorderReferrals,
  reorderSkills,
  restoreReferralEntry,
  saveReferralEntry,
  saveSkillEntry,
  setMessageRead,
  subscribeToActivity,
  subscribeToAnalyticsEvents,
  subscribeToContent,
  subscribeToMedia,
  subscribeToMessages,
  subscribeToProjects,
  subscribeToReferrals,
  subscribeToSettings,
  subscribeToSkills,
  updateContentEntry,
  updateSettingsEntry,
  uploadMediaEntry,
} from '../firebase/cmsService';
import { fetchGitHubProjects } from '../github/githubService';
import { isFirebaseConfigured } from '../firebase/config';
import type {
  ActivityLogEntry,
  AnalyticsEvent,
  AnalyticsSummary,
  ContactMessage,
  MediaAsset,
  PortfolioContent,
  PortfolioSettings,
  Project,
  Referral,
  Skill,
} from '../types';

interface PortfolioCmsContextValue {
  projects: Project[];
  skills: Skill[];
  referrals: Referral[];
  messages: ContactMessage[];
  media: MediaAsset[];
  activity: ActivityLogEntry[];
  analyticsEvents: AnalyticsEvent[];
  content: PortfolioContent;
  settings: PortfolioSettings;
  analytics: AnalyticsSummary;
  loading: boolean;
  notConfigured: boolean;
  errors: {
    projects: string | null;
    skills: string | null;
    referrals: string | null;
    messages: string | null;
    media: string | null;
    activity: string | null;
    analytics: string | null;
    content: string | null;
    settings: string | null;
  };
  saveProject: (projectInput: Partial<Project>) => Promise<string>;
  deleteProject: (projectId: string) => Promise<void>;
  saveSkill: (skill: Skill) => Promise<string>;
  deleteSkill: (skillId: string) => Promise<void>;
  reorderSkills: (skillIds: string[]) => Promise<void>;
  saveReferral: (referral: Referral) => Promise<string>;
  deleteReferral: (referralId: string) => Promise<void>;
  restoreReferral: (referralId: string) => Promise<void>;
  reorderReferrals: (referralIds: string[]) => Promise<void>;
  sendMessage: (input: { senderName: string; email: string; subject?: string; message: string }) => Promise<string>;
  markMessageRead: (messageId: string, read: boolean) => Promise<void>;
  archiveMessage: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  uploadMedia: (file: File, category?: MediaAsset['category'], alt?: string) => Promise<MediaAsset>;
  deleteMedia: (mediaId: string) => Promise<void>;
  updateContent: (content: PortfolioContent) => Promise<void>;
  updateSettings: (settings: PortfolioSettings) => Promise<void>;
  logActivity: (entry: Omit<ActivityLogEntry, 'id' | 'createdAt'>) => Promise<void>;
  trackEvent: (event: Omit<AnalyticsEvent, 'id' | 'createdAt'>) => Promise<void>;
}

const PortfolioCmsContext = createContext<PortfolioCmsContextValue | undefined>(undefined);

const CUSTOM_PROJECTS_KEY = 'thabo_cms_custom_projects_v1';
const HIDDEN_PROJECTS_KEY = 'thabo_cms_hidden_projects_v1';

function readLocalCustomProjects(): Project[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function readLocalHiddenProjectIds(): string[] {
  try {
    const raw = localStorage.getItem(HIDDEN_PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const PortfolioCmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gitHubProjects, setGitHubProjects] = useState<Project[]>([]);
  const [firestoreProjects, setFirestoreProjects] = useState<Project[]>([]);
  const [customProjects, setCustomProjects] = useState<Project[]>(readLocalCustomProjects);
  const [hiddenProjectIds, setHiddenProjectIds] = useState<string[]>(readLocalHiddenProjectIds);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [activity, setActivity] = useState<ActivityLogEntry[]>([]);
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);
  const [content, setContent] = useState<PortfolioContent>(getDefaultContent());
  const [settings, setSettings] = useState<PortfolioSettings>(getDefaultSettings());
  const [errors, setErrors] = useState<PortfolioCmsContextValue['errors']>({
    projects: null,
    skills: null,
    referrals: null,
    messages: null,
    media: null,
    activity: null,
    analytics: null,
    content: null,
    settings: null,
  });
  const [hydrated, setHydrated] = useState({
    projects: false,
    skills: false,
    referrals: false,
    messages: false,
    media: false,
    activity: false,
    analytics: false,
    content: false,
    settings: false,
  });

  const notConfigured = !isFirebaseConfigured();

  useEffect(() => {
    fetchGitHubProjects()
      .then(items => {
        setGitHubProjects(items);
        setErrors(prev => ({ ...prev, projects: null }));
      })
      .catch(error => {
        setErrors(prev => ({ ...prev, projects: error instanceof Error ? error.message : 'GitHub fetch error' }));
      })
      .finally(() => {
        setHydrated(prev => ({ ...prev, projects: true }));
      });
  }, []);

  useEffect(() => {
    return subscribeToProjects((items, error) => {
      setFirestoreProjects(items);
      if (error) {
        setErrors(prev => ({ ...prev, projects: error }));
      }
    });
  }, []);

  const projects = useMemo(() => {
    // Deduplicate by ID prioritizing Firestore -> Custom -> GitHub
    const map = new Map<string, Project>();
    gitHubProjects.forEach(p => map.set(p.id, p));
    customProjects.forEach(p => map.set(p.id, p));
    firestoreProjects.forEach(p => map.set(p.id, p));

    const combined = Array.from(map.values());
    return combined.filter(p => !p.isDeleted && !hiddenProjectIds.includes(p.id));
  }, [gitHubProjects, firestoreProjects, customProjects, hiddenProjectIds]);

  useEffect(() => subscribeToSkills((items, error) => {
    setSkills(items);
    setErrors(prev => ({ ...prev, skills: error }));
    setHydrated(prev => ({ ...prev, skills: true }));
  }), []);

  useEffect(() => subscribeToReferrals((items, error) => {
    setReferrals(items);
    setErrors(prev => ({ ...prev, referrals: error }));
    setHydrated(prev => ({ ...prev, referrals: true }));
  }), []);

  useEffect(() => subscribeToMessages((items, error) => {
    setMessages(items);
    setErrors(prev => ({ ...prev, messages: error }));
    setHydrated(prev => ({ ...prev, messages: true }));
  }), []);

  useEffect(() => subscribeToMedia((items, error) => {
    setMedia(items);
    setErrors(prev => ({ ...prev, media: error }));
    setHydrated(prev => ({ ...prev, media: true }));
  }), []);

  useEffect(() => subscribeToActivity((items, error) => {
    setActivity(items);
    setErrors(prev => ({ ...prev, activity: error }));
    setHydrated(prev => ({ ...prev, activity: true }));
  }), []);

  useEffect(() => subscribeToAnalyticsEvents((items, error) => {
    setAnalyticsEvents(items);
    setErrors(prev => ({ ...prev, analytics: error }));
    setHydrated(prev => ({ ...prev, analytics: true }));
  }), []);

  useEffect(() => subscribeToContent((item, error) => {
    setContent(item);
    setErrors(prev => ({ ...prev, content: error }));
    setHydrated(prev => ({ ...prev, content: true }));
  }), []);

  useEffect(() => subscribeToSettings((item, error) => {
    setSettings(item);
    setErrors(prev => ({ ...prev, settings: error }));
    setHydrated(prev => ({ ...prev, settings: true }));
  }), []);

  const analytics = useMemo(
    () => (analyticsEvents.length > 0 ? deriveAnalyticsSummary(analyticsEvents) : getLocalAnalyticsSummary()),
    [analyticsEvents]
  );

  const loading = Object.values(hydrated).some(value => !value);

  const value = useMemo<PortfolioCmsContextValue>(() => {
    return {
      projects,
      skills,
      referrals,
      messages,
      media,
      activity,
      analyticsEvents,
      content,
      settings,
      analytics,
      loading,
      notConfigured,
      errors,
      saveProject: async (input: Partial<Project>) => {
        const id = input.id || `custom-${Date.now()}`;
        const newProject: Project = {
          id,
          name: input.name || 'Untitled Project',
          shortDescription: input.shortDescription || input.description || '',
          description: input.description || input.shortDescription || '',
          category: input.category || 'Personal',
          technologies: input.technologies && input.technologies.length > 0 ? input.technologies : ['TypeScript', 'React'],
          image: input.image || '',
          images: input.images || [],
          githubUrl: input.githubUrl || '',
          liveUrl: input.liveUrl || input.githubUrl || '',
          status: input.status || 'Published',
          featured: input.featured ?? true,
          displayOrder: input.displayOrder ?? 0,
          completionDate: input.completionDate || new Date().toISOString(),
          client: input.client || '',
          projectType: input.projectType || 'Software Project',
          features: input.features || [],
          challenges: input.challenges || '',
          solutions: input.solutions || '',
          results: input.results || '',
          createdAt: input.createdAt || Date.now(),
          updatedAt: Date.now(),
          deletedAt: null,
          isDeleted: false,
        };

        // Save to Local Storage
        setCustomProjects(current => {
          const filtered = current.filter(p => p.id !== id);
          const next = [newProject, ...filtered];
          try {
            localStorage.setItem(CUSTOM_PROJECTS_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });

        // Save to Firestore Database
        try {
          await createProjectEntry(newProject, newProject.image);
        } catch (err) {
          console.warn('Firestore project save fallback to local storage:', err);
        }

        return id;
      },
      deleteProject: async (projectId: string) => {
        const target = projects.find(p => p.id === projectId);

        setCustomProjects(current => {
          const next = current.filter(p => p.id !== projectId);
          try {
            localStorage.setItem(CUSTOM_PROJECTS_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });

        setHiddenProjectIds(current => {
          if (current.includes(projectId)) return current;
          const next = [...current, projectId];
          try {
            localStorage.setItem(HIDDEN_PROJECTS_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });

        if (target) {
          try {
            await permanentlyDeleteProjectEntry(target);
          } catch (err) {
            console.warn('Firestore project delete fallback:', err);
          }
        }
      },
      saveSkill: async (skill: Skill) => saveSkillEntry(skill),
      deleteSkill: async (skillId: string) => deleteSkillEntry(skillId),
      reorderSkills: async (skillIds: string[]) => reorderSkills(skillIds),
      saveReferral: async (referral: Referral) => saveReferralEntry(referral),
      deleteReferral: async (referralId: string) => deleteReferralEntry(referralId),
      restoreReferral: async (referralId: string) => restoreReferralEntry(referralId),
      reorderReferrals: async (referralIds: string[]) => reorderReferrals(referralIds),
      sendMessage: async (input: { senderName: string; email: string; subject?: string; message: string }) =>
        createMessageEntry(input),
      markMessageRead: async (messageId: string, read: boolean) => setMessageRead(messageId, read),
      archiveMessage: async (messageId: string) => archiveMessageEntry(messageId),
      deleteMessage: async (messageId: string) => deleteMessageEntry(messageId),
      uploadMedia: async (file: File, category?: MediaAsset['category'], alt?: string) =>
        uploadMediaEntry(file, category, alt),
      deleteMedia: async (mediaId: string) => deleteMediaEntry(mediaId),
      updateContent: async (nextContent: PortfolioContent) => updateContentEntry(nextContent),
      updateSettings: async (nextSettings: PortfolioSettings) => updateSettingsEntry(nextSettings),
      logActivity: async (entry: Omit<ActivityLogEntry, 'id' | 'createdAt'>) => recordActivity(entry),
      trackEvent: async (event: Omit<AnalyticsEvent, 'id' | 'createdAt'>) => recordAnalyticsEvent(event),
    };
  }, [
    projects,
    skills,
    referrals,
    messages,
    media,
    activity,
    analyticsEvents,
    content,
    settings,
    analytics,
    loading,
    notConfigured,
    errors,
  ]);

  return <PortfolioCmsContext.Provider value={value}>{children}</PortfolioCmsContext.Provider>;
};

export function usePortfolioCms(): PortfolioCmsContextValue {
  const context = useContext(PortfolioCmsContext);
  if (!context) {
    throw new Error('usePortfolioCms must be used within a PortfolioCmsProvider');
  }
  return context;
}
