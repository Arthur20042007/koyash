import './style.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Stage from '../Quiz/Stage';

import logo from '../../assets/landing/logo.png';
import mascot from '../../assets/landing/maskot.png';
import heart from '../../assets/landing/heart.png';
import problemNote from '../../assets/landing/problem-caption-note.png';
import cloudNote from '../../assets/landing/decor-cloud-note.png';
import problemArrow from '../../assets/landing/problem-arrow.png';
import lineHeart from '../../assets/landing/line-heart.png';
import lineHeart2 from '../../assets/landing/line-heart-2.png';
import hLineLeft from '../../assets/landing/horizontal-line-left.png';
import hLineRight from '../../assets/landing/horizontal-line-right.png';
import decorCream from '../../assets/landing/decor-cream.png';
import smear from '../../assets/landing/smear.png';
import analysisSmear from '../../assets/landing/analysis-smear.png';
import analysisLine from '../../assets/landing/analysis-line.png';
import aLeft from '../../assets/landing/analysis-decor-left.png';
import aMid from '../../assets/landing/analysis-decor-middle.png';
import aRight from '../../assets/landing/analysis-decor-right.png';
import step1 from '../../assets/landing/step-icon-1.png';
import step2 from '../../assets/landing/step-icon-2.png';
import step3 from '../../assets/landing/step-icon-3.png';
import trustSun from '../../assets/landing/trust-sun.png';
import imagePhotoroom from '../../assets/landing/advice-cta.png';
import endCloud from '../../assets/landing/end-cloud.png';
import endEmail from '../../assets/landing/end-email.png';
import endTelegram from '../../assets/landing/end-telegram.png';

const Img = ({ src, x, y, w, h, cls = '', reveal = true }) => (
  <img
    className={`lAbs ${reveal ? 'reveal' : ''} ${cls}`.trim()}
    src={src}
    alt=""
    aria-hidden="true"
    style={{ left: x, top: y, width: w, height: h }}
  />
);
const T = ({ x, y, w, cls = 'lBody', align = 'left', reveal = true, style, children }) => (
  <p
    className={`lAbs ${reveal ? 'reveal' : ''} ${cls}`.trim()}
    style={{ left: x, top: y, width: w, textAlign: align, ...style }}
  >
    {children}
  </p>
);
const Btn = ({ x, y, onClick, children }) => (
  <button type="button" className="lBtn reveal" style={{ left: x, top: y }} onClick={onClick}>
    {children}
  </button>
);

// Section title sitting on a smear: text is centered (H+V) over the brush.
const SmearTitle = ({ x, y, w, h, flip = false, src = smear, children }) => (
  <>
    <img
      className={`lAbs lSmear reveal${flip ? ' lFlip' : ''}`}
      src={src}
      alt=""
      aria-hidden="true"
      style={{ left: x, top: y, width: w, height: h }}
    />
    <div className="lAbs lSmearTitle reveal" style={{ left: x, top: y, width: w, height: h }}>
      {children}
    </div>
  </>
);

export function LandingPage() {
  const navigate = useNavigate();
  const story = () => navigate('/quiz');
  const quick = () => navigate('/quick');

  // Custom eased scroll — smoother and gentler than native smooth behaviour,
  // with a duration that scales a little with distance so long jumps don't
  // feel rushed. Respects prefers-reduced-motion.
  const scrollTo = (id) => () => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targetY = el.getBoundingClientRect().top + window.scrollY - 24;
    if (reduce) {
      window.scrollTo(0, targetY);
      return;
    }

    const startY = window.scrollY;
    const dist = targetY - startY;
    const duration = Math.min(1400, Math.max(650, Math.abs(dist) * 0.5));
    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      window.scrollTo(0, startY + dist * easeInOutCubic(p));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  useEffect(() => {
    const els = document.querySelectorAll('.landingCanvas .reveal');
    const io = new IntersectionObserver(
      (e) =>
        e.forEach((x) => {
          if (x.isIntersecting) {
            x.target.classList.add('in');
            io.unobserve(x.target);
          }
        }),
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // The three upper "Подобрать уход" buttons scroll to the choice section
  // (story vs quick) instead of jumping straight into a quiz.
  const toChoice = scrollTo('choice');

  return (
    <Stage w={1633} h={4149} mode="page">
      <div className="landingCanvas">
        <span id="top" className="lAbs" style={{ left: 0, top: 0, width: 1, height: 1 }} />
        <span id="how" className="lAbs" style={{ left: 0, top: 2040, width: 1, height: 1 }} />
        <span id="trust" className="lAbs" style={{ left: 0, top: 2640, width: 1, height: 1 }} />

        {/* Header */}
        <Img src={logo} x={165} y={-13} w={233} h={194} reveal={false} />
        <button
          type="button"
          className="lAbs lNav"
          style={{ left: 492, top: 47 }}
          onClick={scrollTo('top')}
        >
          О нас
        </button>
        <button
          type="button"
          className="lAbs lNav"
          style={{ left: 614, top: 47 }}
          onClick={scrollTo('how')}
        >
          Как это работает?
        </button>
        <button
          type="button"
          className="lAbs lNav"
          style={{ left: 836, top: 47 }}
          onClick={scrollTo('trust')}
        >
          Забота и Доверие
        </button>
        <Btn x={1153} y={40} onClick={toChoice}>
          Подобрать уход
        </Btn>

        {/* Hero */}
        <Img src={mascot} x={881} y={104} w={575} h={575} cls="lFloat" />
        <Img src={heart} x={637} y={250} w={135} h={135} cls="lHeart" />
        <p className="lAbs reveal lHeroTitle" style={{ left: 191, top: 181, width: 510 }}>
          Косметика должна <span className="accent">служить тебе</span>,<br />а не ты — косметике
        </p>
        <p className="lAbs reveal lHeroBody" style={{ left: 191, top: 407, width: 500 }}>
          <b>Koyash</b> — твой личный эксперт по уходу за кожей. Мы подбираем средства из того, что
          уже есть на рынке, и объясняем, почему они подойдут именно тебе.
        </p>
        <Btn x={191} y={573} onClick={toChoice}>
          Подобрать уход
        </Btn>

        {/* Cloud / problem */}
        <Img src={cloudNote} x={195} y={745} w={532} h={389} />
        <Img src={problemArrow} x={712} y={735} w={230} h={230} cls="lFloat" />
        <Img src={problemNote} x={920} y={711} w={457} h={457} />
        {/* heart-lines: line-heart under the cloud (left), line-heart-2 under the parchment (right) */}
        <Img src={lineHeart} x={300} y={902} w={320} h={70} cls="lLine" reveal={false} />
        <Img src={lineHeart2} x={1018} y={860} w={280} h={64} cls="lLine" reveal={false} />
        <T x={320} y={858} w={280} cls="lNote" align="center">
          С уходом бывает непросто, солнышко
        </T>
        <T x={293} y={955} w={334} align="center">
          Среди сотен средств и советов легко запутаться и сложно понять, что действительно подходит
          твоей коже.
        </T>
        <T x={1013} y={820} w={291} cls="lNote" align="center">
          Koyash помогает выбрать уход спокойнее
        </T>
        <T x={1013} y={914} w={278} cls="lNoteScript" align="center">
          Мы учитываем особенности твоей кожи, бюджет и предпочтения, а затем подбираем уход и
          объясняем каждый выбор простыми словами.
        </T>
        <Img src={decorCream} x={1187} y={969} w={244} h={244} />

        {/* Мы подбираем уходовые средства */}
        <SmearTitle x={443} y={1275} w={724} h={118} src={analysisSmear}>
          Мы подбираем уходовые средства
        </SmearTitle>
        {/* vertical dividers (analysis-line asset) between the three columns */}
        <Img src={analysisLine} x={503} y={1401} w={104} h={412} cls="lLine" reveal={false} />
        <Img src={analysisLine} x={1019} y={1401} w={114} h={412} cls="lLine" reveal={false} />
        <Img src={aLeft} x={210} y={1466} w={279} h={222} />
        <Img src={aMid} x={660} y={1447} w={285} h={249} />
        <Img src={aRight} x={1175} y={1447} w={267} h={268} />
        <T x={198} y={1715} w={264} cls="lAnalysisCap" align="center">
          Анализируя кожу и её особенности
        </T>
        <T x={671} y={1715} w={264} cls="lAnalysisCap" align="center">
          Изучая состав средств
        </T>
        <T x={1175} y={1715} w={264} cls="lAnalysisCap" align="center">
          Объясняя каждый выбор подробно
        </T>
        {/* line assets flanking the centered button */}
        <Img src={hLineLeft} x={184} y={1879} w={439} h={70} cls="lLine" reveal={false} />
        <Img src={hLineRight} x={987} y={1865} w={422} h={84} cls="lLine" reveal={false} />
        <Btn x={668} y={1879} onClick={toChoice}>
          Подобрать уход
        </Btn>

        {/* Как работает? */}
        <SmearTitle x={235} y={2071} w={1077} h={123} flip>
          {'Как работает?\nОт нескольких ответов к понятному уходу'}
        </SmearTitle>
        <Img src={step1} x={258} y={2253} w={126} h={126} cls="lFloat" />
        <Img src={step2} x={721} y={2248} w={134} h={134} cls="lFloat" />
        <Img src={step3} x={1188} y={2242} w={148} h={148} cls="lFloat" />
        <T x={205} y={2382} w={248} cls="lCardTitleLg" align="center">
          Ты проходишь опрос
        </T>
        <T x={639} y={2384} w={304} cls="lCardTitleLg" align="center">
          Koyash отбирает средства
        </T>
        <T x={1106} y={2387} w={318} cls="lCardTitleLg" align="center">
          Ты получаешь косметичку
        </T>
        <T x={211} y={2445} w={232} align="center">
          Несколько вопросов о коже, аллергиях, бюджете и предпочтениях.
        </T>
        <T x={656} y={2445} w={288} align="center">
          Проанализируем ответы и оставим только те средства, которые тебе подходят.
        </T>
        <T x={1121} y={2445} w={289} align="center">
          Персональная подборка с объяснениями: зачем это нужно и как использовать.
        </T>

        {/* Почему Koyash можно доверять? */}
        <SmearTitle x={331} y={2674} w={943} h={119} flip>
          Почему Koyash можно доверять?
        </SmearTitle>
        <Img src={trustSun} x={161} y={2819} w={144} h={155} />
        <Img src={trustSun} x={835} y={2807} w={144} h={155} />
        <T x={305} y={2841} w={507} cls="lCardTitleLg">
          Проверенные, а не придуманные составы
        </T>
        <T x={979} y={2841} w={503} cls="lCardTitleLg">
          Осознанный подбор, а не случайность
        </T>
        <T x={305} y={2900} w={492}>
          Koyash опирается на проверенную базу косметических компонентов — состав каждого средства
          сверяется с реальными данными о веществах, а не с догадками. Если про ингредиент нет
          достоверной информации, он не пойдёт в рекомендацию.
        </T>
        <T x={979} y={2900} w={476}>
          За каждой рекомендацией стоит выверенная логика: система учитывает твой профиль кожи и
          отсеивает то, что тебе не подходит. Ты получаешь понятное объяснение к каждому средству:
          почему именно оно и в каком порядке применять.
        </T>
        <Img src={trustSun} x={153} y={3037} w={144} h={155} />
        <Img src={trustSun} x={834} y={3029} w={144} h={155} />
        <T x={305} y={3068} w={384} cls="lCardTitleLg">
          Не продаём место в подборке
        </T>
        <T x={979} y={3068} w={475} cls="lCardTitleLg">
          Не игнорируем особенности кожи
        </T>
        <T x={305} y={3120} w={475}>
          Koyash не принадлежит ни одному бренду. Средство попадает в косметичку, потому что подходит
          твоей коже, а не потому, что бренд заплатил за место.
        </T>
        <T x={978} y={3120} w={476}>
          Мы проверяем каждый состав на аллергены, и учитываем специфические состояния, которые ты
          укажешь в анкете. Твоя безопасность для нас важнее красивой рекламы.
        </T>

        {/* CTA «Войти в историю» / «Быстрый подбор» — scroll target for the
            three upper "Подобрать уход" buttons. */}
        <span id="choice" className="lAbs" style={{ left: 0, top: 3170, width: 1, height: 1 }} />
        <Img src={imagePhotoroom} x={95} y={3205} w={1480} h={366} reveal={false} />
        <T x={206} y={3335} w={495} cls="lCardTitleLg">
          Окунись в мир ухода вместе с Koyash
        </T>
        <T x={206} y={3375} w={1111}>
          Нажми сюда, если хочешь войти в историю мира уходовой косметики вместе с Koyash и уделить
          чуть больше времени, чтобы познакомиться со своей кожей поближе.
        </T>
        <Btn x={206} y={3454} onClick={story}>
          Войти в историю
        </Btn>

        {/* Быстрый подбор */}
        <T x={206} y={3598} w={280} cls="lCardTitleLg" style={{ whiteSpace: 'nowrap' }}>
          Быстрый подбор
        </T>
        <T x={206} y={3637} w={606}>
          Нажми сюда, если чувствуешь себя уверенно в мире ухода и хочешь сразу перейти к подбору
          средств.
        </T>
        <Btn x={205} y={3711} onClick={quick}>
          Подобрать уход
        </Btn>

        {/* Disclaimer */}
        <div className="lFootLine" style={{ left: 2, top: 3843, width: 1633 }} />
        <T x={44} y={3860} w={674} cls="lCardTitle" style={{ fontSize: 17 }}>
          Кoyash не делает медицинских заявлений об излечении
        </T>
        <T x={44} y={3885} w={1561} style={{ fontSize: 15 }}>
          Рекомендации носят информационный характер и не являются медицинской консультацией; перед
          применением новых средств рекомендуется патч-тест; при кожных заболеваниях — консультация
          дерматолога.
        </T>

        {/* Контакты / footer */}
        <Img src={logo} x={56} y={3926} w={193} h={160} reveal={false} />
        <Img src={endCloud} x={334} y={3918} w={492} h={187} reveal={false} />
        <div
          className="lAbs lSmearTitle reveal"
          style={{ left: 356, top: 3948, width: 448, height: 120 }}
        >
          {'Остались вопросы?\nСвяжитесь с нами'}
        </div>
        <Img src={heart} x={699} y={3980} w={58} h={58} cls="lHeart" reveal={false} />
        <T x={951} y={3924} w={220} cls="lCardTitleLg">
          Контакты:
        </T>
        <a
          className="lAbs lFooter lContact"
          href="mailto:d.minnakhmetova@innopolis.university"
          style={{ left: 939, top: 3970, display: 'flex', alignItems: 'center', gap: 18 }}
        >
          <img src={endEmail} alt="" width={51} height={52} />
          <span>d.minnakhmetova@innopolis.university</span>
        </a>
        <a
          className="lAbs lFooter lContact"
          href="https://t.me/diana_minn"
          target="_blank"
          rel="noreferrer"
          style={{ left: 940, top: 4028, display: 'flex', alignItems: 'center', gap: 18 }}
        >
          <img src={endTelegram} alt="" width={51} height={51} />
          <span>@diana_minn</span>
        </a>
        <T x={-40} y={4102} w={560} cls="lFooter" align="center" reveal={false}>
          Политика конфиденциальности
        </T>
        <T x={539} y={4102} w={560} cls="lFooter" align="center" reveal={false}>
          © 2026 Koyash. Персональный подбор косметики.
        </T>
        <T x={1113} y={4102} w={560} cls="lFooter" align="center" reveal={false}>
          Пользовательское соглашение
        </T>
      </div>
    </Stage>
  );
}

export default LandingPage;
