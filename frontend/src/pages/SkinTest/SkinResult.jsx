import './SkinResult.css';
import Stage from '../Quiz/Stage';
import logo from '../../assets/landing/logo.png';
import { SKIN_RESULTS, RESULT_SCENE, RESULT_NOTE } from './skinTypeConfig';

export default function SkinResult({ type, onBack, onDone }) {
  const r = SKIN_RESULTS[type] || SKIN_RESULTS.normal;
  return (
    <Stage>
      <div className="srRoot">
        <img className="srLogo" src={logo} alt="Koyash" />
        <div className="srTrack" />
        <div className="srFill" style={{ width: '1307px' }} />

        <img className="srScene" src={RESULT_SCENE} alt="" aria-hidden="true"
          style={{ left: 615, top: 93, width: 633, height: 633 }} />

        <div className="srNote" style={{ left: 71, top: 120 }}>{RESULT_NOTE}</div>
        <p className="srNarr" style={{ left: 71, top: 191, width: 607 }}>{r.narr}</p>
        <h2 className="srHead" style={{ left: 71, top: 326, width: r.headW || 660 }}>{r.heading}</h2>

        <ul className="srBullets" style={{ left: 77, top: 440 }}>
          {r.bullets.map((b) => <li key={b}>{b}</li>)}
        </ul>

        <button className="srBtn srBack" type="button" style={{ left: 85, top: 650 }} onClick={onBack}>Назад</button>
        <button className="srBtn srNext" type="button" style={{ left: 439, top: 650 }} onClick={onDone}>
          Вернуться к вопросам →
        </button>
      </div>
    </Stage>
  );
}
