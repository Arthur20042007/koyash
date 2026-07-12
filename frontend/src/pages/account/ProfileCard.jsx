import sun from '../../assets/account/avatar-sun.png';
import lineHeart from '../../assets/account/line-heart.png';
import icLogout from '../../assets/account/ic-logout.png';
import icAge from '../../assets/account/pf-age.png';
import icProblems from '../../assets/account/pf-skin.png';
import icAllergy from '../../assets/account/pf-allergy.png';
import icBudget from '../../assets/account/pf-budget.png';
import icPref from '../../assets/account/pf-pref.png';
import icConditions from '../../assets/account/pf-conditions.png';
import { avatarSrc } from './avatars';

// Each profile field row: Figma y-position, its label, and the small glyph
// beside it. «Тип кожи» uses the little sun. Rows are always shown — before the
// questionnaire the labels appear without values.
const ROWS = [
  { y: 553, label: 'Возраст', icon: icAge, size: 44 },
  { y: 610, label: 'Тип кожи', icon: sun, size: 50 },
  { y: 677, label: 'Проблемы', icon: icProblems, size: 44 },
  { y: 744, label: 'Аллергии', icon: icAllergy, size: 46 },
  { y: 813, label: 'Бюджет', icon: icBudget, size: 50 },
  { y: 876, label: 'Предпочтения', icon: icPref, size: 52 },
  { y: 943, label: 'Важные условия', icon: icConditions, size: 46 },
];

// Shared left column: greeting, contact, the profile snapshot and the edit /
// logout / help actions. `values` maps a field label to its display value
// (from labels.profileRows); missing before the questionnaire is taken.
export default function ProfileCard({
  name,
  email,
  values,
  hasProfile,
  avatar,
  onAvatarClick,
  onEdit,
  onLogout,
  onHowItWorks,
}) {
  return (
    <>
      {/* main card */}
      <div
        className="acAbs"
        style={{
          left: 47,
          top: 291,
          width: 408,
          height: 930,
          background: '#FDF3E9',
          borderRadius: 20,
        }}
      />

      <button
        type="button"
        className="acAbs"
        aria-label="Сменить фото профиля"
        onClick={onAvatarClick}
        style={{
          left: 197,
          top: 318,
          width: 108,
          height: 108,
          borderRadius: '50%',
          border: '3px solid #E9A563',
          padding: 0,
          cursor: onAvatarClick ? 'pointer' : 'default',
          background: `#FDF3E9 url(${avatarSrc(avatar)}) center / cover no-repeat`,
        }}
      />
      <p
        className="acAbs"
        style={{
          left: 47,
          top: 440,
          width: 408,
          textAlign: 'center',
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: 24,
          lineHeight: '32px',
          color: '#634938',
        }}
      >
        Привет, {name || 'друг'}!
      </p>
      <p
        className="acAbs acSmall"
        style={{
          left: 47,
          top: 478,
          width: 408,
          textAlign: 'center',
          fontSize: 16,
          lineHeight: '22px',
        }}
      >
        {email}
      </p>

      {ROWS.map((row) => (
        <div key={row.label}>
          {row.icon && (
            <span
              className="acAbs"
              aria-hidden="true"
              style={{
                left: 138 - row.size,
                top: row.y + 22 - row.size / 2,
                width: row.size,
                height: row.size,
                backgroundImage: `url(${row.icon})`,
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'contain',
              }}
            />
          )}
          <p
            className="acAbs"
            style={{
              left: 143,
              top: row.y,
              width: 290,
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: 20,
              lineHeight: '27px',
              color: '#634938',
            }}
          >
            {row.label}
          </p>
          {hasProfile && (
            <p
              className="acAbs"
              style={{
                left: 143,
                top: row.y + 30,
                width: 290,
                fontSize: 16,
                lineHeight: '22px',
                color: '#634938',
              }}
            >
              {values[row.label]}
            </p>
          )}
        </div>
      ))}

      <img
        className="acAbs"
        src={lineHeart}
        alt=""
        aria-hidden="true"
        style={{ left: 84, top: 1014, width: 335, height: 30, objectFit: 'contain' }}
      />

      <button
        type="button"
        className="acBtn"
        style={{ left: 98, top: 1057, width: 281, height: 51, fontSize: 20 }}
        onClick={onEdit}
      >
        Редактировать
      </button>
      <button
        type="button"
        className="acBtn acBtnGhost"
        style={{ left: 98, top: 1120, width: 281, height: 51, fontSize: 20 }}
        onClick={onLogout}
      >
        <span className="acBtnIcon" style={{ backgroundImage: `url(${icLogout})` }} />
        Выйти
      </button>

      {/* support card */}
      <div
        className="acAbs"
        style={{
          left: 49,
          top: 1251,
          width: 408,
          height: 228,
          background: '#FDF3E9',
          borderRadius: 20,
        }}
      />
      <p className="acAbs acBody" style={{ left: 100, top: 1290, width: 302, textAlign: 'center' }}>
        Мы рядом, чтобы помочь тебе на пути к здоровой коже.
      </p>
      <img
        className="acAbs"
        src={lineHeart}
        alt=""
        aria-hidden="true"
        style={{ left: 86, top: 1362, width: 335, height: 30, objectFit: 'contain' }}
      />
      <button
        type="button"
        className="acBtn"
        style={{ left: 104, top: 1405, width: 281, height: 51, fontSize: 20 }}
        onClick={onHowItWorks}
      >
        Как всё устроено
      </button>
    </>
  );
}
