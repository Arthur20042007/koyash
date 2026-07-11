import { useNavigate } from 'react-router-dom';
import './account.css';
import heart from '../../assets/account/offer-spot.png';

// Как всё устроено / «Просто и понятно» (Figma 2673:1386) — a short explainer
// modal reached from the profile card. Laid out in normal flow so it stays
// readable at any width.
const STEPS = [
  'Пройди анкету и получи косметичку',
  'Отмечай результат каждые две недели',
  'Заменяй средства, которые не подошли',
  'Есть возможность пересобрать косметичку',
];

export default function HowItWorks() {
  const navigate = useNavigate();
  return (
    <div
      className="acModalOverlay"
      style={{ position: 'fixed', overflowY: 'auto' }}
      onClick={() => navigate(-1)}
    >
      <div
        className="acModal"
        style={{ width: 600, padding: '40px 44px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          className="acHeart"
          src={heart}
          alt=""
          aria-hidden="true"
          style={{
            width: 74,
            height: 74,
            objectFit: 'contain',
            margin: '0 auto 6px',
            display: 'block',
          }}
        />
        <p className="acModalTitle" style={{ fontSize: 34, lineHeight: '44px' }}>
          Просто и понятно
        </p>
        <ol style={{ textAlign: 'left', margin: '22px 0 30px', padding: 0, listStyle: 'none' }}>
          {STEPS.map((step, i) => (
            <li
              key={step}
              style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '0 0 18px' }}
            >
              <span
                style={{
                  flex: '0 0 auto',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#ffca96',
                  color: '#634938',
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {i + 1}
              </span>
              <span
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 20,
                  lineHeight: '27px',
                  color: '#634938',
                }}
              >
                {step}
              </span>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="acBtn acModalBtn"
          style={{ margin: '0 auto', display: 'flex', width: 190 }}
          onClick={() => navigate(-1)}
        >
          Понятно
        </button>
      </div>
    </div>
  );
}
