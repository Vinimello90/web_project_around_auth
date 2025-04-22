import { Navigate } from "react-router";

export default function ProtectedRoute({
  children,
  isLoggedIn,
  anonymous = false,
}) {
  if (!isLoggedIn && !anonymous) {
    return <Navigate to="/signin" />;
  }

  if (isLoggedIn && anonymous) {
    return <Navigate to="/" />;
  }

  return children;
}
