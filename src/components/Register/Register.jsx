import { Link } from "react-router";

export default function Register() {
  return (
    <main className="main">
      <section className="register">
        <h1 className="register__title">Inscreva-se</h1>
        <form action="get" className="register__form">
          <fieldset className="register__fieldset">
            <label className="register__form-field">
              <input
                type="email"
                name="email"
                id="email"
                className="input input_auth"
                placeholder="E-mail"
                required
              />
            </label>
            <label className="register__form-field">
              <input
                type="password"
                name="password"
                id="password"
                className="input input_auth"
                placeholder="Senha"
                required
              />
            </label>
            <button type="submit" className="button button_auth">
              Inscrever-se
            </button>
          </fieldset>
        </form>
        <p className="register__signin-text">
          Já é um membro?
          <Link to="/signin" className="register__signin-link">
            Faça o login aqui!
          </Link>
        </p>
      </section>
    </main>
  );
}
