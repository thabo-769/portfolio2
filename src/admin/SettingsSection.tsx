import React from 'react';
import { Settings as SettingsIcon, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../firebase/config';

export const SettingsSection: React.FC = () => {
  const { user, isConfigured } = useAuth();

  const envVars = [
    { key: 'VITE_FIREBASE_API_KEY', present: Boolean(import.meta.env.VITE_FIREBASE_API_KEY) },
    { key: 'VITE_FIREBASE_AUTH_DOMAIN', present: Boolean(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) },
    { key: 'VITE_FIREBASE_PROJECT_ID', present: Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID) },
    { key: 'VITE_FIREBASE_STORAGE_BUCKET', present: Boolean(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) },
    { key: 'VITE_FIREBASE_APP_ID', present: Boolean(import.meta.env.VITE_FIREBASE_APP_ID) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">Settings</h1>
        <p className="text-sm text-[#6B7280] mt-1">Account and connection details.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#DCFCE7] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-[#F0FDF4] text-[#16A34A]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#111827]">Authentication</h2>
            <p className="text-xs text-[#6B7280]">Firebase Authentication session</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7]">
            <div>
              <p className="text-sm font-semibold text-[#111827]">Signed in as</p>
              <p className="text-xs text-[#6B7280]">{user?.email ?? '—'}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#DCFCE7] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-[#F0FDF4] text-[#16A34A]">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#111827]">Firebase Configuration</h2>
            <p className="text-xs text-[#6B7280]">
              {isConfigured ? 'Connected' : 'Not configured'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {envVars.map(v => (
            <div key={v.key} className="flex items-center justify-between py-2 border-b border-[#F0FDF4] last:border-0">
              <code className="text-xs text-[#374151] font-mono">{v.key}</code>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                  v.present ? 'text-[#16A34A]' : 'text-[#6B7280]'
                }`}
              >
                {v.present ? 'Configured' : 'Missing'}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-[#6B7280] leading-relaxed">
          Add the <code className="font-mono">VITE_FIREBASE_*</code> values to a{' '}
          <code className="font-mono">.env</code> file (see <code className="font-mono">.env.example</code>) and
          restart the dev server. Credentials are never stored in source code.
        </p>
      </div>
    </div>
  );
};

export default SettingsSection;