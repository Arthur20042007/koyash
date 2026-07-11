import { formatPrice, stepLine, descLine, whyLine } from './careFormat';

// One product card body (image + details). The `side` slot holds the
// screen-specific controls — feedback buttons in the bag, a select button in
// the replacement screen. Shared by Care and Replace.
export default function ProductCard({ item, side, dimmed = false }) {
  const p = item.product;
  return (
    <div className={`careCard${dimmed ? ' isReplaced' : ''}`}>
      <div
        className="careImg"
        style={p.image_url ? { backgroundImage: `url(${p.image_url})` } : undefined}
      />
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
