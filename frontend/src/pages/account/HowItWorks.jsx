import { useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './account.css';
import heart from '../../assets/account/offer-spot.png';
import num1 from '../../assets/account/howto/num1.png';
import num2 from '../../assets/account/howto/num2.png';
import num3 from '../../assets/account/howto/num3.png';
import num4 from '../../assets/account/howto/num4.png';
import ill1 from '../../assets/account/howto/ill1.png';
import ill2 from '../../assets/account/howto/ill2.png';
import ill3 from '../../assets/account/howto/ill3.png';
import ill4 from '../../assets/account/howto/ill4.png';
import arrow from '../../assets/account/howto/arrow.png';

// Как всё устроено / «Просто и понятно» (Figma 2673:1386, 600×1350) — a modal
// explainer opened from the profile card. Four numbered step cards with their
// illustrations, connected by arrows. Scaled to fit narrow viewports.
const STEPS = [
  {
    num: num1,
    numStyle: { left: 76, top: 152, width: 56, height: 56 },
    ill: ill1,
    illStyle: { left: 325, top: 145, width: 170, height: 182 },
    cardY: 139,
    text: 'Пройди анкету и получи косметичку',
    textStyle: { left: 86, top: 236, width: 210 },
  },
  {
    num: num2,
    numStyle: { left: 70, top: 422, width: 60, height: 60 },
    ill: ill2,
    illStyle: { left: 320, top: 428, width: 216, height: 161 },
    cardY: 408,
    text: 'Отмечай результат каждые две недели',
    textStyle: { left: 86, top: 500, width: 224 },
  },
  {
    num: num3,
    numStyle: { left: 68, top: 690, width: 62, height: 62 },
    ill: ill3,
    illStyle: { left: 335, top: 715, width: 155, height: 152 },
    cardY: 678,
    text: 'Заменяй средства, которые не подошли',
    textStyle: { left: 83, top: 780, width: 224 },
  },
  {
    num: num4,
    numStyle: { left: 76, top: 970, width: 56, height: 56 },
    ill: ill4,
    illStyle: { left: 340, top: 965, width: 145, height: 170 },
    cardY: 949,
    text: 'Есть возможность пересобрать косметичку',
    textStyle: { left: 86, top: 1046, width: 210 },
  },
];
const ARROW_Y = [346, 616, 888];

export default function HowItWorks() {
  const navigate = useNavigate();
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const recompute = () => setScale(Math.min(1, (Math.min(window.innerWidth, 700) - 28) / 600));
    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, []);

  const close = () => navigate(-1);

  return (
    <div
      className="acModalOverlay"
      style={{ position: 'fixed', overflowY: 'auto', alignItems: 'flex-start', padding: '24px 0' }}
      onClick={close}
    >
      <div
        style={{ width: 600 * scale, height: 1350 * scale }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            position: 'relative',
            width: 600,
            height: 1350,
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
            background: '#ffffff',
            borderRadius: 28,
            boxShadow: '0 24px 60px rgba(99, 73, 56, 0.28)',
            color: '#634938',
            fontFamily: "'Manrope', sans-serif",
            overflow: 'hidden',
          }}
        >
          <p
            style={{
              position: 'absolute',
              left: 133,
              top: 42,
              width: 304,
              margin: 0,
              textAlign: 'center',
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: 34,
              lineHeight: '44px',
              color: '#634938',
            }}
          >
            Просто и понятно
          </p>
          <img
            className="acHeart"
            src={heart}
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 440,
              top: 44,
              width: 54,
              height: 54,
              objectFit: 'contain',
            }}
          />

          {STEPS.map((s, i) => (
            <div key={i}>
              <div
                style={{
                  position: 'absolute',
                  left: 50,
                  top: s.cardY,
                  width: 500,
                  height: 203,
                  background: '#FFFDFA',
                  border: '1px solid #E9A563',
                  borderRadius: 20,
                }}
              />
              <img
                src={s.ill}
                alt=""
                aria-hidden="true"
                style={{ position: 'absolute', objectFit: 'contain', ...s.illStyle }}
              />
              <img
                src={s.num}
                alt=""
                aria-hidden="true"
                style={{ position: 'absolute', objectFit: 'contain', ...s.numStyle }}
              />
              <p
                style={{
                  position: 'absolute',
                  margin: 0,
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 500,
                  fontSize: 20,
                  lineHeight: '27px',
                  color: '#634938',
                  ...s.textStyle,
                }}
              >
                {s.text}
              </p>
            </div>
          ))}

          {ARROW_Y.map((y) => (
            <img
              key={y}
              src={arrow}
              alt=""
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 282,
                top: y,
                width: 38,
                height: 60,
                objectFit: 'contain',
              }}
            />
          ))}

          <button
            type="button"
            className="acBtn"
            style={{ left: 200, top: 1257, width: 200, height: 51, fontSize: 20 }}
            onClick={close}
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}
