'use client';

import { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Props = {
  text: string;
  onTextChange: (v: string) => void;
  photoUrl: string | null;
  onPhotoChange: (url: string | null) => void;
};

export function AddressInput({ text, onTextChange, photoUrl, onPhotoChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('address-photos')
        .upload(fileName, file, { upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('address-photos').getPublicUrl(fileName);
      onPhotoChange(data.publicUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Не удалось загрузить фото';
      setError(msg);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-700">Адрес доставки *</label>
      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Введите адрес на корейском"
        rows={3}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none"
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-600 active:scale-[0.99] disabled:opacity-60"
      >
        {uploading ? 'Загружаем…' : photoUrl ? '📷 Заменить фото' : '📷 Прикрепить фото адреса'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {photoUrl && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt="Адрес"
            className="h-20 rounded-lg border border-slate-200 object-cover"
          />
          <button
            type="button"
            onClick={() => onPhotoChange(null)}
            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow-md"
            aria-label="Удалить фото"
          >
            ×
          </button>
        </div>
      )}
      <p className="text-xs text-slate-500">
        Введите адрес текстом или прикрепите фото — хотя бы одно из двух.
      </p>
    </div>
  );
}
