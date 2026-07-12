import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './account.css';
import Stage from '../Quiz/Stage';
import TopNav from './TopNav';
import { useAuth } from '../../auth/useAuth';
import { fetchTracker, submitCheckpoint } from '../../api/client';
import heartImg from '../../assets/account/trk-heart.svg';
import flagImg from '../../assets/account/trk-flag.svg';
import lockImg from '../../assets/account/trk-lock.svg';
import arrowImg from '../../assets/account/trk-arrow.svg';
import faceNeutral from '../../assets/account/trk-face-neutral.svg';
import faceSad from '../../assets/account/trk-face-sad.svg';
import n1 from '../../assets/account/trk-n1.svg';
import n2 from '../../assets/account/trk-n2.svg';
import n3 from '../../assets/account/trk-n3.svg';
import n4 from '../../assets/account/trk-n4.svg';

const NUM = [null, n1, n2, n3, n4]; // Figma number circles, 1..4 (CSS fallback beyond)
const OVERALL_IMG = { better: heartImg, same: faceNeutral, worse: faceSad };

const OVERALL = [
  { value: 'better', label: 'Стало лучше', left: 1101, width: 144 },
  { value: 'same', label: 'Без изменений', left: 1252, width: 155 },
  { value: 'worse', label: 'Стало хуже', left: 1414, width: 144 },
];

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}
const weekLabel = (cp) => `Неделя ${cp.index * 2}`;

// green check — kept as SVG (green marks a filled checkpoint; no raster asset for it)
const IChk = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 26 26"><circle cx="13" cy="13" r="12" fill="#CDFFBB" />
    <path d="M7 13.5l4 4 8-8.5" fill="none" stroke="#087508" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const IChevron = ({ dir }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e9a563" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d={dir === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} /></svg>
);

// status marker: filled → green check ("отмечено"), available → arrow ("текущий"),
// locked → lock.
function StatIcon({ status }) {
  if (status === 'done') return <IChk />;
  if (status === 'active') return <img className="trkStatImg" src={arrowImg} alt="" />;
  return <img className="trkStatImg" src={lockImg} alt="" />;
}

// Трекер результата (Figma 2673:1842). Left checkpoint slider drives the centre
// scoring panel; only the active checkpoint is editable, filled ones are
// read-only (green check), future ones are locked.
export default function Tracker() {
  const navigate = useNavigate();
  const { isAuthenticated, ready } = useAuth();

  const [tracker, setTracker] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(null);
  const [scores, setScores] = useState({});
  const [overall, setOverall] = useState(null);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (ready && !isAuthenticated) navigate('/login', { replace: true });
  }, [ready, isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchTracker().then(setTracker).catch(() => {}).finally(() => setLoaded(true));
  }, [isAuthenticated]);

  const criteria = tracker?.criteria || [];
  const checkpoints = useMemo(() => tracker?.checkpoints || [], [tracker]);
  const activeCp = checkpoints.find((c) => c.status === 'active');

  useEffect(() => {
    if (!checkpoints.length) return;
    const done = [...checkpoints].reverse().find((c) => c.status === 'done');
    setSelected((prev) => prev ?? (activeCp?.index || done?.index || checkpoints[0].index));
  }, [checkpoints, activeCp]);

  const selectedCp = checkpoints.find((c) => c.index === selected) || null;
  const editable = selectedCp?.status === 'active';

  async function save() {
    if (!editable || !overall || !criteria.every((c) => scores[c])) return;
    setBusy(true);
    try {
      const updated = await submitCheckpoint(selectedCp.index, { scores, overall, comment: comment.trim() || null });
      setTracker(updated);
      setScores({});
      setOverall(null);
      setComment('');
    } catch {
      /* keep inputs so the user can retry */
    } finally {
      setBusy(false);
    }
  }

  const cellValue = (c) => (editable ? scores[c] : selectedCp?.scores?.[c]);
  const overallValue = editable ? overall : selectedCp?.overall;
  const canSave = editable && !busy && overall && criteria.every((c) => scores[c]);

  const items = tracker ? [{ start: true }, ...checkpoints] : [];
  const activeOrdinal = tracker
    ? (() => {
        const i = items.findIndex((it) => !it.start && it.index === activeCp?.index);
        if (i >= 0) return i;
        let last = 0;
        items.forEach((it, k) => { if (it.start || it.status === 'done') last = k; });
        return last;
      })()
    : 0;
  const fillFrac = items.length > 1 ? activeOrdinal / (items.length - 1) : 0;

  const rightNav = (
    <button type="button" className="acBtn" style={{ left: 1304, top: 23, width: 281, height: 51, fontSize: 20 }}
      onClick={() => navigate('/account')}>Вернуться в профиль</button>
  );

  const rowPitch = 60;
  const innerH = 44 + criteria.length * rowPitch;

  return (
    <Stage w={1633} mode="page">
      <div className="acCanvas" style={{ width: 1633, height: 1315 }}>
        <TopNav right={rightNav} />
        <p className="acAbs acTitle" style={{ left: 0, top: 154, width: 1633, fontSize: 48, lineHeight: '64px' }}>
          Трекер результата
        </p>
        <img className="acAbs acHeart" src={heartImg} alt="" style={{ left: 1040, top: 158, width: 58, height: 58 }} />

        <div className="trkBanner" style={{ left: 50, top: 246, width: 1533, height: 82 }}>
          <img src={heartImg} alt="" />
          <span>Отслеживай изменения кожи каждые две недели. Отмечай от 1 до 5, насколько выражен каждый
            признак, ставь общую оценку и оставляй наблюдения.</span>
        </div>

        {!tracker && (
          <p className="acAbs acBody" style={{ left: 0, top: 470, width: 1633, textAlign: 'center' }}>
            {loaded ? 'Трекер станет доступен после подбора ухода.' : 'Загружаем…'}
          </p>
        )}

        {tracker && (
          <>
            {/* ── left checkpoint slider ─────────────────────────────────── */}
            <div className="trkTl" style={{ left: 44, top: 390, width: 322, height: 494 }}>
              <div className="trkTlInner">
                <div className="trkTlTrack" />
                <div className="trkTlFill" style={{ height: `calc((100% - 56px) * ${fillFrac})` }} />
                {items.map((it) => {
                  if (it.start) {
                    return (
                      <div className="trkTlItem readonly" key="start">
                        <img className="trkDotImg" src={flagImg} alt="" />
                        <div className="trkTlCard">
                          <p className="trkTlName">Старт</p>
                          <p className="trkTlDate">Начало ухода · {formatDate(tracker.start_date)}</p>
                          <span className="trkTlStat"><IChk /></span>
                        </div>
                      </div>
                    );
                  }
                  const cls = `trkTlItem${it.index === selected ? ' sel' : ''}${it.status === 'locked' ? ' locked' : ''}`;
                  return (
                    <button type="button" className={cls} key={it.index} onClick={() => setSelected(it.index)}>
                      {NUM[it.index] ? <img className="trkDotImg" src={NUM[it.index]} alt="" /> : <span className="trkTlDot">{it.index}</span>}
                      <span className="trkTlCard">
                        <span className="trkTlName" style={{ display: 'block' }}>{weekLabel(it)}</span>
                        <span className="trkTlDate" style={{ display: 'block' }}>{formatDate(it.due_date)}</span>
                        <span className="trkTlStat"><StatIcon status={it.status} /></span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── centre panel ───────────────────────────────────────────── */}
            <div className="trkPanel" style={{ left: 376, top: 390, width: 689, height: 494 }} />
            {selectedCp && selectedCp.status === 'locked' && (
              <div className="trkLocked" style={{ left: 376, top: 390, width: 689, height: 494 }}>
                <img src={lockImg} alt="" style={{ width: 52, height: 52, objectFit: 'contain' }} />
                <span>{weekLabel(selectedCp)} откроется {formatDate(selectedCp.due_date)}</span>
              </div>
            )}
            {selectedCp && selectedCp.status !== 'locked' && (
              <>
                <p className="acAbs acTitle" style={{ left: 428, top: 404, width: 560, fontSize: 40, lineHeight: '53px', textAlign: 'left' }}>
                  {weekLabel(selectedCp)}
                </p>
                <p className="acAbs" style={{ left: 434, top: 474, fontFamily: 'Manrope', fontSize: 16, color: '#8a6a52' }}>
                  {formatDate(selectedCp.due_date)}
                </p>

                <div className="acAbs" style={{ left: 428, top: 519, width: 580, height: innerH, background: '#fff', border: '1px solid #f0e4d4', borderRadius: 17 }} />
                <p className="trkScaleLbl" style={{ left: 758, top: 521, width: 120 }}>нет / минимально выражено</p>
                <p className="trkScaleLbl" style={{ left: 915, top: 521, width: 80 }}>сильно выражено</p>

                {criteria.map((c, i) => {
                  const rowTop = 553 + i * rowPitch;
                  return (
                    <div key={c}>
                      {NUM[i + 1]
                        ? <img className="trkNumImg" style={{ left: 462, top: rowTop }} src={NUM[i + 1]} alt="" />
                        : <span className="trkNum" style={{ left: 462, top: rowTop }}>{i + 1}</span>}
                      <span className="trkCritName" style={{ left: 520, top: rowTop + 3, width: 230 }}>{c}</span>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button" disabled={!editable}
                          className={`trkBox${cellValue(c) === n ? ' on' : ''}`}
                          style={{ left: 768 + (n - 1) * 42, top: rowTop + 2 }}
                          onClick={() => editable && setScores((s) => ({ ...s, [c]: n }))}>
                          {n}
                        </button>
                      ))}
                    </div>
                  );
                })}

                {editable && (
                  <button type="button" className="acBtn" style={{ left: 580, top: 813, width: 281, height: 51, fontSize: 20 }}
                    onClick={save} disabled={!canSave}>Сохранить изменения</button>
                )}

                {/* ── right panel: overall rating ──────────────────────────── */}
                <div className="trkPanel" style={{ left: 1081, top: 390, width: 498, height: 494 }} />
                <p className="acAbs acTitle" style={{ left: 1121, top: 404, fontSize: 24, lineHeight: '32px', textAlign: 'left' }}>
                  Общая оценка
                </p>
                {OVERALL.map((o) => (
                  <button key={o.value} type="button" disabled={!editable}
                    className={`trkPill${overallValue === o.value ? ' on' : ''}`}
                    style={{ left: o.left, top: 480, width: o.width }}
                    onClick={() => editable && setOverall(o.value)}>
                    <img src={OVERALL_IMG[o.value]} alt="" />
                    {o.label}
                  </button>
                ))}
                <p className="acAbs" style={{ left: 1126, top: 565, fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 16, color: '#634938' }}>
                  Что изменилось за эти 2 недели?
                </p>
                <textarea className="trkArea" style={{ left: 1121, top: 598, width: 410, height: 178 }}
                  placeholder="Поделись своими наблюдениями…" disabled={!editable}
                  value={editable ? comment : selectedCp.comment || ''}
                  onChange={(e) => setComment(e.target.value)} />
                {editable && (
                  <button type="button" className="acBtn" style={{ left: 1180, top: 813, width: 281, height: 51, fontSize: 20 }}
                    onClick={save} disabled={!canSave}>Сохранить изменения</button>
                )}
              </>
            )}

            {/* ── history carousel ───────────────────────────────────────── */}
            <div className="acAbs" style={{ left: 50, top: 925, width: 1533, height: 250, background: '#fdf3e9', borderRadius: 20 }} />
            <p className="acAbs acTitle" style={{ left: 105, top: 934, fontSize: 36, lineHeight: '48px', textAlign: 'left' }}>
              История результата
            </p>
            <p className="acAbs" style={{ left: 985, top: 942, width: 565, fontFamily: 'Manrope', fontSize: 16, lineHeight: '22px', color: '#634938', textAlign: 'right' }}>
              Отмечай результат каждые 2 недели, чтобы видеть стабильный прогресс
            </p>

            <button type="button" className="trkArrow" style={{ left: 56, top: 1030 }}
              onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}><IChevron dir="left" /></button>
            <button type="button" className="trkArrow" style={{ left: 1533, top: 1030 }}
              onClick={() => setPage((p) => ((p + 1) * 3 < checkpoints.length ? p + 1 : p))}
              disabled={(page + 1) * 3 >= checkpoints.length}><IChevron dir="right" /></button>

            {checkpoints.slice(page * 3, page * 3 + 3).map((c, k) => {
              const locked = c.status === 'locked';
              return (
                <div key={c.index} className={`trkHistCard${locked ? ' locked' : ''}`}
                  style={{ left: 117 + k * 477, top: 1010, width: 456, height: 120 }}>
                  <div className="trkHistTop">
                    <span style={{ marginTop: 2 }}><StatIcon status={c.status} /></span>
                    <div>
                      <p className="trkHistName">{weekLabel(c)}</p>
                      <p className="trkHistDate">{formatDate(c.due_date)}</p>
                    </div>
                    {c.status === 'done' && <span className="trkHistStat ok">Отмечено</span>}
                    {locked && <span className="trkHistStat lock">Заблокирован</span>}
                  </div>
                  <div className="trkHistScores">
                    {criteria.map((cr) => (
                      <span className="trkHistScore" key={cr}>
                        <span className="trkHistScoreName" title={cr}>{cr}</span>
                        <span className="trkHistScoreVal">{c.scores?.[cr] ? `${c.scores[cr]}/5` : '—'}</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

            <button type="button" className="acBtn" style={{ left: 614, top: 1209, width: 405, height: 51, fontSize: 20 }}
              onClick={() => navigate('/account/care')}>Вернуться к текущему уходу</button>
          </>
        )}
      </div>
    </Stage>
  );
}
