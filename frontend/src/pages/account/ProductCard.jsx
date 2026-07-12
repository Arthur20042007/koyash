import { formatPrice, stepLine, descLine, whyLine } from './careFormat';
import bagCleanser from '../../assets/results/bag-cleanser.png';
import bagToner from '../../assets/results/bag-toner.png';
import bagSerum from '../../assets/results/bag-serum.png';
import bagCream from '../../assets/results/bag-cream.png';
import bagSpf from '../../assets/results/bag-spf.png';
import bagNightCream from '../../assets/results/bag-night-cream.png';
import bagNotFound from '../../assets/results/bag-not-found.png.png';

// Product jar by routine step — mirrors the results screen so the saved bag
// shows the same illustrations. A product's own image_url wins when present.
const STEP_IMG = {
  cleanse: bagCleanser,
  tone: bagToner,
  serum: bagSerum,
  moisturize: bagCream,
  spf: bagSpf,
  mask: bagNightCream,
  exfoliant: bagSerum,
};
const bagFor = (p) => p.image_url || STEP_IMG[p.routine_step] || bagNotFound;

// One product card body (image + details). The `side` slot holds the
// screen-specific controls — feedback buttons in the bag, a select button in
// the replacement screen. Shared by Care and Replace.
export default function ProductCard({ item, side, dimmed = false }) {
  const p = item.product;
  return (
    <div className={`careCard${dimmed ? ' isReplaced' : ''}`}>
      <div className="careImg" style={{ backgroundImage: `url(${bagFor(p)})` }} />
      <div className="careBody">
        <p className="careStep">{stepLine(item)}</p>
        <p className="careName">{p.name}</p>
        <p className="careBrand">{p.brand}</p>
        {descLine(item) && <p className="careDesc">{descLine(item)}</p>}
        {whyLine(item) && <p className="careWhy">{whyLine(item)}</p>}
        <p className="carePrice">{formatPrice(p.price_rub)}</p>
        {p.link && (
          <a className="careShop" href={p.link} target="_blank" rel="noreferrer">
            Перейти в магазин →
          </a>
        )}
      </div>
      {side && <div className="careSide">{side}</div>}
    </div>
  );
}
