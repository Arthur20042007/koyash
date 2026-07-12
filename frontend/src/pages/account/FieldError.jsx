import icError from '../../assets/account/ic-error.png';

// Inline form error shown under the fields on the auth screens (Figma error
// frames, e.g. 2787:47): a warning glyph next to the message. Centered on the
// canvas (which lines up with the centered form) and width-capped so a long
// message wraps inside the paper note instead of spilling past its edges.
export default function FieldError({ message, top }) {
  return (
    <div className="acAbs acErrRow" style={{ left: 0, top, width: 1633 }}>
      <span
        className="acErrIcon"
        style={{ backgroundImage: `url(${icError})` }}
        aria-hidden="true"
      />
      <span className="acErrText">{message}</span>
    </div>
  );
}
