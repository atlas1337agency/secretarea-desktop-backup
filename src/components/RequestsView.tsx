import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Inbox, Send } from 'lucide-react';
import type { ItemRequestPayload } from '../types';
import {
  fetchRequestsFromGas,
  loadLocalRequests,
  submitItemRequest,
} from '../services/sheetsApi';

interface RequestsViewProps {
  gasUrl: string;
  onNotify: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const REQUEST_CATEGORIES = [
  'PC Game',
  'Update / DLC',
  'Online Fix / Multiplayer',
  'Emulator / Tool',
  'Broken Link Report',
];

export function RequestsView({ gasUrl, onNotify }: RequestsViewProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(REQUEST_CATEGORIES[0]);
  const [image, setImage] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [requests, setRequests] = useState<ItemRequestPayload[]>(() => loadLocalRequests());

  useEffect(() => {
    let cancelled = false;
    void fetchRequestsFromGas(gasUrl).then((loaded) => {
      if (!cancelled) {
        setRequests(loaded);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [gasUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setStatusNotice(null);

    try {
      const result = await submitItemRequest(
        {
          title: title.trim(),
          category,
          image: image.trim() || undefined,
          message: message.trim(),
        },
        gasUrl
      );

      setRequests(result.requests);
      setTitle('');
      setImage('');
      setMessage('');

      const notice = result.syncedToSheet
        ? 'Request submitted successfully and saved to Google Sheet (requests)!'
        : 'Request saved to your queue. It appears in Recent Requests.';
      setStatusNotice(notice);
      onNotify(
        result.syncedToSheet ? 'Request sent to Google Sheet' : 'Request added to Recent Requests',
        'success'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-w-0 h-full overflow-y-auto bg-gradient-to-b from-[#1d2633] via-[#171d26] to-[#12161d]">
      <div className="max-w-5xl mx-auto px-5 lg:px-8 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-[15px] font-bold tracking-[0.08em] uppercase text-[#e5e9f0] shrink-0">
            Game & Tool Requests
          </h1>
          <div className="h-px flex-1 bg-white/[0.08]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Submission Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-3 p-5 rounded bg-[#171d25] border border-white/[0.08] space-y-4"
          >
            <div className="space-y-1">
              <h2 className="text-[15px] font-semibold text-white">Submit a Catalog Request</h2>
              <p className="text-[12.5px] text-[#8b9bb4]">
                Request missing repacks, latest patches, DLC bundles, or report dead mirrors.
              </p>
            </div>

            {statusNotice && (
              <div
                role="status"
                className="p-3 rounded bg-emerald-500/15 border border-emerald-400/40 flex items-start gap-2.5 text-[12.5px] font-medium text-emerald-200"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{statusNotice}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="req-title"
                className="block text-[11px] font-semibold uppercase tracking-[0.07em] text-[#8b9bb4]"
              >
                Title
              </label>
              <input
                id="req-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Ghost of Yotei or Forza Horizon 6 v461.691"
                className="w-full px-3 py-2 rounded bg-[#0e1319] border border-white/[0.1] text-[13px] text-white placeholder-[#566376] focus:outline-none focus:border-[#1a9fff]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="req-category"
                  className="block text-[11px] font-semibold uppercase tracking-[0.07em] text-[#8b9bb4]"
                >
                  Category
                </label>
                <select
                  id="req-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#0e1319] border border-white/[0.1] text-[13px] text-white focus:outline-none focus:border-[#1a9fff] cursor-pointer"
                >
                  {REQUEST_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="req-image"
                  className="block text-[11px] font-semibold uppercase tracking-[0.07em] text-[#8b9bb4]"
                >
                  Cover URL (Optional)
                </label>
                <input
                  id="req-image"
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded bg-[#0e1319] border border-white/[0.1] text-[13px] text-white placeholder-[#566376] focus:outline-none focus:border-[#1a9fff]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="req-message"
                className="block text-[11px] font-semibold uppercase tracking-[0.07em] text-[#8b9bb4]"
              >
                Details / Notes
              </label>
              <textarea
                id="req-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Include preferred repacker, specific version or DLCs needed..."
                className="w-full px-3 py-2 rounded bg-[#0e1319] border border-white/[0.1] text-[13px] text-white placeholder-[#566376] focus:outline-none focus:border-[#1a9fff]"
              />
            </div>

            <div className="pt-1 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !message.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#1a9fff] hover:bg-[#38adff] disabled:opacity-50 text-white text-[13px] font-semibold transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending...' : 'Submit Request'}</span>
              </button>
            </div>
          </form>

          {/* Submitted History */}
          <div className="lg:col-span-2 p-5 rounded bg-[#171d25] border border-white/[0.08] flex flex-col max-h-[540px]">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
              <h2 className="text-[13px] font-bold tracking-[0.06em] uppercase text-[#e5e9f0]">
                Recent Requests{' '}
                <span className="text-[#8b9bb4] font-mono-tabular">({requests.length})</span>
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto pt-3 space-y-2.5">
              {requests.length === 0 ? (
                <div className="py-12 text-center text-[#677487] space-y-2">
                  <Inbox className="w-7 h-7 mx-auto opacity-60" />
                  <p className="text-[12.5px]">No requests submitted yet.</p>
                </div>
              ) : (
                requests.map((req, idx) => (
                  <div
                    key={req.id || idx}
                    className="p-3 rounded bg-[#12171f] border border-white/[0.06] flex items-start gap-3"
                  >
                    {req.image && (
                      <img
                        src={req.image}
                        alt={req.title}
                        referrerPolicy="no-referrer"
                        className="w-10 h-14 object-cover rounded-[2px] shrink-0 bg-[#0b0e14]"
                      />
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-white truncate">
                          {req.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#66c0f4]">
                        <span>{req.category}</span>
                        {req.timestamp && (
                          <span className="inline-flex items-center gap-1 text-[#6b788b] font-mono-tabular">
                            · <Clock className="w-3 h-3" />
                            {new Date(req.timestamp).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#aeb9c7] line-clamp-2">{req.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
