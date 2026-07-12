import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './account.css';
import Stage from '../Quiz/Stage';
import TopNav from './TopNav';
import { useAuth } from '../../auth/useAuth';
import { fetchTracker, submitCheckpoint } from '../../api/client';
import heartImg from '../../assets/account/line-heart.png';
import cic1 from '../../assets/account/trk-ic1.png';
import cic2 from '../../assets/account/trk-ic2.png';
import cic3 from '../../assets/account/trk-ic3.png';
import cic4 from '../../assets/account/trk-ic4.png';

const CRIT_ICONS = [cic1, cic2, cic3, cic4];

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

/* ── small inline icons (match the warm line style) ─────────────────────── */
const IChk = () => (
  <svg width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="12" fill="#CDFFBB" />
    <path d="M7 13.5l4 4 8-8.5" fill="none" stroke="#087508" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const ILock = ({ c = '#b3a494' }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
    <rect x="5" y="10.5" width="14" height="9" rx="2.2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg>
);
const IArrow = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e9a563" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
);
const IFlag = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="#e9a563" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 22V4" /><path d="M7 5h11l-2.5 4L18 13H7" fill="#ffe0c1" /></svg>
);
const IHeart = ({ on }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={on ? '#e9a563' : 'none'} stroke="#e9a563" strokeWidth="1.8">
    <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10z" /></svg>
);
const IFaceMeh = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8a6a52" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M8.5 15h7" strokeLinecap="round" /><circle cx="9" cy="10" r="1" fill="#8a6a52" stroke="none" /><circle cx="15" cy="10" r="1" fill="#8a6a52" stroke="none" /></svg>
);
const IFaceSad = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8a6a52" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M8.5 15.5c1-1.4 6-1.4 7 0" strokeLinecap="round" /><circle cx="9" cy="10" r="1" fill="#8a6a52" stroke="none" /><circle cx="15" cy="10" r="1" fill="#8a6a52" stroke="none" /></svg>
);
const OVERALL_ICON = { better: (on) => <IHeart on={on} />, same: () => <IFaceMeh />, worse: () => <IFaceSad /> };
const IChevron = ({ dir }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e9a563" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d={dir === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} /></svg>
);

// Трекер результата (Figma 2673:1842). Left checkpoint slider drives the centre
// scoring panel; only the active checkpoint is editable, past ones are read-only,
// future ones locked. Wires to GET /tracker and PUT /tracker/checkpoints/{index}.
export default function Tracker() {
  const navigate = useNavigate();
  const { isAuthenticated, ready } = useAuth();

  const [tracker, setTracker] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(null); // checkpoint index being viewed
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

  // ── left timeline items: Старт + checkpoints ──────────────────────────────
  const items = tracker ? [{ start: true }, ...checkpoints] : [];
  const activeOrdinal = tracker
    ? (() => {
        const i = items.findIndex((it) => !it.start && it.index === (activeCp?.index));
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

  // criterion inner-box geometry (adapts to the number of criteria)
  const rowPitch = 60;
  const innerTop = 519;
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
                {items.map((it, i) => {
                  if (it.start) {
                    return (
                      <div className="trkTlItem readonly" key="start">
                        <span className="trkTlDot"><IFlag /></span>
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
                      <span className="trkTlDot">{i}</span>
                      <span className="trkTlCard">
                        <span className="trkTlName" style={{ display: 'block' }}>{weekLabel(it)}</span>
                        <span className="trkTlDate" style={{ display: 'block' }}>{formatDate(it.due_date)}</span>
                        <span className="trkTlStat">
                          {it.status === 'done' ? <IChk /> : it.status === 'active' ? <IArrow /> : <ILock />}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── centre panel: scoring for the selected checkpoint ──────── */}
            <div className="trkPanel" style={{ left: 376, top: 390, width: 689, height: 494 }} />
            {selectedCp && selectedCp.status === 'locked' && (
              <div className="trkLocked" style={{ left: 376, top: 390, width: 689, height: 494 }}>
                <ILock c="#c9b7a4" />
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

                <div className="acAbs" style={{ left: 428, top: innerTop, width: 580, height: innerH, background: '#fff', border: '1px solid #f0e4d4', borderRadius: 17 }} />
                <p className="trkScaleLbl" style={{ left: 758, top: 521, width: 120 }}>нет / минимально выражено</p>
                <p className="trkScaleLbl" style={{ left: 915, top: 521, width: 80 }}>сильно выражено</p>

                {criteria.map((c, i) => {
                  const rowTop = 553 + i * rowPitch;
                  return (
                    <div key={c}>
                      <span className="trkNum" style={{ left: 462, top: rowTop }}>{i + 1}</span>
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
                    {OVERALL_ICON[o.value](overallValue === o.value)}
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
              onClick={() => setPage((p) => (p + 1) * 3 < checkpoints.length ? p + 1 : p)}
              disabled={(page + 1) * 3 >= checkpoints.length}><IChevron dir="right" /></button>

            {checkpoints.slice(page * 3, page * 3 + 3).map((c, k) => {
              const locked = c.status === 'locked';
              return (
                <div key={c.index} className={`trkHistCard${locked ? ' locked' : ''}`}
                  style={{ left: 117 + k * 477, top: 1010, width: 456, height: 120 }}>
                  <div className="trkHistTop">
                    <span style={{ marginTop: 2 }}>{locked ? <ILock /> : <IChk />}</span>
                    <div>
                      <p className="trkHistName">{weekLabel(c)}</p>
                      <p className="trkHistDate">{formatDate(c.due_date)}</p>
                    </div>
                    <span className={`trkHistStat ${locked ? 'lock' : 'ok'}`}>
                      {locked ? 'Заблокирован' : c.status === 'active' ? 'Текущий' : 'Активная'}
                    </span>
                  </div>
                  <div className="trkHistScores">
                    {criteria.map((cr, j) => (
                      <span className="trkHistScore" key={cr}>
                        <img src={CRIT_ICONS[j % CRIT_ICONS.length]} alt="" />
                        {c.scores?.[cr] ? `${c.scores[cr]}/5` : '—/5'}
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
