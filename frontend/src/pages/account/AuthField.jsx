import { useState } from 'react';
import eyeIcon from '../../assets/account/ic-eye.png';

// One absolutely-positioned form field (icon + input, optional show/hide eye
// for passwords). Geometry matches the Figma inputs: 434×44, left icon, and
// the eye toggle sitting on the right edge for password fields.
export default function AuthField({
  icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  x,
  y,
  width = 434,
  invalid = false,
  autoComplete,
  inputMode,
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && show ? 'text' : type;

  return (
    <div className={`acField${invalid ? ' acFieldError' : ''}`} style={{ left: x, top: y, width }}>
      {icon && (
        <span
          className="acFieldIcon"
          style={{ backgroundImage: `url(${icon})` }}
          aria-hidden="true"
        />
      )}
      <input
        className="acInput"
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
      />
      {isPassword && (
        <button
          type="button"
          className="acEye"
          style={{ backgroundImage: `url(${eyeIcon})` }}
          aria-label={show ? 'Скрыть пароль' : 'Показать пароль'}
          onClick={() => setShow((s) => !s)}
        />
      )}
    </div>
  );
}
