import "../index.css";
import aroundLogo from "../images/logo_around.svg";
import iconLogo from "../images/logo_icon.svg";
import Header from "./Header/Header";
import Main from "./Main/Main";
import Footer from "./Footer/Footer";
import { api } from "../utils/Api";
import { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./Login/Login";
import Register from "./Register/Register";
import * as auth from "../utils/auth";
import InfoTooltip from "./Main/components/Popup/components/InfoTooltip/InfoTooltip";
import { getToken, removeToken, setToken } from "../utils/token";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [popup, setPopup] = useState("");
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // carrega a tela de loading da autenticação e carregamento dos dados
  const [isProcessing, setIsProcessing] = useState(false); // muda o botão de login e registro, durante o processamento do request

  const navigate = useNavigate();
  const formRef = useRef();

  // Autentica o usuário para acessar a rota protegida e carrega os dados
  async function initializeSession(jwt) {
    try {
      const [authData, userData] = await Promise.all([
        auth.getCurrentUser(jwt),
        api.getUserInfo(),
      ]);
      const { data: userAuth } = authData;
      const cards = await api.getInitialCards();

      setIsLoggedIn(true);
      setCurrentUser({ ...userData, ...userAuth });
      setCards(cards);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.log(err);
    }
  }

  useEffect(() => {
    const jwt = getToken();

    if (!jwt) {
      setIsLoading(false);
      return;
    }

    initializeSession(jwt);
  }, []);

  function handleOpenPopup(popup) {
    setPopup(popup);
  }

  function handleClosePopup() {
    setPopup("");
  }

  async function handleUpdateUser(userInfo) {
    try {
      const newUserInfo = await api.updateUserInfo(userInfo);
      setCurrentUser(newUserInfo);
      handleClosePopup();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleUpdateAvatar(newAvatarUrl) {
    try {
      const newUserInfo = await api.updateUserAvatar(newAvatarUrl);
      setCurrentUser(newUserInfo);
      handleClosePopup();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleAddPlaceSubmit(cardInfo) {
    try {
      const newCard = await api.addNewCard(cardInfo);
      setCards([newCard, ...cards]);
      handleClosePopup();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCardDelete(id) {
    try {
      await api.deleteCard(id);
      setCards((state) =>
        state.filter((currentCard) => currentCard._id !== id)
      );
      handleClosePopup();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCardLike(card) {
    try {
      const newCard = await api.editLikeStatus(card.isLiked, card._id);
      setCards((state) =>
        state.map((currentCard) =>
          currentCard._id === newCard._id ? newCard : currentCard
        )
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSignUp(data) {
    let errorMessage = "";
    try {
      setIsProcessing(true);
      await auth.register(data);
      navigate("/signin");
    } catch (error) {
      errorMessage = `Desculpe, algo deu errado! Tente novamente mais tarde.`;
      if (error.status === 400) {
        errorMessage = "O endereço de e-mail já está cadastrado.";
      }
    } finally {
      setIsProcessing(false);
      setPopup({ children: <InfoTooltip error={errorMessage} /> });
    }
  }

  async function handleSignIn(user) {
    let errorMessage = "";
    try {
      setIsProcessing(true);
      const { token } = await auth.authorize(user);
      setToken(token);
      setIsLoading(true);
      initializeSession(token);
      navigate("/");
    } catch (error) {
      errorMessage = `Desculpe, algo deu errado! Tente novamente mais tarde.`;
      if (error.status === 401) {
        errorMessage = "E-mail ou senha inválida! Verifique e tente novamente.";
        setPopup({ children: <InfoTooltip error={errorMessage} /> });
      }
    } finally {
      setIsProcessing(false);
    }
  }

  function handleSignOut() {
    removeToken();
    setIsLoggedIn(false);
    setCurrentUser("");
    setCards([]);
    navigate("/signin");
  }

  if (isLoading) {
    return (
      <div className="loading">
        <img src={iconLogo} className="loading__logo-icon" alt="" />
        <img src={aroundLogo} className="loading__logo-around" alt="" />
        <p className="loading__text">Carregando...</p>
      </div>
    );
  }

  return (
    <CurrentUserContext.Provider
      value={{
        currentUserInfo: currentUser,
        isLoggedIn,
        onUpdateUser: handleUpdateUser,
        onUpdateAvatar: handleUpdateAvatar,
        onSignOut: handleSignOut,
      }}
    >
      <div className="page">
        <Header formRef={formRef} onSignOut={handleSignOut} />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Main
                  onOpenPopup={handleOpenPopup}
                  onClosePopup={handleClosePopup}
                  popup={popup}
                  onCardLike={handleCardLike}
                  onCardDelete={handleCardDelete}
                  onAddPlaceSubmit={handleAddPlaceSubmit}
                  cards={cards}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signin"
            element={
              <ProtectedRoute anonymous>
                <Login
                  onClosePopup={handleClosePopup}
                  onSignIn={handleSignIn}
                  popup={popup}
                  formRef={formRef}
                  isProcessing={isProcessing}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <ProtectedRoute anonymous>
                <Register
                  onClosePopup={handleClosePopup}
                  onSignUp={handleSignUp}
                  popup={popup}
                  isProcessing={isProcessing}
                />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </CurrentUserContext.Provider>
  );
}
