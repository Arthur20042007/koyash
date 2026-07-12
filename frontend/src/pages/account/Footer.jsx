import cloud from '../../assets/account/foot-cloud.png';
import email from '../../assets/account/foot-email.png';
import telegram from '../../assets/account/foot-telegram.png';
import heart from '../../assets/account/offer-spot.png';

// Shared cabinet footer (contacts + legal links), positioned at the raw Figma
// coordinates near the bottom of the 1789px cabinet canvas.
export default function Footer() {
  return (
    <>
      <div
        className="acAbs"
        style={{ left: 9, top: 1529, width: 1633, height: 0, borderTop: '3px solid #634938' }}
      />

      <img
        className="acAbs"
        src={cloud}
        alt=""
        aria-hidden="true"
        style={{ left: 205, top: 1520, width: 620, height: 233, objectFit: 'contain' }}
      />
      <p
        className="acAbs acHeading"
        style={{
          left: 347,
          top: 1592,
          width: 307,
          fontWeight: 600,
          fontSize: 28,
          lineHeight: '37px',
          textAlign: 'center',
        }}
      >
        Остались вопросы? Свяжитесь с нами
      </p>
      <img
        className="acAbs acHeart"
        src={heart}
        alt=""
        aria-hidden="true"
        style={{ left: 634, top: 1604, width: 46, height: 58 }}
      />

      <p
        className="acAbs"
        style={{
          left: 886,
          top: 1545,
          width: 128,
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: 24,
          lineHeight: '32px',
          color: '#634938',
        }}
      >
        Контакты:
      </p>
      <span
        className="acAbs"
        aria-hidden="true"
        style={{
          left: 874,
          top: 1591,
          width: 51,
          height: 52,
          backgroundImage: `url(${email})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
        }}
      />
      <a
        className="acAbs"
        href="mailto:d.minnakhmetova@innopolis.university"
        style={{
          left: 943,
          top: 1600,
          width: 470,
          fontSize: 20,
          lineHeight: '27px',
          color: '#634938',
          textDecoration: 'none',
        }}
      >
        d.minnakhmetova@innopolis.university
      </a>
      <span
        className="acAbs"
        aria-hidden="true"
        style={{
          left: 875,
          top: 1651,
          width: 51,
          height: 51,
          backgroundImage: `url(${telegram})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
        }}
      />
      <a
        className="acAbs"
        href="https://t.me/diana_minn"
        target="_blank"
        rel="noreferrer"
        style={{
          left: 943,
          top: 1663,
          width: 470,
          fontSize: 20,
          lineHeight: '27px',
          color: '#634938',
          textDecoration: 'none',
        }}
      >
        @diana_minn
      </a>

      <p
        className="acAbs"
        style={{
          left: -1,
          top: 1733,
          width: 560,
          fontSize: 20,
          lineHeight: '27px',
          color: '#634938',
          textAlign: 'center',
        }}
      >
        Политика конфиденциальности
      </p>
      <p
        className="acAbs"
        style={{
          left: 578,
          top: 1733,
          width: 560,
          fontSize: 20,
          lineHeight: '27px',
          color: '#634938',
          textAlign: 'center',
        }}
      >
        © 2026 Koyash. Персональный подбор косметики.
      </p>
      <p
        className="acAbs"
        style={{
          left: 1152,
          top: 1733,
          width: 560,
          fontSize: 20,
          lineHeight: '27px',
          color: '#634938',
          textAlign: 'center',
        }}
      >
        Пользовательское соглашение
      </p>
    </>
  );
}
