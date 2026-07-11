import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './account.css';
import Stage from '../Quiz/Stage';
import TopNav from './TopNav';
import AuthField from './AuthField';

import hero from '../../assets/account/hero-login.png';
import icPass from '../../assets/account/ic-pass.png';

// Новый пароль → Готово! (Figma 2779:49 / 2879:392 → 2673:1370).
//
// NOTE: reached from the "restore password" email link. The backend has no
// reset endpoint yet, so this validates the two fields locally and shows the
// success state; hook the submit up to a real endpoint when one exists.
export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

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

  function handleSubmit() {
    setError('');
    if (password.length < 8) {
      setError('Пароль должен содержать не менее 8 символов');
      return;
    }
    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <Stage w={1633} h={940} mode="screen">
        <div className="acCanvas" style={{ height: 940 }}>
          <TopNav right={rightNav} />
          <img
            className="acAbs"
            src={hero}
            alt=""
            aria-hidden="true"
            style={{ left: 396, top: 202, width: 841, height: 537, objectFit: 'cover' }}
          />

          <p className="acAbs acTitle" style={{ left: 751, top: 298, width: 133 }}>
            Готово!
          </p>
          <p
            className="acAbs acBody"
            style={{ left: 653, top: 420, width: 328, textAlign: 'center', whiteSpace: 'pre-line' }}
          >
            {'Твой пароль обновлен.\n\nИспользуй новый пароль, чтобы войти в аккаунт'}
          </p>
          <button
            type="button"
            className="acBtn"
            style={{ left: 663, top: 541, width: 305, height: 51, fontSize: 16 }}
            onClick={() => navigate('/login')}
          >
            Войти в аккаунт
          </button>
          <button
            type="button"
            className="acAbs acLink"
            style={{ left: 735, top: 638, width: 162, textAlign: 'center' }}
            onClick={() => navigate('/')}
          >
            Вернуться на главную
          </button>
        </div>
      </Stage>
    );
  }

  // form + optional mismatch error (canvas grows 940→980 to fit the error line)
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
          style={{ left: 396, top: 202, width: 841, height: 537, objectFit: 'cover' }}
        />

        <p className="acAbs acTitle" style={{ left: 689, top: 300, width: 256 }}>
          Новый пароль
        </p>
        <p
          className="acAbs acBody"
          style={{ left: 653, top: 407, width: 328, textAlign: 'center' }}
        >
          Придумай новый пароль (должен содержать не менее 8 символов)
        </p>

        <AuthField
          icon={icPass}
          type="password"
          x={597}
          y={476}
          placeholder="Пароль"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <AuthField
          icon={icPass}
          type="password"
          x={597}
          y={534}
          placeholder="Повторить пароль"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />

        {error && (
          <p className="acAbs acError" style={{ left: 597, top: 597, width: 434 }}>
            {error}
          </p>
        )}

        <button
          type="button"
          className="acBtn"
          style={{ left: 665, top: 597 + shift, width: 305, height: 51, fontSize: 16 }}
          onClick={handleSubmit}
        >
          Поменять пароль
        </button>
      </div>
    </Stage>
  );
}
