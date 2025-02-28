import { Navigate, Outlet } from "react-router-dom";

const ProtectedAuthRoute = () => {
    const isAuthenticated = !!localStorage.getItem("authToken"); // 로그인 여부 확인
    return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedAuthRoute;
