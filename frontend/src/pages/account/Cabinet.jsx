import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './account.css';
import Stage from '../Quiz/Stage';
import TopNav from './TopNav';
import ProfileCard from './ProfileCard';
import Footer from './Footer';
import ConfirmDialog from './ConfirmDialog';
import { useAuth } from '../../auth/useAuth';
import { fetchProfile, fetchCare, fetchTracker } from '../../api/client';
import { profileValues } from './labels';

import heart from '../../assets/account/offer-spot.png';
import decorCream from '../../assets/account/decor-cream.png';
import mascot from '../../assets/account/mascot.png';
import trkIllust from '../../assets/account/trk-illust.png';
import trkIc1 from '../../assets/account/trk-ic1.png';
import trkIc2 from '../../assets/account/trk-ic2.png';
import trkIc3 from '../../assets/account/trk-ic3.png';
import trkIc4 from '../../assets/account/trk-ic4.png';
import bagIllust from '../../assets/account/bag-illust.png';
import bagIcDate from '../../assets/account/pf-age.png';
import bagIcCount from '../../assets/account/bag-ic-date.png';
import bagIcTotal from '../../assets/account/bag-ic-count.png';

// Small stat glyph (padded 1254px icon → zoomed background).
const StatIcon = ({ src, x, y, size = 34 }) => (
  <span
    className="acAbs"
    aria-hidden="true"
    style={{
      left: x,
      top: y,
      width: size,
      height: size,
      backgroundImage: `url(${src})`,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
    }}
  />
);

const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const OVERALL = { better: 'Стало лучше', same: 'Без изменений', worse: 'Стало хуже' };
const WEEKS_TOTAL = 12;

// Derive the tracker headline (current week + last recorded result) once, at
// fetch time, so render stays pure (no Date.now() during render).
function summarizeTracker(tracker) {
  if (!tracker?.start_date) return null;
  const elapsed = (Date.now() - new Date(tracker.start_date).getTime()) / (7 * 864e5);
  const week = Math.max(0, Math.min(WEEKS_TOTAL, Math.floor(elapsed)));
  const filled = (tracker.checkpoints || []).filter((c) => c.overall);
  const lastResult = filled.length ? OVERALL[filled[filled.length - 1].overall] : null;
  return { week, lastResult, progressPct: (week / WEEKS_TOTAL) * 100 };
}

// Личный кабинет (Figma 2673:1165 «с подбором» / 2803:105 «без подбора»).
// Pulls the three optional snapshots — profile, saved bag and tracker — and
// falls back to the empty state for anything the guest-turned-user hasn't
// generated yet.
export default function Cabinet() {
  const navigate = useNavigate();
  const { user, isAuthenticated, ready } = useAuth();

  const [profile, setProfile] = useState(null);
  const [care, setCare] = useState(null);
  const [trackerSummary, setTrackerSummary] = useState(null);
  const [askUpdate, setAskUpdate] = useState(false);

  useEffect(() => {
    if (ready && !isAuthenticated) navigate('/login', { replace: true });
  }, [ready, isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    // Each snapshot is optional (404 before the questionnaire) — swallow errors.
    fetchProfile()
      .then(setProfile)
      .catch(() => {});
    fetchCare()
      .then(setCare)
      .catch(() => {});
    fetchTracker()
      .then((t) => setTrackerSummary(summarizeTracker(t)))
      .catch(() => {});
  }, [isAuthenticated]);

  const hasProfile = !!profile;

  const week = trackerSummary?.week ?? 0;
  const lastResult = trackerSummary?.lastResult;
  const progressPct = trackerSummary?.progressPct ?? 0;

  // care summary
  const activeCount = (care?.items || []).filter((i) => i.status === 'active').length;

  return (
    <Stage w={1633} h={1789} mode="screen">
      <div className="acCanvas" style={{ height: 1789 }}>
        <TopNav
          right={
            <button
              type="button"
              className="acBtn"
              style={{ left: 1298, top: 29, width: 281, height: 51, fontSize: 20 }}
              onClick={() => navigate('/')}
            >
              Вернуться на главную
            </button>
          }
        />

        <p
          className="acAbs acTitle"
          style={{ left: 614, top: 154, width: 405, fontSize: 48, lineHeight: '64px' }}
        >
          Личный кабинет
        </p>
        <img
          className="acAbs acHeart"
          src={heart}
          alt=""
          aria-hidden="true"
          style={{ left: 1024, top: 150, width: 72, height: 72 }}
        />

        <ProfileCard
          name={user?.name}
          email={user?.email}
          values={profileValues(profile)}
          hasProfile={hasProfile}
          avatar={user?.avatar}
          onAvatarClick={() => navigate('/account/avatar', { state: { from: '/account' } })}
          onEdit={() => navigate('/account/security')}
          onLogout={() => navigate('/account/security')}
          onHowItWorks={() => navigate('/account/how')}
        />

        {/* ── Tracker card ── */}
        <div className="acCard" style={{ left: 477, top: 416, width: 540, height: 701 }} />
        <p
          className="acAbs acTitle"
          style={{ left: 477, top: 451, width: 540, fontSize: 26, lineHeight: '35px' }}
        >
          Трекер результата
        </p>
        {hasProfile ? (
          <>
            <img
              className="acAbs"
              src={trkIllust}
              alt=""
              aria-hidden="true"
              style={{ left: 659, top: 486, width: 178, height: 152 }}
            />
            <StatIcon src={trkIc1} x={506} y={758} size={30} />
            <p
              className="acAbs"
              style={{ left: 544, top: 762, width: 300, fontWeight: 700, fontSize: 16 }}
            >
              Неделя {week} из {WEEKS_TOTAL}
            </p>
            <div
              className="acAbs"
              style={{
                left: 499,
                top: 800,
                width: 500,
                height: 10,
                background: '#FDF3E9',
                borderRadius: 5,
              }}
            />
            <div
              className="acAbs"
              style={{
                left: 499,
                top: 800,
                width: 500 * (progressPct / 100),
                height: 10,
                background: '#D7863B',
                borderRadius: 5,
              }}
            />
            <div className="acCard" style={{ left: 511, top: 840, width: 225, height: 88 }} />
            <StatIcon src={trkIc2} x={523} y={858} size={30} />
            <p
              className="acAbs"
              style={{ left: 561, top: 852, width: 166, fontSize: 16, lineHeight: '22px' }}
            >
              Последний результат:
              <br />
              {lastResult || 'Пока нет отметок'}
            </p>
            <div className="acCard" style={{ left: 752, top: 840, width: 225, height: 88 }} />
            <StatIcon src={trkIc3} x={764} y={858} size={30} />
            <p
              className="acAbs"
              style={{ left: 802, top: 852, width: 166, fontSize: 16, lineHeight: '22px' }}
            >
              Частота отметок:
              <br />1 раз в 2 недели
            </p>
            <div className="acCard" style={{ left: 511, top: 940, width: 466, height: 64 }} />
            <StatIcon src={trkIc4} x={523} y={956} size={30} />
            <p
              className="acAbs"
              style={{ left: 561, top: 957, width: 400, fontSize: 16, lineHeight: '22px' }}
            >
              Отмечай результат каждые 2 недели, чтобы видеть динамику
            </p>
            <button
              type="button"
              className="acBtn"
              style={{ left: 596, top: 1038, width: 287, height: 51, fontSize: 20 }}
              onClick={() => navigate('/account/tracker')}
            >
              Перейти к трекеру
            </button>
          </>
        ) : (
          <>
            <img
              className="acAbs"
              src={trkIllust}
              alt=""
              aria-hidden="true"
              style={{ left: 597, top: 520, width: 300, height: 255 }}
            />
            <p
              className="acAbs acTitle"
              style={{
                left: 477,
                top: 820,
                width: 540,
                fontSize: 22,
                lineHeight: '30px',
                whiteSpace: 'normal',
              }}
            >
              Пока нет данных для отслеживания
            </p>
            <p
              className="acAbs acBody"
              style={{ left: 517, top: 890, width: 460, textAlign: 'center' }}
            >
              Пройди подбор уходовой косметики, чтобы начать трекер результата
            </p>
          </>
        )}

        {/* ── Cosmetic bag card ── */}
        <div className="acCard" style={{ left: 1045, top: 416, width: 534, height: 701 }} />
        <p
          className="acAbs acTitle"
          style={{ left: 1045, top: 451, width: 534, fontSize: 26, lineHeight: '35px' }}
        >
          Моя косметичка
        </p>
        {care ? (
          <>
            <img
              className="acAbs"
              src={bagIllust}
              alt=""
              aria-hidden="true"
              style={{ left: 1152, top: 486, width: 320, height: 213 }}
            />
            <div className="acCard" style={{ left: 1130, top: 751, width: 382, height: 72 }} />
            <StatIcon src={bagIcDate} x={1148} y={769} size={34} />
            <p
              className="acAbs"
              style={{
                left: 1192,
                top: 763,
                width: 300,
                fontWeight: 600,
                fontSize: 20,
                lineHeight: '27px',
              }}
            >
              Обновлено {formatDate(care.updated_at)}
            </p>
            <div className="acCard" style={{ left: 1130, top: 843, width: 382, height: 72 }} />
            <StatIcon src={bagIcCount} x={1148} y={861} size={34} />
            <p
              className="acAbs"
              style={{
                left: 1192,
                top: 858,
                width: 300,
                fontWeight: 600,
                fontSize: 20,
                lineHeight: '27px',
              }}
            >
              Средств в уходе: {activeCount}
            </p>
            <div className="acCard" style={{ left: 1130, top: 935, width: 382, height: 72 }} />
            <StatIcon src={bagIcTotal} x={1148} y={953} size={34} />
            <p
              className="acAbs"
              style={{
                left: 1192,
                top: 950,
                width: 300,
                fontWeight: 600,
                fontSize: 20,
                lineHeight: '27px',
              }}
            >
              Итого: {Math.round(care.total_price_rub || 0)} ₽
            </p>
            <button
              type="button"
              className="acBtn"
              style={{ left: 1140, top: 1038, width: 344, height: 51, fontSize: 20 }}
              onClick={() => navigate('/account/care')}
            >
              Перейти к косметичке
            </button>
          </>
        ) : (
          <>
            <p
              className="acAbs acTitle"
              style={{
                left: 1045,
                top: 820,
                width: 534,
                fontSize: 22,
                lineHeight: '30px',
                whiteSpace: 'normal',
              }}
            >
              Косметичка пока пуста
            </p>
            <img
              className="acAbs"
              src={bagIllust}
              alt=""
              aria-hidden="true"
              style={{ left: 1152, top: 540, width: 320, height: 213 }}
            />
            <p
              className="acAbs acBody"
              style={{ left: 1085, top: 890, width: 454, textAlign: 'center' }}
            >
              После подбора уходовой косметики здесь появятся твои средства
            </p>
          </>
        )}

        {/* ── Update-care banner ── */}
        <div
          className="acAbs"
          style={{
            left: 474,
            top: 1150,
            width: 1109,
            height: 187,
            background: '#FDF3E9',
            borderRadius: 20,
          }}
        />
        <img
          className="acAbs"
          src={decorCream}
          alt=""
          aria-hidden="true"
          style={{ left: 498, top: 1157, width: 174, height: 174 }}
        />
        <img
          className="acAbs"
          src={mascot}
          alt=""
          aria-hidden="true"
          style={{ left: 1367, top: 1159, width: 186, height: 186 }}
        />
        <p
          className="acAbs acTitle"
          style={{
            left: 726,
            top: 1170,
            width: 456,
            fontSize: 28,
            lineHeight: '37px',
            textAlign: 'left',
          }}
        >
          {hasProfile ? 'Хочешь пересмотреть уход?' : 'Давай начнём твою историю!'}
        </p>
        <p
          className="acAbs acBody"
          style={{ left: 726, top: 1220, width: 481, textAlign: 'left', fontSize: 16 }}
        >
          {hasProfile
            ? 'Мы обновим рекомендации под твои текущие потребности.'
            : 'Пройди подбор уходовой косметики, чтобы получить персональные рекомендации.'}
        </p>
        <button
          type="button"
          className="acBtn"
          style={{ left: 726, top: 1272, width: 281, height: 45, fontSize: 20 }}
          onClick={() => (hasProfile ? setAskUpdate(true) : navigate('/quick'))}
        >
          Подобрать уход
        </button>
        <button
          type="button"
          className="acBtn"
          style={{ left: 1034, top: 1272, width: 281, height: 45, fontSize: 20 }}
          onClick={() => navigate('/quiz')}
        >
          Войти в историю
        </button>

        <Footer />

        {askUpdate && (
          <ConfirmDialog
            title="Точно хочешь обновить уход?"
            message="Текущий уход будет удалён"
            confirmLabel="Обновить"
            onConfirm={() => navigate('/quick')}
            onCancel={() => setAskUpdate(false)}
          />
        )}
      </div>
    </Stage>
  );
}
