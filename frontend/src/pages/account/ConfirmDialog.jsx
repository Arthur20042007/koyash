import './account.css';
import lineHeart from '../../assets/account/line-heart.png';

// Centered confirm modal used for "Точно хочешь обновить уход?" (Figma 2811:216)
// and "Точно хочешь удалить аккаунт?" (2813:238). `children` lets the delete
// variant drop in a password field; `error` shows a validation/server message.
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Удалить',
  cancelLabel = 'Назад',
  onConfirm,
  onCancel,
  busy = false,
  error = '',
  children,
}) {
  return (
    <div className="acModalOverlay" onClick={onCancel}>
      <div className="acModal" onClick={(e) => e.stopPropagation()}>
        <p className="acModalTitle">{title}</p>
        {message && <p className="acModalText">{message}</p>}
        {children}
        {error && (
          <p
            className="acSmall"
            style={{ position: 'static', color: '#d0402e', margin: '0 0 14px' }}
          >
            {error}
          </p>
        )}
        <img
          src={lineHeart}
          alt=""
          aria-hidden="true"
          style={{
            display: 'block',
            width: 300,
            height: 26,
            maxWidth: '100%',
            margin: '0 auto 6px',
            objectFit: 'cover',
          }}
        />
        <div className="acModalActions">
          <button type="button" className="acBtn acModalBtn" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button type="button" className="acBtn acModalBtn" onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
