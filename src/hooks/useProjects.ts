import { useMemo } from 'react';
import { Project } from '../types';
import { usePortfolioCms } from '../context/PortfolioCmsContext';

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
  const { projects, loading, errors, notConfigured } = usePortfolioCms();

  return useMemo(() => {
    const active = projects.filter(p => !p.isDeleted);
    const trash = projects.filter(p => p.isDeleted);
    const published = active
      .filter(p => p.status === 'Published')
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    const sortedActive = [...active].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    const sortedTrash = [...trash].sort((a, b) => (b.deletedAt ?? b.updatedAt ?? 0) - (a.deletedAt ?? a.updatedAt ?? 0));
    return { all: projects, active: sortedActive, trash: sortedTrash, published, loading, error: errors.projects, notConfigured };
  }, [projects, loading, errors.projects, notConfigured]);
}
