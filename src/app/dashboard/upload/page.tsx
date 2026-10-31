'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  function handleFileSelect(selected: File | null) {
    if (!selected) return;
    if (selected.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      return;
    }
    if (selected.size > 50 * 1024 * 1024) {
      setError('File must be under 50MB.');
      return;
    }
    setError('');
    setFile(selected);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError('Please select a PDF file.'); return; }
    if (!title.trim()) { setError('Please enter a book title.'); return; }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim());
    if (description.trim()) formData.append('description', description.trim());

    const response = await fetch('/api/books/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || 'Upload failed');
    } else {
      if (data.book) {
        try {
          const existing = JSON.parse(localStorage.getItem('library_client_books') || '[]');
          existing.unshift(data.book);
          localStorage.setItem('library_client_books', JSON.stringify(existing));
        } catch {
          // Ignore localStorage errors
        }
      }
      setSuccess(true);
      router.refresh();
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1500);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Upload a Book</h1>
        <p className="text-slate-400 mt-1">Share a PDF book with the library community.</p>
      </div>

      <div className="card p-8 border border-slate-700/50">
        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Book Uploaded!</h2>
            <p className="text-slate-400">Redirecting to library…</p>
          </div>
        ) : (
          <form id="upload-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Drop zone */}
            <div
              role="button"
              tabIndex={0}
              aria-label="File drop zone"
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFileSelect(e.dataTransfer.files[0] ?? null);
              }}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : file
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/40'
              }`}
            >
              <input
                ref={fileInputRef}
                id="file-input"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              />

              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-10 w-10 text-emerald-400" />
                  <div className="text-left">
                    <p className="text-emerald-300 font-medium">{file.name}</p>
                    <p className="text-slate-500 text-sm">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="ml-auto p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-300 font-medium">Drop your PDF here</p>
                  <p className="text-slate-500 text-sm mt-1">or click to browse · Max 50MB</p>
                </>
              )}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="label">
                Book Title <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="e.g. Clean Code by Robert C. Martin"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="label">
                Description <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input resize-none"
                placeholder="Brief description of the book…"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5"
              >
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              id="upload-submit"
              type="submit"
              disabled={loading || !file}
              className="btn-primary w-full py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Book
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
