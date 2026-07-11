import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './account.css';
import Stage from '../Quiz/Stage';
import TopNav from './TopNav';
import CareCard from './CareCard';
import ConfirmDialog from './ConfirmDialog';
import { useAuth } from '../../auth/useAuth';
import { fetchCare, setItemFeedback } from '../../api/client';
import { formatPrice } from './careFormat';

const MAX_REPLACEMENTS = 2;

// Моя косметичка (Figma 2673:1259) — the saved bag with per-product feedback
// and a link into the replacement flow. Reads /care and writes feedback via
// PUT /care/items/{id}/feedback.
export default function Care() {
  const navigate = useNavigate();
  const { isAuthenticated, ready } = useAuth();

  const [care, setCare] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [askUpdate, setAskUpdate] = useState(false);

  useEffect(() => {
    if (ready && !isAuthenticated) navigate('/login', { replace: true });
  }, [ready, isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchCare()
      .then(setCare)
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [isAuthenticated]);

  async function handleFeedback(item, payload) {
    setBusy(true);
    try {
      const updated = await setItemFeedback(item.product.id, payload);
      setCare(updated);
    } catch {
      /* keep previous state on failure */
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

  const items = care?.items || [];
  const active = items.filter((i) => i.status !== 'replaced');
  const replaced = items.filter((i) => i.status === 'replaced');
  const replacements = care?.replacements || {};
  const leftFor = (item) => MAX_REPLACEMENTS - (replacements[item.product.routine_step] || 0);

  return (
    <Stage w={1633} mode="page">
      <div className="acCanvas" style={{ width: 1633 }}>
        <div style={{ position: 'relative', height: 235 }}>
          <TopNav right={rightNav} />
          <p
            className="acAbs acTitle"
            style={{ left: 0, top: 154, width: 1633, fontSize: 48, lineHeight: '64px' }}
          >
            Моя косметичка
          </p>
        </div>

        {care ? (
          <>
            <div className="careList">
              <div className="careBanner">
                Оцени каждое средство: подошло или не подошло. Если что-то не подошло — оставь
                комментарий и подбери похожую замену.
              </div>
              {active.map((item) => (
                <CareCard
                  key={item.product.id}
                  item={item}
                  replacementsLeft={leftFor(item)}
                  busy={busy}
                  onFeedback={handleFeedback}
                  onReplace={(it) => navigate(`/account/care/replace/${it.product.id}`)}
                />
              ))}
              {replaced.map((item) => (
                <CareCard
                  key={item.product.id}
                  item={item}
                  replacementsLeft={0}
                  busy={busy}
                  onFeedback={handleFeedback}
                  onReplace={() => {}}
                />
              ))}
            </div>

            <div className="careFootRow">
              <button
                type="button"
                className="acBtn acBtnGhost acModalBtn"
                style={{ width: 200 }}
                onClick={() => navigate('/account')}
              >
                Назад
              </button>
              <button
                type="button"
                className="acBtn acModalBtn"
                style={{ width: 325 }}
                onClick={() => setAskUpdate(true)}
              >
                Обновить косметичку
              </button>
              <button
                type="button"
                className="acBtn acModalBtn"
                style={{ width: 325 }}
                onClick={() => navigate('/account/tracker')}
              >
                Трекер результата
              </button>
              <span className="careSum">Сумма: {formatPrice(care.total_price_rub)}</span>
            </div>
          </>
        ) : (
          <p className="acBody" style={{ textAlign: 'center', padding: '80px 0' }}>
            {loaded ? 'Косметичка пока пуста — пройди подбор ухода.' : 'Загружаем…'}
          </p>
        )}

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
