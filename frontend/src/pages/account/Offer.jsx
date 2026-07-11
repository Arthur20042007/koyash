import { useNavigate } from 'react-router-dom';
import './account.css';
import Stage from '../Quiz/Stage';

import spot from '../../assets/account/offer-spot.png';
import hero from '../../assets/account/offer-hero.png';
import card1 from '../../assets/account/offer-card-1.png';
import card2 from '../../assets/account/offer-card-2.png';
import card3 from '../../assets/account/offer-card-3.png';
import card4 from '../../assets/account/offer-card-4.png';

// Предложение о регистрации (Figma 2851:2). Shown after a guest generates a
// bag, nudging them to register so the result is saved. "Назад" returns to the
// results; the CTAs go to the auth screens.
const CARDS = [
  {
    icon: card1,
    iconStyle: { left: 86, top: 231, width: 123, height: 105 },
    top: 222,
    title: 'Личный кабинет',
    text: 'Сохраняются особенности кожи и твои предпочтения',
  },
  {
    icon: card2,
    iconStyle: { left: 75, top: 374, width: 146, height: 93 },
    top: 359,
    title: 'Моя косметичка',
    text: 'Сохраняется твой уход, который можно полностью обновить',
  },
  {
    icon: card3,
    iconStyle: { left: 92, top: 499, width: 112, height: 116 },
    top: 496,
    title: 'Трекер результата',
    text: 'Отмечай изменения и отслеживай свой прогресс',
  },
  {
    icon: card4,
    iconStyle: { left: 87, top: 636, width: 110, height: 116 },
    top: 634,
    title: 'Замена ухода',
    text: 'Если средство не подошло, то оставь отзыв и замени на более подходящее',
  },
];

export default function Offer() {
  const navigate = useNavigate();

  return (
    <Stage w={1189} h={827} mode="screen">
      <div className="acCanvas" style={{ width: 1189, height: 827 }}>
        <p className="acAbs acTitle" style={{ left: 75, top: 49, width: 325 }}>
          Сохрани свой уход
        </p>
        <img
          className="acAbs acHeart"
          src={spot}
          alt=""
          aria-hidden="true"
          style={{ left: 391, top: 29, width: 101, height: 101 }}
        />
        <p className="acAbs acBody" style={{ left: 75, top: 111, width: 407 }}>
          Ты уже подобрал уход для своей кожи. Зарегистрируйся, чтобы сохранить рекомендации и
          вернуться к ним позже.
        </p>
        <img
          className="acAbs"
          src={hero}
          alt=""
          aria-hidden="true"
          style={{ left: 507, top: 79, width: 649, height: 487 }}
        />

        {CARDS.map((c) => (
          <div key={c.title}>
            <div className="acCard" style={{ left: 75, top: c.top, width: 444, height: 123 }} />
            <img className="acAbs" src={c.icon} alt="" aria-hidden="true" style={c.iconStyle} />
            <p className="acAbs acHeading" style={{ left: 233, top: c.top + 20, width: 262 }}>
              {c.title}
            </p>
            <p className="acAbs acSmall" style={{ left: 233, top: c.top + 60, width: 286 }}>
              {c.text}
            </p>
          </div>
        ))}

        <button
          type="button"
          className="acBtn acBtnGhost"
          style={{ left: 655, top: 602, width: 354, height: 51, fontSize: 20 }}
          onClick={() => navigate(-1)}
        >
          Назад
        </button>
        <button
          type="button"
          className="acBtn"
          style={{ left: 655, top: 670, width: 354, height: 50, fontSize: 20 }}
          onClick={() => navigate('/register')}
        >
          Зарегистрироваться
        </button>

        <p className="acAbs acBody" style={{ left: 714, top: 738, width: 176, textAlign: 'right' }}>
          Уже есть аккаунт?
        </p>
        <button
          type="button"
          className="acAbs acLink"
          style={{ left: 896, top: 738, fontSize: 20, lineHeight: '27px' }}
          onClick={() => navigate('/login')}
        >
          Войти
        </button>
      </div>
    </Stage>
  );
}
