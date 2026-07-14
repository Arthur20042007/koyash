import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './account.css';
import Stage from '../Quiz/Stage';
import TopNav from './TopNav';
import AuthField from './AuthField';
import FieldError from './FieldError';
import { forgotPassword } from '../../api/client';

import hero from '../../assets/account/hero-login.png';
import icEmail from '../../assets/account/ic-email.png';
import mailHero from '../../assets/account/mail-hero.png';
import mailDot from '../../assets/account/mail-dot.png';

// Забыли пароль → Письмо отправлено (Figma 2778:2 → 2673:1134).
//
// The confirmation screen is shown for *any* address: the backend answers
// identically for a registered and an unknown one, so landing here reveals
// nothing about whether an account exists (no user enumeration).
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    setError('');
    if (!email.trim()) {
      setError('Введи email');
      return;
    }
    setBusy(true);
    try {
      await forgotPassword({ email: email.trim() });
      setSent(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const rightNav = (
    <button
      type="button"
      className="acBtn"
      style={{ left: 1170, top: 41, width: 281, height: 51, fontSize: 20 }}
      onClick={() => navigate('/quiz')}
    >
      Подобрать уход
    </button>
  );

  if (sent) {
    return (
      <Stage w={1633} h={940} mode="screen">
        <div className="acCanvas" style={{ height: 940 }}>
          <TopNav right={rightNav} />
          <img
            className="acAbs"
            src={hero}
            alt=""
            aria-hidden="true"
            style={{ left: 396, top: 202, width: 841, height: 537, objectFit: 'contain' }}
          />

          <p className="acAbs acTitle" style={{ left: 635, top: 300, width: 365 }}>
            Письмо отправлено!
          </p>
          <img
            className="acAbs"
            src={mailHero}
            alt=""
            aria-hidden="true"
            style={{ left: 715, top: 394, width: 203, height: 110 }}
          />
          <p
            className="acAbs acBody"
            style={{ left: 600, top: 508, width: 435, textAlign: 'center', whiteSpace: 'pre-line' }}
          >
            {
              'Мы отправили ссылку для восстановления пароля на указанный email.\n\nПроверь почту, чтобы создать новый пароль'
            }
          </p>
          <img
            className="acAbs"
            src={mailDot}
            alt=""
            aria-hidden="true"
            style={{ left: 650, top: 631, width: 23, height: 24 }}
          />
          <p
            className="acAbs acBody"
            style={{ left: 683, top: 630, width: 300, textAlign: 'left' }}
          >
            Проверь почту, включая “Спам”
          </p>
        </div>
      </Stage>
    );
  }

  // the canvas grows to fit the error line, like the other auth screens
  const shift = error ? 40 : 0;

  return (
    <Stage w={1633} h={940 + shift} mode="screen">
      <div className="acCanvas" style={{ height: 940 + shift }}>
        <TopNav right={rightNav} />
        <img
          className="acAbs"
          src={hero}
          alt=""
          aria-hidden="true"
          style={{ left: 396, top: 202, width: 841, height: 537, objectFit: 'contain' }}
        />

        <p className="acAbs acTitle" style={{ left: 674, top: 300, width: 287 }}>
          Забыли пароль?
        </p>
        <p
          className="acAbs acBody"
          style={{ left: 653, top: 403, width: 328, textAlign: 'center' }}
        >
          Введи email, и мы отправим ссылку для восстановления пароля
        </p>

        <AuthField
          icon={icEmail}
          x={600}
          y={470}
          placeholder="Email"
          value={email}
          onChange={setEmail}
          inputMode="email"
          autoComplete="email"
        />

        {error && <FieldError message={error} top={521} />}

        <button
          type="button"
          className="acBtn"
          style={{ left: 664, top: 520 + shift, width: 305, height: 51, fontSize: 16 }}
          onClick={handleSubmit}
          disabled={busy}
        >
          Отправить ссылку
        </button>
        <button
          type="button"
          className="acBtn acBtnGhost"
          style={{ left: 684, top: 579 + shift, width: 265, height: 41, fontSize: 16 }}
          onClick={() => navigate('/login')}
        >
          Назад
        </button>
      </div>
    </Stage>
  );
}
