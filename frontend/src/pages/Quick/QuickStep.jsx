import './QuickStep.css';
import Stage from '../Quiz/Stage';
import logo from '../../assets/landing/logo.png';

const AGE_MIN = 10;
const AGE_MAX = 100;
function ageError(value) {
  if (value === '' || value === undefined || value === null) return '';
  const n = Number(value);
  if (!Number.isFinite(n)) return 'Введите возраст числом';
  if (n < AGE_MIN) return `Возраст должен быть не меньше ${AGE_MIN}`;
  if (n > AGE_MAX) return `Возраст должен быть не больше ${AGE_MAX}`;
  return '';
}

export default function QuickStep({ step, answer, progressPct, onChange, onNext, onBack, onSkinTest }) {
  const f = step.fig;
  const isAge = step.id === 'age';
  const ageErr = isAge ? ageError(answer) : '';

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
      if (without.includes(value)) onChange(without.filter((v) => v !== value));
      else {
        if (step.max && without.length >= step.max) return;
        onChange([...without, value]);
      }
    }
  }

  const isSelected = (value) =>
    step.type === 'single' ? answer === value : Array.isArray(answer) && answer.includes(value);

  function canProceed() {
    if (step.type === 'input') return Boolean(answer && String(answer).trim()) && !(isAge && ageErr);
    if (step.type === 'single') return answer !== null && answer !== undefined;
    if (step.type === 'multi') return Array.isArray(answer) && answer.length > 0;
    return true;
  }

  const opts = f.opts || {};
  const twoCol = opts.cols === 2;

  return (
    <Stage>
      <div className="kRoot">
        <img className="kLogo" src={logo} alt="Koyash" />
        <div className="kTrack" />
        <div className="kFill" style={{ width: `${(progressPct / 100) * 1307}px` }} />

        {step.scene && (
          <img
            key={step.id}
            className="kScene"
            src={step.scene}
            alt=""
            aria-hidden="true"
            style={{ left: f.scene.x, top: f.scene.y, width: f.scene.w, height: f.scene.h }}
          />
        )}
        {(step.decor || []).map((d, i) => (
          <img
            key={i}
            className="kDecor"
            src={d.img}
            alt=""
            aria-hidden="true"
            style={{ left: d.x, top: d.y, width: d.w, height: d.h }}
          />
        ))}

        <h2 className="kHead" style={{ left: f.head.x, top: f.head.y, width: f.head.w }}>
          {step.question}
          {step.subQuestion && <span className="kHeadSub"> {step.subQuestion}</span>}
        </h2>
        {step.subNote && f.subNote && (
          <div className="kSubNote" style={{ left: f.subNote.x, top: f.subNote.y, width: f.subNote.w }}>
            {step.subNote}
          </div>
        )}
        <p className="kHelper" style={{ left: f.helper.x, top: f.helper.y, width: f.helper.w }}>
          {step.helper}
        </p>

        {step.type === 'input' && (
          <>
            <input
              className={`kInput${isAge && ageErr ? ' kInputErr' : ''}`}
              style={{ left: f.input.x, top: f.input.y, width: f.input.w }}
              type="number"
              min="10"
              max="100"
              placeholder={step.placeholder}
              value={answer || ''}
              onChange={(e) => onChange(e.target.value)}
            />
            {isAge && ageErr && (
              <div className="kInputError" style={{ left: f.input.x, top: f.input.y + 56, width: f.input.w }}>
                {ageErr}
              </div>
            )}
          </>
        )}

        {(step.type === 'single' || step.type === 'multi') && (
          <div
            className={`kOpts${twoCol ? ' kOptsGrid' : ''}`}
            style={{
              left: opts.x,
              top: opts.y,
              rowGap: `${(opts.rowGap || 40) - 27}px`,
              ...(twoCol
                ? {
                    columnGap: `${opts.col2x - opts.x - 300}px`,
                    gridTemplateColumns: '300px max-content',
                  }
                : {}),
            }}
          >
            {step.options.map((o, i) => (
              <button
                key={o.value ?? `none${i}`}
                type="button"
                className={`kOpt${isSelected(o.value) ? ' sel' : ''}`}
                onClick={() => handleOptionClick(o.value)}
              >
                <span className={step.type === 'multi' ? 'kCheck' : 'kRadio'} />
                {o.label}
              </button>
            ))}
          </div>
        )}

        <button
          className="kBtn kBack"
          type="button"
          style={{ left: f.back.x, top: f.back.y }}
          onClick={onBack}
        >
          Назад
        </button>
        {step.skinTestBtn && (
          <button
            className="kBtn kSkinTest"
            type="button"
            style={{ left: step.skinTestBtn.x, top: step.skinTestBtn.y, width: step.skinTestBtn.w }}
            onClick={onSkinTest}
          >
            {step.skinTestBtn.label}
          </button>
        )}
        <button
          className="kBtn kNext"
          type="button"
          style={{ left: f.next.x, top: f.next.y }}
          onClick={onNext}
          disabled={!canProceed()}
        >
          Дальше →
        </button>
      </div>
    </Stage>
  );
}
