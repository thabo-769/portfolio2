import React from 'react';
import { UserRound, CheckCircle2 } from 'lucide-react';

export const PortfolioSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">Portfolio</h1>
        <p className="text-sm text-[#6B7280] mt-1">Manage the profile information shown across the site.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#DCFCE7] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-[#F0FDF4] text-[#16A34A]">
            <UserRound className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#111827]">Profile Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#374151]">Full Name</label>
            <input
              type="text"
              defaultValue="THABO TSHABANGU"
              readOnly
              className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] bg-[#F9FAFB] text-sm text-[#6B7280]"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#374151]">Role / Title</label>
            <input
              type="text"
              defaultValue="SOFTWARE DEVELOPER"
              readOnly
              className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] bg-[#F9FAFB] text-sm text-[#6B7280]"
            />
          </div>
        </div>

        <div className="mt-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-sm text-[#15803D]">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Profile fields are currently managed in the codebase. Editing here is reserved for a future
            release; your projects are already fully manageable through the Projects and Trash sections.
          </span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSection;