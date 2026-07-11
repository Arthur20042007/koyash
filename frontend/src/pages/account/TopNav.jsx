import { useNavigate } from 'react-router-dom';
import logo from '../../assets/landing/logo.png';

// Shared header for the account / auth screens. Matches the landing header
// (logo + three section links) and exposes the right-hand slot so each screen
// can drop in its own primary action ("Подобрать уход", the user's name, …).
// The section links return to the landing AND scroll to that section (the
// target id is passed through router state and read by LandingPage).
export default function TopNav({ right }) {
  const navigate = useNavigate();
  const go = (section) => () => navigate('/', { state: { scrollTo: section } });

  return (
    <>
      <img
        className="acAbs"
        src={logo}
        alt="Koyash"
        style={{ left: 182, top: -12, width: 233, height: 194, cursor: 'pointer' }}
        onClick={() => navigate('/')}
      />
      <button
        type="button"
        className="acAbs acNav"
        style={{ left: 509, top: 48 }}
        onClick={go('top')}
      >
        О нас
      </button>
      <button
        type="button"
        className="acAbs acNav"
        style={{ left: 631, top: 48 }}
        onClick={go('how')}
      >
        Как это работает?
      </button>
      <button
        type="button"
        className="acAbs acNav"
        style={{ left: 853, top: 48 }}
        onClick={go('trust')}
      >
        Забота и Доверие
      </button>

      {right ?? (
        <button
          type="button"
          className="acBtn"
          style={{ left: 1197, top: 41, width: 281, height: 51, fontSize: 20 }}
          onClick={() => navigate('/quiz')}
        >
          Подобрать уход
        </button>
      )}
    </>
  );
}
