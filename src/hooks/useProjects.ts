import { useEffect, useMemo, useState } from 'react';
import { Project } from '../types';
import {
  subscribeToProjects,
} from '../firebase/projectsService';
import { isFirebaseConfigured } from '../firebase/config';

export interface ProjectCollectionState {
  all: Project[];
  active: Project[];
  trash: Project[];
  published: Project[];
  loading: boolean;
  error: string | null;
  notConfigured: boolean;
}

/**
 * Central real-time source of truth for projects across the app.
 *
 * - Public portfolio reads `published` (isoDeleted=false AND status=Published).
 * - Admin dashboard reads `active`, `trash` for management.
 * - Any change to Firestore (add/edit/trash/restore/delete) is reflected live
 *   without a page refresh.
 */
export function useProjects(): ProjectCollectionState {
  const notConfigured = !isFirebaseConfigured();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (notConfigured) {
      setLoading(false);
      setError(null);
      return;
    }
    let unsub: (() => void) | undefined;
    setLoading(true);
    try {
      unsub = subscribeToProjects((list, err) => {
        setProjects(list);
        setError(err);
        setLoading(false);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to initialize Firebase.');
      setLoading(false);
    }
    return () => {
      unsub?.();
    };
  }, [notConfigured]);

  return useMemo(() => {
    const active = projects.filter(p => !p.isDeleted);
    const trash = projects.filter(p => p.isDeleted);
    const published = active.filter(p => p.status === 'Published');
    return { all: projects, active, trash, published, loading, error, notConfigured };
  }, [projects, loading, error, notConfigured]);
}