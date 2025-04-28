import aroundLogo from "../images/logo_around.svg";
import iconLogo from "../images/logo_icon.svg";
import Header from "./Header/Header";
import * as auth from "../utils/auth";
import ProtectedRoute from "./ProtectedRoute";
import Main from "./Main/Main";
import Login from "./Login/Login";
import Register from "./Register/Register";
import Footer from "./Footer/Footer";
import { api } from "../utils/Api";
import { useState, useEffect, useRef } from "react";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import { Routes, Route, Navigate, useNavigate } from "react-router";
import InfoTooltip from "./Main/components/Popup/components/InfoTooltip/InfoTooltip";
import { getToken, removeToken, setToken } from "../utils/token";
import CheckBrowserVersion from "./CheckBrowserVersion/CheckBrowserVersion";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [popup, setPopup] = useState("");
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // carrega a tela de loading da autenticação e carregamento dos dados
  const [isProcessing, setIsProcessing] = useState(false); // muda o botão de login e registro, durante o processamento do request

  const navigate = useNavigate();
  const formRef = useRef();

  // Verifica o token do usuário atual
  async function userAuth(jwt) {
    return await auth.getCurrentUser(jwt);
  }

  async function userAuthBFCacheHandler() {
    try {
      const jwt = getToken();
      if (jwt) {
        await userAuth(jwt);
      } else {
        throw new Error("token não encontrado");
      }
    } catch {
      handleSignOut();
    } finally {
      setIsLoading(false);
    }
  }

  // Autentica o usuário para acessar a rota protegida e carrega os dados
  async function initializeSession(jwt) {
    try {
      const authData = await userAuth(jwt);
      const userData = await api.getUserInfo();
      const cards = await api.getInitialCards();
      const { data: currentUser } = authData;
      setIsLoggedIn(true);
      setCurrentUser({ ...userData, ...currentUser });
      setCards(cards);
    } catch (error) {
      const errorPopup = { children: <InfoTooltip error={error} /> };
      setPopup(errorPopup); // monta a popup para exibir o erro
      removeToken();
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) {
        setIsLoading(true);
        userAuthBFCacheHandler();
      }
    });
    const jwt = getToken();
    const browserWarning = CheckBrowserVersion(); // verifica a versão do navegador e retorna um componente caso verdadeiro
    if (jwt) {
      initializeSession(jwt);
    } else {
      setIsLoading(false);
    }
    setPopup(browserWarning);
  }, []);

  function handleOpenPopup(popup) {
    setPopup(popup);
  }
  function handleClosePopup() {
    setPopup("");
  }

  //envia os dados para requistar atualização dos dados do usuário atual
  async function handleUpdateUser(userInfo) {
    try {
      const newUserInfo = await api.updateUserInfo(userInfo);
      setCurrentUser((prevState) => ({
        ...prevState,
        name: newUserInfo.name,
        about: newUserInfo.about,
      }));
      handleClosePopup();
    } catch (error) {
      console.error(error);
    }
  }

  // envia os dados e requisita a atualização do avatar do usuário atual
  async function handleUpdateAvatar(newAvatarUrl) {
    try {
      const newUserInfo = await api.updateUserAvatar(newAvatarUrl);
      setCurrentUser((prevState) => ({
        ...prevState,
        avatar: newUserInfo.avatar,
      }));
      handleClosePopup();
    } catch (error) {
      console.error(error);
    }
  }

  // envia os dados do card para requisita a adição novo card
  async function handleAddPlaceSubmit(cardInfo) {
    try {
      const newCard = await api.addNewCard(cardInfo);
      setCards([newCard, ...cards]);
      handleClosePopup();
    } catch (error) {
      console.error(error);
    }
  }
  // Requisita a remoção do card do id selecionado
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

  // Requisita o like do id do card selecionado
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

  // Envia os dados do registro
  async function handleSignUp(data) {
    try {
      const successPopup = {
        children: <InfoTooltip signUpSuccess />,
        type: "signUp",
      };
      setIsProcessing(true);
      await auth.register(data);
      setPopup(successPopup);
      setTimeout(() => {
        setPopup("");
        navigate("/signin", { replace: true });
      }, 1500);
    } catch (error) {
      const errorPopup = { children: <InfoTooltip error={error} /> };
      setPopup(errorPopup);
    } finally {
      setIsProcessing(false);
    }
  }

  // Envia os dados de login para requisitar a autorização
  async function handleSignIn(user) {
    try {
      setIsProcessing(true);
      const { token } = await auth.authorize(user);
      setToken(token);
      setIsLoading(true);
      initializeSession(token);
      navigate("/", { replace: true });
    } catch (error) {
      const errorPopup = { children: <InfoTooltip error={error} signIn /> };
      setPopup(errorPopup);
    } finally {
      setIsProcessing(false);
    }
  }

  // Inicia o logout removendo o token e limpando os estados
  function handleSignOut() {
    removeToken();
    setIsLoggedIn(false);
    setCurrentUser("");
    setCards([]);
    navigate("/signin", { replace: true });
  }

  // Tela de loading enquanto é feita autorização
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
        <Header formRef={formRef} />
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
