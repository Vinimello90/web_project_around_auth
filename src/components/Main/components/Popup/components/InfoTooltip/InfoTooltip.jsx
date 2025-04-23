import successImg from "../../../../../../images/success.svg";
import errorImg from "../../../../../../images/error.svg";

export default function InfoTooltip({ error = false }) {
  return (
    <div className="info-tooltip">
      <img
        src={error ? errorImg : successImg}
        alt=""
        className="info-tooltip__image"
      />
      <h2 className="info-tooltip__message">
        {error ? error.message : "Parabéns! Agora é só fazer o login."}
      </h2>
    </div>
  );
}
