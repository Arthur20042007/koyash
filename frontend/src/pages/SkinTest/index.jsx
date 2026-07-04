import { useState } from 'react';
import QuizStep from '../Quiz/QuizStep';
import SkinResult from './SkinResult';
import { SKIN_QUESTIONS, scoreSkinType } from './skinTypeConfig';

// Self-contained skin-type sub-quiz. onDone(type) is called with the detected
// skin type when the user confirms the result; onCancel() backs out to caller.
export default function SkinTest({ onDone, onCancel }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const setAnswer = (id, v) => setAnswers((p) => ({ ...p, [id]: v }));
  const isResult = step >= SKIN_QUESTIONS.length;

  function next() { setStep((s) => s + 1); }
  function back() {
    if (step === 0) { onCancel(); return; }
    setStep((s) => s - 1);
  }

  if (isResult) {
    const type = scoreSkinType(answers);
    return (
      <SkinResult
        type={type}
        onBack={() => setStep(SKIN_QUESTIONS.length - 1)}
        onDone={() => onDone(type)}
      />
    );
  }

  const q = SKIN_QUESTIONS[step];
  const progressPct = (step / SKIN_QUESTIONS.length) * 100;
  return (
    <QuizStep
      step={q}
      answer={answers[q.id]}
      progressPct={progressPct}
      onChange={(v) => setAnswer(q.id, v)}
      onNext={next}
      onBack={back}
    />
  );
}
