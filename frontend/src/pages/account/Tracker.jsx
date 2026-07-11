import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './account.css';
import Stage from '../Quiz/Stage';
import TopNav from './TopNav';
import { useAuth } from '../../auth/useAuth';
import { fetchTracker, submitCheckpoint } from '../../api/client';

const OVERALL_OPTIONS = [
  { value: 'better', label: 'Стало лучше' },
  { value: 'same', label: 'Без изменений' },
  { value: 'worse', label: 'Стало хуже' },
];
const OVERALL_LABEL = { better: 'Стало лучше', same: 'Без изменений', worse: 'Стало хуже' };
const STATUS_LABEL = { active: 'Текущий', done: 'Активная', locked: 'Заблокирован' };

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Трекер результата (Figma 2673:1842 / 2673:1655). Scores the current active
// checkpoint (PUT /tracker/checkpoints/{index}) and shows the history.
export default function Tracker() {
  const navigate = useNavigate();
  const { isAuthenticated, ready } = useAuth();

  const [tracker, setTracker] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [scores, setScores] = useState({});
  const [overall, setOverall] = useState(null);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && !isAuthenticated) navigate('/login', { replace: true });
  }, [ready, isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchTracker()
      .then(setTracker)
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [isAuthenticated]);

  const criteria = tracker?.criteria || [];
  const checkpoints = tracker?.checkpoints || [];
  const activeCp = checkpoints.find((c) => c.status === 'active');

  async function save() {
    if (!activeCp || !overall) return;
    const filled = criteria.every((c) => scores[c]);
    if (!filled) return;
    setBusy(true);
    try {
      const updated = await submitCheckpoint(activeCp.index, {
        scores,
        overall,
        comment: comment.trim() || null,
      });
      setTracker(updated);
      setScores({});
      setOverall(null);
      setComment('');
    } catch {
      /* leave inputs so the user can retry */
    } finally {
      setBusy(false);
    }
  }

  const rightNav = (
    <button
      type="button"
      className="acBtn"
      style={{ left: 1301, top: 23, width: 281, height: 51, fontSize: 20 }}
      onClick={() => navigate('/account')}
    >
      Вернуться в профиль
    </button>
  );

  return (
    <Stage w={1633} mode="page">
      <div className="acCanvas" style={{ width: 1633 }}>
        <div style={{ position: 'relative', height: 235 }}>
          <TopNav right={rightNav} />
          <p
            className="acAbs acTitle"
            style={{ left: 0, top: 154, width: 1633, fontSize: 48, lineHeight: '64px' }}
          >
            Трекер результата
          </p>
        </div>

        <div className="trkWrap">
          <p className="acBody" style={{ textAlign: 'center', margin: '0 0 26px' }}>
            Отслеживай изменения кожи каждые две недели. Отмечай, как выражен каждый признак, и
            общий результат.
          </p>

          {!tracker && (
            <p className="acBody" style={{ textAlign: 'center', padding: '60px 0' }}>
              {loaded ? 'Трекер станет доступен после подбора ухода.' : 'Загружаем…'}
            </p>
          )}

          {/* Active checkpoint scoring */}
          {activeCp && (
            <div className="trkCard">
              <p className="acTitle" style={{ fontSize: 32, textAlign: 'left', margin: '0 0 6px' }}>
                Неделя {activeCp.index * 2}
              </p>
              <p className="careHint" style={{ margin: '0 0 20px' }}>
                {formatDate(activeCp.due_date)}
              </p>

              {criteria.map((c) => (
                <div className="trkCriterion" key={c}>
                  <span className="trkCritName">{c}</span>
                  <div className="trkScale">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`trkDot${scores[c] === n ? ' active' : ''}`}
                        onClick={() => setScores((s) => ({ ...s, [c]: n }))}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <p className="careHint" style={{ margin: '0 0 12px' }}>
                1 — нет / минимально выражено, 5 — сильно выражено
              </p>

              <p
                className="acTitle"
                style={{ fontSize: 20, textAlign: 'left', margin: '10px 0 8px' }}
              >
                Общая оценка
              </p>
              <div className="trkOverallRow">
                {OVERALL_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    className={`trkOverall${overall === o.value ? ' active' : ''}`}
                    onClick={() => setOverall(o.value)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <textarea
                className="trkComment"
                placeholder="Поделись своими наблюдениями…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                type="button"
                className="acBtn acModalBtn"
                style={{ width: 280, marginTop: 16 }}
                onClick={save}
                disabled={busy || !overall || !criteria.every((c) => scores[c])}
              >
                Сохранить изменения
              </button>
            </div>
          )}

          {/* History */}
          <p className="acTitle" style={{ fontSize: 36, textAlign: 'left', margin: '30px 0 20px' }}>
            История результата
          </p>
          <div className="trkHistory">
            {checkpoints.map((c) => (
              <div key={c.index} className={`trkHistCard${c.status === 'locked' ? ' locked' : ''}`}>
                <span className="trkBadge">{STATUS_LABEL[c.status] || c.status}</span>
                <p
                  className="acTitle"
                  style={{ fontSize: 20, textAlign: 'left', margin: '0 0 2px' }}
                >
                  Неделя {c.index * 2}
                </p>
                <p className="careHint" style={{ margin: '0 0 10px' }}>
                  {formatDate(c.due_date)}
                </p>
                {criteria.map((cr) => (
                  <p key={cr} style={{ margin: '2px 0', fontSize: 16 }}>
                    {cr}: {c.scores?.[cr] ? `${c.scores[cr]}/5` : '—/5'}
                  </p>
                ))}
                {c.overall && (
                  <p style={{ margin: '8px 0 0', fontWeight: 600 }}>{OVERALL_LABEL[c.overall]}</p>
                )}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button
              type="button"
              className="acBtn acModalBtn"
              style={{ width: 360, position: 'static' }}
              onClick={() => navigate('/account/care')}
            >
              Вернуться к текущему уходу
            </button>
          </div>
        </div>
      </div>
    </Stage>
  );
}
