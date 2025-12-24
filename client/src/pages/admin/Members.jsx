import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Members() {
  const center = JSON.parse(localStorage.getItem("center"));
  const [members, setMembers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/members/${center.id}`)
      .then(res => setMembers(res.data));
  }, []);

  return members.map(m => (
    <button key={m.id} onClick={() => {
      localStorage.setItem("member", JSON.stringify(m));
      navigate("/loan-application");
    }}>
      {m.name}
    </button>
  ));
}
