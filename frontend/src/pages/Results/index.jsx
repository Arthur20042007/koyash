import { useLocation, useNavigate, Link } from 'react-router-dom';
import './Results.css';
import WideStage from './WideStage';
import logo from '../../assets/quiz/logo.png';
import sceneLoading from '../../assets/quiz/scene-loading.png';

import bagCleanser from '../../assets/results/bag-cleanser.png';
import bagToner from '../../assets/results/bag-toner.png';
import bagSerum from '../../assets/results/bag-serum.png';
import bagCream from '../../assets/results/bag-cream.png';
import bagSpf from '../../assets/results/bag-spf.png';
import bagNightCream from '../../assets/results/bag-night-cream.png';
import bagNotFound from '../../assets/results/bag-not-found.png.png';

const STEP_IMG = {
  cleanse: bagCleanser,
  tone: bagToner,
  serum: bagSerum,
  moisturize: bagCream,
  spf: bagSpf,
  mask: bagNightCream,
  exfoliant: bagSerum,
};
const bagFor = (p) => (p.image_url ? p.image_url : STEP_IMG[p.routine_step] || bagNotFound);

const fmt = (n) => Number(n).toLocaleString('ru-RU');
const category = (j) => (j.what_it_does || []).join(' + ');

// backend links come without a scheme, e.g. "goldapple.ru/19000..."
function productHref(link) {
  if (!link) return null;
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}

function NoResults({ onRetake }) {
  return (
    <div className="noResultsPage">
      <header className="nrHeader">
        <img className="nrLogo" src={logo} alt="Koyash" />
        <div className="nrBar" />
      </header>
      <img className="nrScene" src={sceneLoading} alt="" aria-hidden="true" />
      <div className="nrContent">
        <span className="nrNote">Я всё проверила, солнышко. Но точного совпадения пока не нашлось.</span>
        <h1 className="nrTitle">Ничего идеального не нашлось ♡</h1>
        <p className="nrText">
          По твоим ответам среди уходовой косметики не нашлось средств, которые
          подошли бы без компромиссов. Можно немного смягчить фильтры и попробовать снова.
        </p>
        <div className="nrActions">
          <button className="rBtnPrimary" type="button" onClick={onRetake}>Пройти заново</button>
          <Link to="/" className="rBtnGhost">Выйти</Link>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product: p, justification: j }) {
  const href = productHref(p.link);
  return (
    <a
      className="rCard"
      href={href || undefined}
      target={href ? '_blank' : undefined}
      rel={href ? 'noopener noreferrer' : undefined}
    >
      <div className="rCardImg"><img src={bagFor(p)} alt="" /></div>
      <div className="rCardBody">
        <p className="rCardRole">{j.role}</p>
        <h3 className="rCardName">{p.name}</h3>
        <p className="rCardBrand">{p.brand}</p>
        <p className="rCardCategory">{category(j)}</p>
        {j.key_actives && j.key_actives.length > 0 && (
          <div className="rCardChips">
            {j.key_actives.map((a) => <span key={a} className="rChip">{a}</span>)}
          </div>
        )}
        {j.summary_ru && <p className="rCardWhy">{j.summary_ru}</p>}
        <div className="rCardFooter">
          <span className="rCardPrice">{fmt(p.price_rub)} ₽</span>
          <span className="rCardFreq">{p.frequency}</span>
          {href && <span className="rCardLink">Перейти в магазин →</span>}
        </div>
      </div>
    </a>
  );
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { results, error } = location.state || {};
  const handleRetake = () => navigate('/quiz');

  if (error || !results || results.noResults || !results.bag || results.bag.length === 0) {
    return <NoResults onRetake={handleRetake} />;
  }

  const { bag, meta } = results;

  return (
    <WideStage>
      <div className="rPage">
        <img className="rLogo" src={logo} alt="Koyash" />
        <div className="rTrack" />

        <span className="rNote">Солнце кладёт перед тобой аккуратный листок с подборкой.</span>
        <p className="rNarrative">
          — Вот, солнышко. Это твоя косметичка. Я подобрала каждое средство под
          тебя — и сейчас объясню почему.
        </p>
        <h1 className="rTitle">Вот твоя косметичка<span className="heart">♡</span></h1>

        <div className="rList">
          {bag.map((item) => (
            <ProductCard key={item.product.id} {...item} />
          ))}
        </div>

        <div className="rTotal">Сумма: <span className="sum">{fmt(meta.total_price_rub)} ₽</span></div>
        <p className="rTotalNote">стоимость полного набора ухода на 2–3 месяца</p>
        {meta.note && <p className="rMetaNote">{meta.note}</p>}

        <div className="rActions">
          <button className="rBtnPrimary" type="button" onClick={handleRetake}>Пройти заново</button>
          <Link to="/" className="rBtnGhost">На главную</Link>
        </div>
      </div>
    </WideStage>
  );
}
