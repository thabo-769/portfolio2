import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  archiveMessageEntry,
  createMessageEntry,
  deleteMediaEntry,
  deleteMessageEntry,
  deleteReferralEntry,
  deleteSkillEntry,
  deriveAnalyticsSummary,
  getDefaultContent,
  getDefaultSettings,
  getLocalAnalyticsSummary,
  migrateLocalProjectsToFirebase,
  recordActivity,
  recordAnalyticsEvent,
  permanentlyDeleteProjectEntry,
  reorderProjects,
  reorderReferrals,
  reorderSkills,
  restoreProjectEntry,
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
  toggleProjectFeatured,
  toggleProjectStatus,
  trashProjectEntry,
  updateContentEntry,
  updateSettingsEntry,
  uploadMediaEntry,
  uploadProjectImageEntry,
  upsertProject,
} from '../firebase/cmsService';
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
  saveProject: (project: Project, imageUrl?: string) => Promise<string>;
  migrateLocalProjectsToFirebase: () => Promise<number>;
  uploadProjectImage: (file: File, projectId: string, onProgress?: (progress: number) => void) => Promise<{ url: string; path: string }>;
  trashProject: (projectId: string) => Promise<void>;
  restoreProject: (projectId: string) => Promise<void>;
  permanentlyDeleteProject: (project: Project) => Promise<void>;
  reorderProjects: (projectIds: string[]) => Promise<void>;
  toggleProjectFeatured: (projectId: string, featured: boolean) => Promise<void>;
  toggleProjectStatus: (projectId: string, status: Project['status']) => Promise<void>;
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

export const PortfolioCmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
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

  useEffect(() => subscribeToProjects((items, error) => {
    setProjects(items);
    setErrors(prev => ({ ...prev, projects: error }));
    setHydrated(prev => ({ ...prev, projects: true }));
  }), []);

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
      saveProject: async (project: Project, imageUrl?: string) => {
        await upsertProject(project, imageUrl, project.imagePath);
        const nextProject = {
          ...project,
          image: imageUrl ?? project.image,
          ...(project.imagePath ? { imagePath: project.imagePath } : {}),
        };
        setProjects(current => {
          const next = [
            ...current.filter(item => item.id !== project.id),
            nextProject,
          ];
          return next.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
        });
        return project.id;
      },
      migrateLocalProjectsToFirebase,
      uploadProjectImage: async (file: File, projectId: string, onProgress?: (progress: number) => void) =>
        uploadProjectImageEntry(file, projectId, onProgress),
      trashProject: async (projectId: string) => {
        await trashProjectEntry(projectId);
        setProjects(current => current.map(project =>
          project.id === projectId ? { ...project, isDeleted: true, deletedAt: Date.now(), updatedAt: Date.now() } : project
        ));
      },
      restoreProject: async (projectId: string) => {
        await restoreProjectEntry(projectId);
        setProjects(current => current.map(project =>
          project.id === projectId ? { ...project, isDeleted: false, deletedAt: null, updatedAt: Date.now() } : project
        ));
      },
      permanentlyDeleteProject: async (project: Project) => {
        await permanentlyDeleteProjectEntry(project);
        setProjects(current => current.filter(item => item.id !== project.id));
      },
      reorderProjects: async (projectIds: string[]) => reorderProjects(projectIds),
      toggleProjectFeatured: async (projectId: string, featured: boolean) => toggleProjectFeatured(projectId, featured),
      toggleProjectStatus: async (projectId: string, status: Project['status']) => toggleProjectStatus(projectId, status),
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
