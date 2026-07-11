import avatar from '../../assets/account/avatar-sun.png';
import lineHeart from '../../assets/account/line-heart.png';
import icAge from '../../assets/account/pf-age.png';
import icSkin from '../../assets/account/pf-skin.png';
import icAllergy from '../../assets/account/pf-allergy.png';
import icBudget from '../../assets/account/pf-budget.png';
import icPref from '../../assets/account/pf-pref.png';

// Figma y-position of each field row in the left profile card, plus the small
// decorative icon that sits next to it (some rows have none).
const ROW_LAYOUT = [
  { y: 553, icon: icAge }, // Возраст
  { y: 610, icon: icSkin }, // Тип кожи
  { y: 677, icon: null }, // Проблемы
  { y: 744, icon: icAllergy }, // Аллергии
  { y: 813, icon: icBudget }, // Бюджет
  { y: 876, icon: icPref }, // Предпочтения
  { y: 943, icon: null }, // Важные условия
];

// Shared left column: greeting, contact, the profile snapshot (or an empty
// state before the questionnaire is taken), and the edit / logout / help
// actions. `rows` come from labels.profileRows(profile).
export default function ProfileCard({
  name,
  email,
  rows,
  hasProfile,
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

      <img
        className="acAbs"
        src={avatar}
        alt=""
        aria-hidden="true"
        style={{ left: 207, top: 335, width: 88, height: 94 }}
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

      {hasProfile ? (
        rows.map((row, i) => (
          <div key={row.label}>
            {ROW_LAYOUT[i].icon && (
              <span
                className="acAbs"
                aria-hidden="true"
                style={{
                  left: 88,
                  top: ROW_LAYOUT[i].y - 6,
                  width: 44,
                  height: 44,
                  backgroundImage: `url(${ROW_LAYOUT[i].icon})`,
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '260%',
                }}
              />
            )}
            <p
              className="acAbs"
              style={{
                left: 143,
                top: ROW_LAYOUT[i].y,
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
            <p
              className="acAbs"
              style={{
                left: 143,
                top: ROW_LAYOUT[i].y + 30,
                width: 290,
                fontSize: 16,
                lineHeight: '22px',
                color: '#634938',
              }}
            >
              {row.value}
            </p>
          </div>
        ))
      ) : (
        <p className="acAbs acBody" style={{ left: 92, top: 560, width: 320, textAlign: 'center' }}>
          Твой профиль заполнится после подбора ухода
        </p>
      )}

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
        style={{ left: 13, top: 1360, width: 476, height: 39, objectFit: 'cover' }}
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
