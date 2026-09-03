import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout, AdminSection } from './DashboardLayout';
import { Overview } from './Overview';
import { ProjectsManager } from './ProjectsManager';
import { ProjectForm, ProjectSavePayload } from './ProjectForm';
import { SkillsSection } from './SkillsSection';
import { PortfolioSection } from './PortfolioSection';
import { Trash } from './Trash';
import { SettingsSection } from './SettingsSection';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ToastContext';
import { Project } from '../types';
import {
  createProject,
  updateProject,
  trashProject,
  restoreProject,
  permanentlyDeleteProject,
  uploadProjectImage,
} from '../firebase/projectsService';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, isConfigured } = useAuth();
  const { toast } = useToast();
  const { all, active, trash, loading, error, notConfigured } = useProjects();

  const [section, setSection] = useState<AdminSection>('overview');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditing(project);
    setFormOpen(true);
  };

  const handleSave = async (payload: ProjectSavePayload, reportProgress: (pct: number) => void) => {
    if (!isConfigured) throw new Error('Firebase is not configured yet.');
    let imageUrl = editing?.image && !editing.image.startsWith('gs://') ? editing.image : '';

    if (payload.imageFile) {
      reportProgress(10);
      const hint = editing?.id ?? 'new';
      const { promise } = uploadProjectImage(payload.imageFile, hint);
      reportProgress(35);
      imageUrl = await promise;
      reportProgress(90);
    }

    if (editing) {
      await updateProject(
        {
          ...editing,
          name: payload.name,
          description: payload.description,
          category: payload.category,
          technologies: payload.technologies,
          githubUrl: payload.githubUrl,
          liveUrl: payload.liveUrl,
          featured: payload.featured,
          status: payload.status,
          image: imageUrl || editing.image,
        },
        imageUrl === editing.image ? '' : imageUrl
      );
    } else {
      await createProject(payload, imageUrl);
    }
    reportProgress(100);

    setFormOpen(false);
    setEditing(null);
  };

  const handleTrash = async (project: Project) => {
    try {
      await trashProject(project.id);
      toast('Project moved to trash.', 'success');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not move project to trash.', 'error');
    }
  };

  const handleRestore = async (project: Project) => {
    try {
      await restoreProject(project.id);
      toast('Project restored successfully.', 'success');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not restore project.', 'error');
    }
  };

  const handlePermanentDelete = async (project: Project) => {
    try {
      await permanentlyDeleteProject(project);
      toast('Project permanently deleted.', 'info');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not permanently delete project.', 'error');
    }
  };

  const handleLogout = async () => {
    if (!user) {
      navigate('/');
      return;
    }
    await signOut();
    toast('Signed out successfully.', 'info');
    navigate('/admin');
  };

  const renderSection = () => {
    switch (section) {
      case 'overview':
        return <Overview projects={all} loading={loading} onNavigate={setSection} />;
      case 'projects':
        return (
          <ProjectsManager
            projects={active}
            loading={loading}
            onAdd={openAdd}
            onEdit={openEdit}
            onTrash={(p) => void handleTrash(p)}
          />
        );
      case 'add-project':
        return formOpen ? null : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">Add Project</h1>
              <p className="text-sm text-[#6B7280] mt-1">Publish a new project to your public portfolio.</p>
            </div>
            <button
              onClick={openAdd}
              className="px-6 py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold transition-all cursor-pointer"
            >
              Start creating a project
            </button>
          </div>
        );
      case 'skills':
        return <SkillsSection skillCount={14} />;
      case 'portfolio':
        return <PortfolioSection />;
      case 'trash':
        return (
          <Trash
            projects={trash}
            loading={loading}
            onRestore={(p) => void handleRestore(p)}
            onPermanentDelete={(p) => void handlePermanentDelete(p)}
          />
        );
      case 'settings':
        return <SettingsSection />;
      default:
        return <Overview projects={all} loading={loading} onNavigate={setSection} />;
    }
  };

  return (
    <DashboardLayout
      active={section}
      onNavigate={setSection}
      projectCount={active.length}
      trashCount={trash.length}
      onLogout={handleLogout}
    >
      {(notConfigured || error) && (
        <div className="mb-6 p-4 rounded-xl bg-[#FEF9C3] border border-[#FDE68A] text-sm text-[#92400E]">
          {notConfigured
            ? 'Firebase is not configured. Add your VITE_FIREBASE_* environment variables to enable project management.'
            : error}
        </div>
      )}

      {renderSection()}

      {formOpen && (
        <ProjectForm
          editing={editing}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;