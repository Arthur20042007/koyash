import './QuizScreen1.css';
import Stage from './Stage';
import logo from '../../assets/quiz/logo.png';
import sceneOpening from '../../assets/quiz/scene-opening.png';
import decorLeaf from '../../assets/quiz/decor-leaf.png';
import heart from '../../assets/quiz/heart.png';

const title = `Ты заходишь в уютный дом.\nПахнет травяным чаем. В окно\nмягко заглядывает солнце.`;

const text = `— Заходи, солнышко. Садись поудобнее, чай уже тёплый.\n\nЯ давно наблюдаю, как кожа реагирует на уход, погоду,\nстресс и новые средства. И знаешь, что я заметила?\nЧасто люди тратят деньги не на плохую косметику, а\nпросто не на свою.\nНе потому что делают что-то неправильно. Просто коже\nнужно немного внимания — и понятный подбор.\nДавай посмотрим, что подойдёт именно тебе. Несколько\nвопросов — и готово.`;

export default function QuizScreen1({ onNext, onBack }) {
  return (
    <Stage>
      <div className="introRoot">
        <img className="iLogo" src={logo} alt="Koyash" />
        <div className="iTrack" />

        <img className="iScene" src={sceneOpening} alt="" aria-hidden="true" />
        <img className="iLeaf" src={decorLeaf} alt="" aria-hidden="true" />

        <h1 className="iTitle">{title}</h1>
        <img className="iHeart" src={heart} alt="" aria-hidden="true" />
        <p className="iBody">{text}</p>

        <button className="iBtn iBtnBack" type="button" onClick={onBack}>Назад</button>
        <button className="iBtn iBtnNext" type="button" onClick={onNext}>Присесть за стол →</button>
      </div>
    </Stage>
  );
}
