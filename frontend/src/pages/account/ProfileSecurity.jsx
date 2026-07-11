import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './account.css';
import Stage from '../Quiz/Stage';
import TopNav from './TopNav';
import ProfileCard from './ProfileCard';
import ConfirmDialog from './ConfirmDialog';
import { useAuth } from '../../auth/useAuth';
import {
  ApiError,
  fetchProfile,
  updateAccount,
  changePassword,
  deleteAccount,
} from '../../api/client';
import { profileValues } from './labels';

import heart from '../../assets/account/offer-spot.png';
import icPass from '../../assets/account/ic-pass.png';

// Профиль и безопасность (Figma 2673:1574). Edits personal data (PATCH
// /account), changes the password (PUT /account/password), logs out and
// deletes the account (POST /account/delete, password-confirmed).
export default function ProfileSecurity() {
  const navigate = useNavigate();
  const { user, isAuthenticated, ready, signOut, updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  // Seed the editable form from the cached user (available synchronously from
  // localStorage for a signed-in visitor).
  const [data, setData] = useState(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    age: user?.age != null ? String(user.age) : '',
  }));
  const [dataMsg, setDataMsg] = useState('');
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [askDelete, setAskDelete] = useState(false);
  const [deletePw, setDeletePw] = useState('');
  const [deleteErr, setDeleteErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && !isAuthenticated) navigate('/login', { replace: true });
  }, [ready, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated)
      fetchProfile()
        .then(setProfile)
        .catch(() => {});
  }, [isAuthenticated]);

  const setField = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }));

  async function saveData() {
    setDataMsg('');
    const payload = { name: data.name.trim(), email: data.email.trim(), phone: data.phone.trim() };
    const age = parseInt(data.age, 10);
    payload.age = Number.isNaN(age) ? null : age;
    setBusy(true);
    try {
      const updated = await updateAccount(payload);
      updateUser(updated);
      setDataMsg('Сохранено ✓');
    } catch (e) {
      setDataMsg(e instanceof ApiError ? e.message : 'Не удалось сохранить');
    } finally {
      setBusy(false);
    }
  }

  async function savePassword() {
    setPwMsg('');
    if (pw.next.length < 8) {
      setPwMsg('Новый пароль — не менее 8 символов');
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwMsg('Пароли не совпадают');
      return;
    }
    setBusy(true);
    try {
      await changePassword({ current_password: pw.current, new_password: pw.next });
      setPw({ current: '', next: '', confirm: '' });
      setPwMsg('Пароль обновлён ✓');
    } catch (e) {
      setPwMsg(e instanceof ApiError ? e.message : 'Не удалось сменить пароль');
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    setDeleteErr('');
    setBusy(true);
    try {
      await deleteAccount({ password: deletePw });
      signOut();
      navigate('/', { replace: true });
    } catch (e) {
      setDeleteErr(e instanceof ApiError ? e.message : 'Не удалось удалить аккаунт');
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    signOut();
    navigate('/', { replace: true });
  }

  const label = {
    fontSize: 20,
    lineHeight: '27px',
    color: '#634938',
    fontFamily: "'Manrope', sans-serif",
  };

  return (
    <Stage w={1633} h={1450} mode="screen">
      <div className="acCanvas" style={{ height: 1450 }}>
        <TopNav
          right={
            <button
              type="button"
              className="acBtn"
              style={{ left: 1304, top: 23, width: 281, height: 51, fontSize: 20 }}
              onClick={() => navigate('/account')}
            >
              Вернуться в профиль
            </button>
          }
        />

        <p
          className="acAbs acTitle"
          style={{ left: 519, top: 154, width: 594, fontSize: 48, lineHeight: '64px' }}
        >
          Профиль и безопасность
        </p>
        <img
          className="acAbs acHeart"
          src={heart}
          alt=""
          aria-hidden="true"
          style={{ left: 1113, top: 150, width: 100, height: 100 }}
        />

        <ProfileCard
          name={user?.name}
          email={user?.email}
          values={profileValues(profile)}
          hasProfile={!!profile}
          avatar={user?.avatar}
          onAvatarClick={() =>
            navigate('/account/avatar', { state: { from: '/account/security' } })
          }
          onEdit={() => navigate('/account/security')}
          onLogout={logout}
          onHowItWorks={() => navigate('/account/how')}
        />

        {/* ── Personal data card ── */}
        <div className="acCard" style={{ left: 487, top: 289, width: 530, height: 583 }} />
        <p
          className="acAbs acTitle"
          style={{ left: 487, top: 324, width: 530, fontSize: 28, lineHeight: '37px' }}
        >
          Личные данные
        </p>
        <p className="acAbs" style={{ ...label, left: 530, top: 422 }}>
          Имя
        </p>
        <input
          className="acEditInput"
          style={{ left: 688, top: 417, width: 289 }}
          value={data.name}
          onChange={setField('name')}
        />
        <p className="acAbs" style={{ ...label, left: 530, top: 512 }}>
          Email
        </p>
        <input
          className="acEditInput"
          style={{ left: 688, top: 506, width: 289, fontSize: 16 }}
          value={data.email}
          onChange={setField('email')}
        />
        <p className="acAbs" style={{ ...label, left: 530, top: 613 }}>
          Телефон
        </p>
        <input
          className="acEditInput"
          style={{ left: 688, top: 604, width: 289 }}
          value={data.phone}
          onChange={setField('phone')}
          placeholder="+7 (…)"
        />
        <p className="acAbs" style={{ ...label, left: 530, top: 701 }}>
          Возраст
        </p>
        <input
          className="acEditInput"
          style={{ left: 688, top: 694, width: 289 }}
          value={data.age}
          onChange={setField('age')}
          inputMode="numeric"
        />
        {dataMsg && (
          <p
            className="acAbs acSmall"
            style={{ left: 487, top: 762, width: 530, textAlign: 'center' }}
          >
            {dataMsg}
          </p>
        )}
        <button
          type="button"
          className="acBtn"
          style={{ left: 533, top: 796, width: 433, height: 51, fontSize: 20 }}
          onClick={saveData}
          disabled={busy}
        >
          Сохранить изменения
        </button>

        {/* ── Security card ── */}
        <div className="acCard" style={{ left: 1039, top: 289, width: 530, height: 670 }} />
        <p
          className="acAbs acTitle"
          style={{ left: 1039, top: 324, width: 530, fontSize: 28, lineHeight: '37px' }}
        >
          Безопасность
        </p>
        <p className="acAbs" style={{ ...label, left: 1062, top: 422 }}>
          Текущий пароль
        </p>
        <input
          className="acEditInput"
          type="password"
          style={{ left: 1257, top: 417, width: 289 }}
          value={pw.current}
          onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
          autoComplete="current-password"
        />
        <p className="acAbs" style={{ ...label, left: 1065, top: 544 }}>
          Новый пароль
        </p>
        <input
          className="acEditInput"
          type="password"
          style={{ left: 1257, top: 535, width: 289 }}
          value={pw.next}
          onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
          autoComplete="new-password"
        />
        <p className="acAbs" style={{ ...label, left: 1065, top: 648 }}>
          Повторите пароль
        </p>
        <input
          className="acEditInput"
          type="password"
          style={{ left: 1257, top: 642, width: 289 }}
          value={pw.confirm}
          onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
          autoComplete="new-password"
        />
        <button
          type="button"
          className="acAbs acLink"
          style={{ left: 1065, top: 731, width: 481, textAlign: 'center' }}
          onClick={() => navigate('/forgot-password')}
        >
          Не помнишь текущий пароль?
        </button>
        {pwMsg && (
          <p
            className="acAbs acSmall"
            style={{ left: 1039, top: 763, width: 530, textAlign: 'center' }}
          >
            {pwMsg}
          </p>
        )}
        <button
          type="button"
          className="acBtn"
          style={{ left: 1087, top: 797, width: 433, height: 51, fontSize: 20 }}
          onClick={savePassword}
          disabled={busy}
        >
          Сменить пароль
        </button>
        <button
          type="button"
          className="acBtn acBtnGhost"
          style={{ left: 1088, top: 872, width: 432, height: 51, fontSize: 20 }}
          onClick={() => setAskDelete(true)}
        >
          Удалить аккаунт
        </button>

        {askDelete && (
          <ConfirmDialog
            title="Точно хочешь удалить аккаунт?"
            message={
              'Это действие нельзя будет отменить.\nВсе данные будут удалены безвозвратно.\nЧтобы подтвердить удаление, введи пароль.'
            }
            confirmLabel="Удалить"
            onConfirm={confirmDelete}
            onCancel={() => {
              setAskDelete(false);
              setDeletePw('');
              setDeleteErr('');
            }}
            busy={busy}
            error={deleteErr}
          >
            <div className="acModalField">
              <span
                className="acFieldIcon"
                style={{ backgroundImage: `url(${icPass})` }}
                aria-hidden="true"
              />
              <input
                className="acInput"
                type="password"
                placeholder="Пароль"
                value={deletePw}
                onChange={(e) => setDeletePw(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </ConfirmDialog>
        )}
      </div>
    </Stage>
  );
}
