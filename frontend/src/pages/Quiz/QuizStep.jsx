import './QuizStep.css';
import Stage from './Stage';
import logo from '../../assets/quiz/logo.png';

const NOTE_Y = 171;
const NARR_Y = 217;
const BTN_Y = 641;
const OPTS_BOTTOM = 632; // options must end above the buttons

export default function QuizStep({ step, answer, progressPct, onChange, onNext, onBack }) {
  const isTip = step.type === 'tip';
  const f = step.fig;
  const cx = f.content.x;
  const cw = f.content.w;
  const pillW = 1180 - cx; // note/highlight pills may run wider than the text column

  function handleOptionClick(value) {
    if (step.type === 'single') {
      onChange(value);
    } else if (step.type === 'multi') {
      const current = answer || [];
      if (value === null) {
        onChange(current.includes(null) ? [] : [null]);
        return;
      }
      const without = current.filter((v) => v !== null);
      if (without.includes(value)) {
        onChange(without.filter((v) => v !== value));
      } else {
        if (step.max && without.length >= step.max) return;
        onChange([...without, value]);
      }
    }
  }

  const isSelected = (value) =>
    step.type === 'single'
      ? answer === value
      : Array.isArray(answer) && answer.includes(value);

  function canProceed() {
    if (isTip) return true;
    if (step.type === 'input') return Boolean(answer && String(answer).trim());
    if (step.type === 'single') return answer !== null && answer !== undefined;
    if (step.type === 'multi') return Array.isArray(answer) && answer.length > 0;
    return true;
  }

  // Distribute options between optsY and the buttons so they never overlap.
  const optionGap = (() => {
    if (!step.options) return 12;
    const n = step.options.length;
    if (n <= 1) return 0;
    const rowH = 30;
    const avail = OPTS_BOTTOM - (f.optsY ?? 430);
    return Math.max(6, Math.min(16, (avail - n * rowH) / (n - 1)));
  })();

  return (
    <Stage>
      <div className="anketaRoot">
        <img className="aLogo" src={logo} alt="Koyash" />
        <div className="aTrack"><div className="aFill" style={{ width: `${progressPct}%` }} /></div>

        {step.scene && (
          <img
            key={step.id}
            className="aScene"
            src={step.scene}
            alt=""
            aria-hidden="true"
            style={{ left: f.scene.x, top: f.scene.y, width: f.scene.w, height: f.scene.h }}
          />
        )}

        {isTip ? (
          <>
            <div className="aPos" style={{ left: cx, top: f.noteY, width: pillW }}>
              <span className="aNote">{step.noteLabel}</span>
            </div>
            <h2 className="aTipTitle aPos" style={{ left: cx, top: f.titleY, width: cw }}>{step.title}</h2>
            <p className="aTipBody aPos" style={{ left: cx, top: f.bodyY, width: cw }}>{step.body}</p>
            {step.highlight && (
              <div className="aPos" style={{ left: cx, top: f.hiY, width: cw }}>
                <span className="aTipHi">{step.highlight}</span>
              </div>
            )}
          </>
        ) : (
          <>
            {step.note && (
              <div className="aPos" style={{ left: cx, top: NOTE_Y, width: pillW }}>
                <span className="aNote">{step.note}</span>
              </div>
            )}
            {step.noteBody && (
              <p className="aNarrative aPos" style={{ left: cx, top: NARR_Y, width: cw }}>{step.noteBody}</p>
            )}
            <h2 className="aHeading aPos" style={{ left: cx, top: f.headY, width: pillW }}>{step.question}</h2>
            {step.subQuestion && (
              <p className="aSub aPos" style={{ left: cx, top: f.subY, width: pillW }}>{step.subQuestion}</p>
            )}

            {step.type === 'input' && (
              <input
                className="aInput aPos"
                style={{ left: cx, top: f.fieldY }}
                type="number"
                min="10"
                max="100"
                placeholder={step.placeholder}
                value={answer || ''}
                onChange={(e) => onChange(e.target.value)}
              />
            )}

            {(step.type === 'single' || step.type === 'multi') && (
              <div className="aOptions aPos" style={{ left: cx, top: f.optsY, width: cw, gap: optionGap }}>
                {step.options.map((opt) => (
                  <button
                    key={opt.value ?? 'none'}
                    type="button"
                    className={`aOption${isSelected(opt.value) ? ' selected' : ''}`}
                    onClick={() => handleOptionClick(opt.value)}
                  >
                    <span className={step.type === 'multi' ? 'aCheck' : 'aRadio'} />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <button className="aBtn aBtnBack" type="button" onClick={onBack}>Назад</button>
        <button className="aBtn aBtnNext" type="button" onClick={onNext} disabled={!canProceed()}>
          Дальше →
        </button>
      </div>
    </Stage>
  );
}
