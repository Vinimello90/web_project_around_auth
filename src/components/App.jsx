import "../index.css";
import Header from "./Header/Header";
import Main from "./Main/Main";
import Footer from "./Footer/Footer";
import { api } from "../utils/Api";
import { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./Login/Login";
import Register from "./Register/Register";
import * as auth from "../utils/auth";
import InfoTooltip from "./Main/components/Popup/components/InfoTooltip/InfoTooltip";
import { setToken } from "../utils/token";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [popup, setPopup] = useState("");
  const [cards, setCards] = useState([]);
  const formRef = useRef();

  useEffect(() => {
    (async () => {
      try {
        const userInfo = await api.getUserInfo();
        setCurrentUser(userInfo);
        const initialCards = await api.getInitialCards();
        setCards(initialCards);
      } catch (error) {
        console.error(error);
      }
    })();
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
    try {
      const userData = await auth.register(data);
      setPopup({ children: <InfoTooltip /> });
    } catch (error) {
      let errorMessage = `Desculpe, algo deu errado! Tente novamente mais tarde.`;
      if (error.status === 400) {
        errorMessage = "O endereço de e-mail já está cadastrado.";
      }
      setPopup({ children: <InfoTooltip error={{ message: errorMessage }} /> });
    }
  }

  async function handleSignIn(user) {
    try {
      const { token } = await auth.authorize(user);
      setToken(token);
      setIsLoggedIn(true);
    } catch (error) {
      let errorMessage = `Desculpe, algo deu errado! Tente novamente mais tarde.`;
      if (error.status === 401) {
        errorMessage = "E-mail ou senha inválida! Verifique e tente novamente.";
      }
      setPopup({ children: <InfoTooltip error={{ message: errorMessage }} /> });
    }
  }

  function handleSignOut() {
    setIsLoggedIn(false);
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
