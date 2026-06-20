import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Loading.css';
import Stage from './Stage';
import logo from '../../assets/quiz/logo.png';
import sceneLoading from '../../assets/quiz/scene-loading.png';
import { buildRequest } from './quizConfig';

const LOADING_STEPS = [
  'Смотрю, что подойдёт именно тебе...',
  'Проверяю составы...',
  'Убираю лишнее...',
  'Собираю косметичку...',
  'Почти готово, солнышко...',
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Loading({ answers }) {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(0);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    LOADING_STEPS.forEach((_, i) => {
      setTimeout(() => {
        setVisibleCount(i + 1);
        setProgress(Math.round(((i + 1) / LOADING_STEPS.length) * 80) + 8);
      }, i * 650);
    });

    const request = buildRequest(answers);
    fetch(`${API_URL}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 422) {
            return res.json().then((data) => {
              if (data?.detail?.error?.code === 'NO_PRODUCTS_AVAILABLE') return { noResults: true };
              throw new Error('API error');
            });
          }
          throw new Error('API error');
        }
        return res.json();
      })
      .then((data) => {
        setProgress(100);
        setTimeout(() => navigate('/results', { state: { results: data, answers } }), 550);
      })
      .catch(() => navigate('/results', { state: { error: true, answers } }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Stage>
      <div className="loadRoot">
        <img className="lLogo" src={logo} alt="Koyash" />
        <div className="lTrack"><div className="lFill" style={{ width: `${progress}%` }} /></div>

        <img className="lScene" src={sceneLoading} alt="" aria-hidden="true" />

        <span className="lNote">Солнце собирает твои ответы и наполняет косметичку.</span>
        <h1 className="lTitle">Подбираю уход именно для тебя...</h1>

        <ul className="lSteps">
          {LOADING_STEPS.map((text, i) => (
            <li
              key={i}
              className={`lStep${i < visibleCount ? ' visible' : ''}${i < visibleCount - 1 ? ' done' : ''}`}
            >
              — {text}
            </li>
          ))}
        </ul>

        <div className="lBarTrack"><div className="lBarFill" style={{ width: `${progress}%` }} /></div>
        <span className="lPercent">{progress}%</span>
      </div>
    </Stage>
  );
}
