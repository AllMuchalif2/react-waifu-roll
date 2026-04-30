export default function SuggestionCard({ suggestion: s, onUpdateStatus }) {
  return (
    <div className="card-neo bg-card-bg flex gap-4 animate-fade-in border-border-main">
      <img
        src={s.image_url}
        className="w-24 h-24 rounded-xl border-2 border-border-main object-cover shadow-[4px_4px_0px_var(--border)]"
        alt=""
      />
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-black leading-tight text-text-main">
              {s.waifu_name}
            </h3>
            <span className="text-[0.6rem] bg-bg-main px-2 py-1 rounded font-bold border border-border-main/10 text-text-main">
              {s.suggested_tier}
            </span>
          </div>
          <p className="text-[0.65rem] text-text-muted mt-1 italic">
            Disarankan oleh:{' '}
            <b className="text-text-main">{s.profiles?.username || 'User'}</b>
          </p>
        </div>

        <div className="flex gap-2 mt-3">
          {s.status === 'pending' && (
            <>
              <button
                onClick={() => onUpdateStatus(s, 'approved')}
                className="flex-1 border-2 border-border-main bg-primary-blue text-white px-2 py-1 rounded-lg text-[0.6rem] font-black uppercase shadow-[2px_2px_0px_var(--border)] active:translate-x-px active:translate-y-px active:shadow-none"
              >
                Terima
              </button>
              <button
                onClick={() => onUpdateStatus(s, 'rejected')}
                className="flex-1 bg-danger text-white border-2 border-border-main px-2 py-1 rounded-lg text-[0.6rem] font-black uppercase shadow-[2px_2px_0px_var(--border)] active:translate-x-px active:translate-y-px active:shadow-none"
              >
                Tolak
              </button>
            </>
          )}
          {s.status !== 'pending' && (
            <div
              className={`w-full text-center py-1 rounded-lg border-2 border-border-main text-[0.6rem] font-black uppercase ${
                s.status === 'approved' ? 'bg-primary-blue' : 'bg-danger'
              } text-white`}
            >
              {s.status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
