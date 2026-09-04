import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Copy,
  FileImage,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { usePortfolioCms } from '../context/PortfolioCmsContext';
import { useToast } from './ToastContext';
import type { MediaAsset } from '../types';

type FilterKey = 'all' | MediaAsset['category'];

export const MediaLibrarySection: React.FC = () => {
  const { media, loading, uploadMedia, deleteMedia, logActivity } = usePortfolioCms();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [uploading, setUploading] = useState(false);

  const visibleMedia = useMemo(() => {
    let list = media.filter(asset => !asset.isDeleted).sort((a, b) => b.createdAt - a.createdAt);
    if (filter !== 'all') {
      list = list.filter(asset => asset.category === filter);
    }
    const term = query.trim().toLowerCase();
    if (term) {
      list = list.filter(asset => [asset.name, asset.alt, asset.category].join(' ').toLowerCase().includes(term));
    }
    return list;
  }, [media, filter, query]);

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Please upload an image file.', 'warning');
      return;
    }
    setUploading(true);
    try {
      const asset = await uploadMedia(file, 'other', file.name);
      await logActivity({
        action: 'Media uploaded',
        item: asset.name,
        itemType: 'media',
        user: 'Administrator',
      });
      toast('Media uploaded successfully.', 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to upload media.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = async (asset: MediaAsset) => {
    try {
      await navigator.clipboard.writeText(asset.url);
      toast('Media URL copied.', 'success');
    } catch {
      toast('Unable to copy the media URL.', 'warning');
    }
  };

  const handleDelete = async (asset: MediaAsset) => {
    await deleteMedia(asset.id);
    await logActivity({
      action: 'Media deleted',
      item: asset.name,
      itemType: 'media',
      user: 'Administrator',
    });
    toast('Media removed.', 'info');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/5 py-24 text-zinc-300">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
            <ImageIcon className="h-3.5 w-3.5" />
            Media library
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Asset library</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
            Upload project images once, preview them here, reuse them in the project editor, and keep the portfolio assets tidy.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-zinc-100"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Upload asset
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => void handleUpload(e.target.files?.[0])}
      />

      <div className="flex flex-col gap-3 rounded-[1.75rem] border border-white/10 bg-white/5 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search media"
            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-white/25"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {['all', 'project', 'profile', 'referral', 'logo', 'icon', 'other'].map(item => (
            <button
              key={item}
              onClick={() => setFilter(item as FilterKey)}
              className={`rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-all ${
                filter === item
                  ? 'border-white bg-white text-black'
                  : 'border-white/10 bg-black/20 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {visibleMedia.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-black/20 text-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-zinc-300">
            <FileImage className="h-8 w-8" />
          </div>
          <p className="mt-4 text-sm font-medium text-white">No media found</p>
          <p className="mt-2 max-w-sm text-sm text-zinc-500">
            {query ? 'Try another search term.' : 'Upload a project image to build your shared media library.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visibleMedia.map((asset, index) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02, duration: 0.2 }}
              className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5"
            >
              <div className="relative aspect-[4/3] bg-black/30">
                <img src={asset.url} alt={asset.alt || asset.name} className="h-full w-full object-cover" />
                <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                  {asset.category}
                </div>
              </div>

              <div className="space-y-4 p-4">
                <div>
                  <h3 className="truncate text-sm font-semibold text-white">{asset.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{asset.alt || 'No alt text provided'}</p>
                </div>

                <div className="flex items-center justify-between gap-2 text-xs text-zinc-500">
                  <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                  <span>{Math.round(asset.size / 1024)} KB</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => void handleCopy(asset)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 hover:bg-white hover:text-black"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy URL
                  </button>
                  <button
                    onClick={() => void handleDelete(asset)}
                    className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white hover:text-black"
                    aria-label="Delete media"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaLibrarySection;
