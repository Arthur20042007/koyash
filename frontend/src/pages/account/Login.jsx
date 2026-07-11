import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './account.css';
import Stage from '../Quiz/Stage';
import TopNav from './TopNav';
import AuthField from './AuthField';
import { useAuth } from '../../auth/useAuth';
import { ApiError, loginUser } from '../../api/client';

import hero from '../../assets/account/hero-login.png';
import lineHeart from '../../assets/account/line-heart.png';
import icEmail from '../../assets/account/ic-email.png';
import icPass from '../../assets/account/ic-pass.png';

// Авторизация (Figma 2673:1108).
export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    if (busy) return;
    setError('');
    if (!email.trim() || !password) {
      setError('Введи email и пароль');
      return;
    }
    setBusy(true);
    try {
      const token = await loginUser({ email: email.trim(), password });
      signIn(token);
      navigate('/account');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось войти');
    } finally {
      setBusy(false);
    }
  }

  const shift = error ? 33 : 0; // below-password block slides down for the error line

  return (
    <Stage w={1633} h={940} mode="screen">
      <div className="acCanvas" style={{ height: 940 }}>
        <TopNav
          right={
            <button
              type="button"
              className="acBtn"
              style={{ left: 1170, top: 41, width: 281, height: 51, fontSize: 20 }}
              onClick={() => navigate('/quiz')}
            >
              Подобрать уход
            </button>
          }
        />

        <img
          className="acAbs"
          src={hero}
          alt=""
          aria-hidden="true"
          style={{ left: 396, top: 202, width: 841, height: 537, objectFit: 'cover' }}
        />
        <img
          className="acAbs"
          src={lineHeart}
          alt=""
          aria-hidden="true"
          style={{ left: 480, top: 350, width: 674, height: 55, objectFit: 'cover' }}
        />

        <p className="acAbs acTitle" style={{ left: 699, top: 300, width: 236 }}>
          Авторизация
        </p>

        <AuthField
          icon={icEmail}
          x={597}
          y={413}
          placeholder="Email"
          value={email}
          onChange={setEmail}
          inputMode="email"
          autoComplete="email"
        />
        <AuthField
          icon={icPass}
          type="password"
          x={597}
          y={474}
          placeholder="Пароль"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />

        {error && (
          <p className="acAbs acError" style={{ left: 597, top: 530, width: 434 }}>
            {error}
          </p>
        )}

        <button
          type="button"
          className="acAbs acLink"
          style={{ left: 609, top: 536 + shift }}
          onClick={() => navigate('/forgot-password')}
        >
          Забыли пароль?
        </button>

        <button
          type="button"
          className="acBtn"
          style={{ left: 699, top: 578 + shift, width: 236, height: 41, fontSize: 16 }}
          onClick={handleSubmit}
          disabled={busy}
        >
          Войти
        </button>

        <p
          className="acAbs acSmall"
          style={{ left: 686, top: 642 + shift, width: 103, textAlign: 'left' }}
        >
          Нет аккаунта?
        </p>
        <button
          type="button"
          className="acAbs acLink"
          style={{ left: 794, top: 642 + shift }}
          onClick={() => navigate('/register')}
        >
          Зарегистрироваться
        </button>
      </div>
    </Stage>
  );
}
