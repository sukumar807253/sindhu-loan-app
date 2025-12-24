import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Centers() {
  const [centers, setCenters] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/centers")
      .then(res => setCenters(res.data));
  }, []);

  return centers.map(c => (
    <button key={c.id} onClick={() => {
      localStorage.setItem("center", JSON.stringify(c));
      navigate("/members");
    }}>
      {c.name}
    </button>
  ));
}
