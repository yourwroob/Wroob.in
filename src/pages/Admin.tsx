// Legacy admin page - redirects to new admin dashboard
import { Navigate } from "react-router-dom";

const Admin = () => {
  return <Navigate to="/admin" replace />;
};

export default Admin;