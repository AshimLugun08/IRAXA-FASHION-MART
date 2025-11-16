import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  const token = params.get("token");
  const id = params.get("id");
  const email = params.get("email");
  const name = params.get("name");
  const role = params.get("role");

  if (!token) return;

  localStorage.setItem("token", token);

  localStorage.setItem("user", JSON.stringify({
    id,
    email,
    name,
    role
  }));

  navigate("/", { replace: true });
}, []);


  return <div style={{ padding: 40, fontSize: 20 }}>Logging you in...</div>;
}
