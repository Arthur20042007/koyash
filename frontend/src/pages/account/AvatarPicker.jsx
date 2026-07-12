import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './account.css';
import { useAuth } from '../../auth/useAuth';
import { AVATARS } from './avatars';
import heart from '../../assets/account/offer-spot.png';

// Выбор профиля (Figma 2828:1036) — pick a profile avatar. Reached from the
// registration flow and from «Профиль и безопасность». Saves via the auth
// context (server best-effort + local fallback).
export default function AvatarPicker() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, ready, setAvatar } = useAuth();
  const from = location.state?.from || '/account';

  const [selected, setSelected] = useState(user?.avatar || null);

  useEffect(() => {
    if (ready && !isAuthenticated) navigate('/login', { replace: true });
  }, [ready, isAuthenticated, navigate]);

  function save() {
    if (selected) setAvatar(selected);
    navigate(from, { replace: true });
  }

  return (
    <div className="acModalOverlay" style={{ position: 'fixed', overflowY: 'auto' }}>
      <div className="acModal" style={{ width: 1000, maxWidth: '96vw', padding: '36px 44px 30px' }}>
        <p
          className="acModalTitle"
          style={{
            fontSize: 30,
            lineHeight: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          Выбери фото профиля
          <img
            className="acHeart"
            src={heart}
            alt=""
            aria-hidden="true"
            style={{ width: 42, height: 42, objectFit: 'contain' }}
          />
        </p>
        <p className="acBody" style={{ margin: '0 0 4px' }}>
          Выбери аватар для личного кабинета
        </p>

        <div className="avGrid">
          {AVATARS.map((a) => (
            <button
              key={a.key}
              type="button"
              className={`avItem${selected === a.key ? ' sel' : ''}`}
              style={{ backgroundImage: `url(${a.src})` }}
              aria-label={`Аватар ${a.key}`}
              onClick={() => setSelected(a.key)}
            />
          ))}
        </div>

        <div className="acModalActions">
          <button
            type="button"
            className="acBtn acBtnGhost acModalBtn"
            style={{ width: 220 }}
            onClick={() => navigate(from, { replace: true })}
          >
            Назад
          </button>
          <button type="button" className="acBtn acModalBtn" style={{ width: 260 }} onClick={save}>
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
}
