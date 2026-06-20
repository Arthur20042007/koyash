import { useState } from 'react';

import styles from './QuizScreen3.module.css';

import logo from '../../assets/quiz/logo.png';
import sceneBudget from '../../assets/quiz/scene-budget.png';

const options = [
  'До 3 500 ₽ — бюджетно и практично',
  '3 500 – 8 000 ₽ — средний сегмент',
  'От 8 000 ₽ — готова к более дорогим средствам',
];

export default function QuizScreen3({ onBack, onNext }) {
  const [selected, setSelected] = useState(null);

  const handleNext = () => {
    if (onNext) onNext(selected);
  };

  return (
    <main className={styles.viewport}>
      <section className={styles.screen} aria-labelledby="budget-title">
        <img className={styles.logo} src={logo} alt="Koyash" />

        <div className={styles.progress} aria-hidden="true">
          <span className={styles.progressActive} />
        </div>

        <img
          className={styles.sceneBudget}
          src={sceneBudget}
          alt="Солнечная чашка у окна"
        />

        <div className={styles.quoteCard}>
          Солнце мягко освещает стол, чашку и аккуратно разложенные баночки.
        </div>

        <p className={styles.leadText}>
          — Любопытно, что стоимость средства часто определяется не ингредиентами,
          а упаковкой, маркетингом и брендом. Один и тот же актив может встречаться
          и в аптечном креме, и в люксовом. Поэтому бюджет помогает мне сузить
          поиск, а не оценить качество ухода.
        </p>

        <h1 id="budget-title" className={styles.title}>
          На сколько ориентируемся?
        </h1>

        <p className={styles.subtitle}>
          (стоимость одной косметички, хватит на 2-3 месяца)
        </p>

        <div className={styles.options} role="radiogroup" aria-label="Бюджет косметички">
          {options.map((option, index) => (
            <button
              className={styles.option}
              type="button"
              role="radio"
              aria-checked={selected === index}
              key={option}
              onClick={() => setSelected(index)}
            >
              <span className={styles.optionCircle} aria-hidden="true" />
              <span className={styles.optionText}>{option}</span>
            </button>
          ))}
        </div>

        <button
          className={`${styles.button} ${styles.buttonBack}`}
          type="button"
          onClick={onBack}
        >
          Назад
        </button>
        <button
          className={`${styles.button} ${styles.buttonNext}`}
          type="button"
          onClick={handleNext}
        >
          Дальше →
        </button>
      </section>
    </main>
  );
}
