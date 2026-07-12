import { useState } from 'react';
import ProductCard from './ProductCard';

// One product in the bag with its feedback controls (Figma 2673:1259).
// - "Подошло"   → PUT feedback liked
// - "Не подошло" → reveal a required comment box → PUT feedback disliked
// - once disliked, offer a replacement while the step still has swaps left
export default function CareCard({ item, replacementsLeft, busy, onFeedback, onReplace }) {
  const feedback = item.feedback; // 'liked' | 'disliked' | null
  const [commenting, setCommenting] = useState(false);
  const [comment, setComment] = useState(item.comment || '');

  function like() {
    setCommenting(false);
    onFeedback(item, { feedback: 'liked' });
  }

  function submitDislike() {
    if (!comment.trim()) return;
    onFeedback(item, { feedback: 'disliked', comment: comment.trim() });
    setCommenting(false);
  }

  const side = (
    <>
      <div className="careFbRow">
        <button
          type="button"
          className={`careFbBtn${feedback === 'liked' ? ' active' : ''}`}
          onClick={like}
          disabled={busy}
        >
          Подошло
        </button>
        <button
          type="button"
          className={`careFbBtn${feedback === 'disliked' ? ' active' : ''}`}
          onClick={() => setCommenting(true)}
          disabled={busy}
        >
          Не подошло
        </button>
      </div>

      {commenting && feedback !== 'disliked' && (
        <>
          <textarea
            className="careComment"
            placeholder="Что именно не так? Комментарий…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            type="button"
            className="acBtn acModalBtn"
            style={{ width: '100%' }}
            onClick={submitDislike}
            disabled={busy || !comment.trim()}
          >
            Отправить
          </button>
        </>
      )}

      {feedback === 'disliked' && (
        <>
          <p className="careThanks">Спасибо за отзыв!</p>
          {item.comment && (
            <p className="careWhy" style={{ margin: 0 }}>
              {item.comment}
            </p>
          )}
          {replacementsLeft > 0 ? (
            <>
              <button
                type="button"
                className="careReplaceLink"
                onClick={() => onReplace(item)}
                disabled={busy}
              >
                Заменить на похожий продукт
              </button>
              <span className="careHint">Можно заменить: {replacementsLeft}&nbsp;раза</span>
            </>
          ) : (
            <span className="careHint">
              Извини, но средство больше нельзя заменить — лимит исчерпан
            </span>
          )}
        </>
      )}
    </>
  );

  return <ProductCard item={item} side={side} dimmed={item.status === 'replaced'} />;
}
