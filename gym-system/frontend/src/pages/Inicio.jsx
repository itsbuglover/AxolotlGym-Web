
import { useNavigate } from "react-router-dom";
import AxolotlPromoCarousel from "../components/AxolotlPromoCarousel.jsx";

export default function Inicio() {
  const navigate = useNavigate();

  return (
    <AxolotlPromoCarousel
      onLoginClick={() => navigate("/login")}
    />
  );
}
