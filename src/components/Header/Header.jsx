import aroundLogo from "../../images/logo_around.svg";
import AuthButton from "./components/AuthButton/AuthButton";

export default function Header({ formRef }) {
  return (
    <header className="header">
      <img src={aroundLogo} alt="logotipo EUA Afora" className="header__logo" />
      <AuthButton formRef={formRef} />
    </header>
  );
}
