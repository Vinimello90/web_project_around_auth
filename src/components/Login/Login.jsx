import { Link } from "react-router";

export default function Login() {
  return (
    <main className="main">
      <section className="login">
        <h1 className="login__title">Entrar</h1>
        <form action="get" className="login__form">
          <fieldset className="login__fieldset">
            <label className="login__form-field">
              <input
                type="email"
                name="email"
                id="email"
                className="input input_auth"
                placeholder="E-mail"
                required
              />
            </label>
            <label className="login__form-field">
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
              Entrar
            </button>
          </fieldset>
        </form>
        <p className="login__signup-text">
          Ainda não é membro?
          <Link to="/signup" className="login__signup-link">
            Inscreva-se aqui!
          </Link>
        </p>
      </section>
    </main>
  );
}
