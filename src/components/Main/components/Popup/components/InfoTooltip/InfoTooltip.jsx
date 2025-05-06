import successImg from "../../../../../../images/success.svg";
import errorImg from "../../../../../../images/error.svg";

const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;

export default function InfoTooltip({ error, signIn = false, signUpSuccess }) {
  let successMessage = "";
  let errorMessage = "";

  if (signUpSuccess) {
    successMessage = "Parabéns! Agora é só fazer o login.";
  } else if (error?.status === BAD_REQUEST) {
    errorMessage = "O endereço de e-mail já está cadastrado!";
  } else if (error?.status === UNAUTHORIZED && signIn) {
    errorMessage = "E-mail ou senha inválida! Verifique e tente novamente.";
  } else if (error?.status === UNAUTHORIZED && !signIn) {
    errorMessage =
      "Sua sessão expirou! Por favor, faça login novamente para continuar.";
  } else if (error.name === "TypeError") {
    errorMessage = "Desculpe, algo deu errado! Tente novamente mais tarde.";
  }

  const imageSrc = error ? errorImg : successImg;

  return (
    <div className="info-tooltip">
      <img src={imageSrc} alt="" className="info-tooltip__image" />
      <h2 className="info-tooltip__message">
        {successMessage || errorMessage}
      </h2>
    </div>
  );
}
