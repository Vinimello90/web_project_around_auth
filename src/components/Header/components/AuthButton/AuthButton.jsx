import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { CurrentUserContext } from "../../../../contexts/CurrentUserContext";

export default function AuthButton({ formRef }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, onSignOut, currentUserInfo } =
    useContext(CurrentUserContext);

  function handleSignOutClick() {
    onSignOut();
  }

  function handleFormFocusClick() {
    formRef.current.requestSubmit();
  }

  if (isLoggedIn) {
    return (
      <div className="header__user">
        <p className="header__e-mail">{currentUserInfo.email}</p>
        <button
          onClick={handleSignOutClick}
          type="button"
          className="button button_auth"
        >
          Sair
        </button>
      </div>
    );
  }

  return (
    <>
      {location.pathname === "/signin" ? (
        <button onClick={handleFormFocusClick} className="button button_auth">
          Entrar
        </button>
      ) : (
        <button
          onClick={() => navigate("/signin")}
          className="button button_auth"
        >
          Faça o Login
        </button>
      )}
    </>
  );
}
