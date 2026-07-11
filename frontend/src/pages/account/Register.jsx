import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './account.css';
import Stage from '../Quiz/Stage';
import TopNav from './TopNav';
import AuthField from './AuthField';
import { useAuth } from '../../auth/useAuth';
import { ApiError, registerUser } from '../../api/client';

import hero from '../../assets/account/hero-register.png';
import lineHeart from '../../assets/account/line-heart.png';
import icName from '../../assets/account/ic-name.png';
import icAge from '../../assets/account/ic-age.png';
import icPhone from '../../assets/account/ic-phone.png';
import icEmail from '../../assets/account/ic-email.png';
import icPass from '../../assets/account/ic-pass.png';

// Регистрация (Figma 2673:1066). Guest-first: this is an optional account on
// top of the questionnaire. On success the user is signed in immediately
// (the backend returns a token) and lands in their personal cabinet.
export default function Register() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [form, setForm] = useState({
    name: '',
    age: '',
    phone: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit() {
    if (busy) return;
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Заполни имя, email и пароль');
      return;
    }
    if (form.password.length < 8) {
      setError('Пароль должен содержать не менее 8 символов');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Пароли не совпадают');
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    };
    const age = parseInt(form.age, 10);
    if (!Number.isNaN(age)) payload.age = age;
    if (form.phone.trim()) payload.phone = form.phone.trim();

    setBusy(true);
    try {
      const token = await registerUser(payload);
      signIn(token);
      navigate('/account');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось зарегистрироваться');
    } finally {
      setBusy(false);
    }
  }

  const shift = error ? 31 : 0; // matches the 940→981 grow in Figma

  return (
    <Stage w={1633} h={940 + shift} mode="screen">
      <div className="acCanvas" style={{ height: 940 + shift }}>
        <TopNav />

        <img
          className="acAbs"
          src={hero}
          alt=""
          aria-hidden="true"
          style={{ left: 477, top: 92, width: 679, height: 848 }}
        />

        <p className="acAbs acTitle" style={{ left: 703, top: 204, width: 228 }}>
          Регистрация
        </p>
        <img
          className="acAbs"
          src={lineHeart}
          alt=""
          aria-hidden="true"
          style={{ left: 534, top: 252, width: 566, height: 46, objectFit: 'cover' }}
        />

        <AuthField
          icon={icName}
          x={597}
          y={321}
          placeholder="Имя"
          value={form.name}
          onChange={set('name')}
          autoComplete="name"
        />
        <AuthField
          icon={icAge}
          x={597}
          y={382}
          placeholder="Возраст"
          value={form.age}
          onChange={set('age')}
          inputMode="numeric"
        />
        <AuthField
          icon={icPhone}
          x={597}
          y={442}
          placeholder="Номер телефона"
          value={form.phone}
          onChange={set('phone')}
          inputMode="tel"
          autoComplete="tel"
        />
        <AuthField
          icon={icEmail}
          x={597}
          y={503}
          placeholder="Email"
          value={form.email}
          onChange={set('email')}
          inputMode="email"
          autoComplete="email"
        />
        <AuthField
          icon={icPass}
          type="password"
          x={597}
          y={564}
          placeholder="Пароль (не менее 8 символов)"
          value={form.password}
          onChange={set('password')}
          autoComplete="new-password"
        />
        <AuthField
          icon={icPass}
          type="password"
          x={597}
          y={625}
          placeholder="Повторить пароль"
          value={form.confirm}
          onChange={set('confirm')}
          autoComplete="new-password"
        />

        {error && (
          <p className="acAbs acError" style={{ left: 597, top: 689, width: 434 }}>
            {error}
          </p>
        )}

        <button
          type="button"
          className="acBtn"
          style={{ left: 684, top: 698 + shift, width: 265, height: 41, fontSize: 16 }}
          onClick={handleSubmit}
          disabled={busy}
        >
          Зарегистрироваться
        </button>

        <p
          className="acAbs acSmall"
          style={{ left: 718, top: 761 + shift, width: 140, textAlign: 'right' }}
        >
          Уже есть аккаунт?
        </p>
        <button
          type="button"
          className="acAbs acLink"
          style={{ left: 864, top: 761 + shift }}
          onClick={() => navigate('/login')}
        >
          Войти
        </button>
      </div>
    </Stage>
  );
}
