export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  onConfirm,
  onCancel,
  type = 'primary', // primary, danger, warning
}) {
  if (!isOpen) return null;

  const typeClasses = {
    primary: 'border-primary-blue text-primary-blue bg-primary-blue/10',
    danger: 'border-danger text-danger bg-danger/10',
    warning:
      'border-secondary-yellow text-secondary-yellow bg-secondary-yellow/10',
  };

  const btnClasses = {
    primary: 'btn-neo',
    danger: 'btn-neo-danger',
    warning: 'btn-neo-secondary',
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in">
      <div
        className={`card-neo w-full max-w-sm bg-card-bg border-2 animate-zoom-in ${type === 'danger' ? 'border-danger' : 'border-primary-blue'}`}
      >
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2 ${typeClasses[type]}`}
          >
            <i
              className={`fa-solid ${type === 'danger' ? 'fa-triangle-exclamation' : 'fa-circle-question'} text-3xl`}
            ></i>
          </div>

          <h2 className="text-xl font-black mb-2 text-text-main">{title}</h2>
          <p className="text-sm text-text-muted mb-6 px-2 leading-relaxed">
            {message}
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="btn-neo-outline flex-1 py-3 text-[0.65rem]"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 text-[0.65rem] ${btnClasses[type]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
