import { useEffect, useState } from "react";
import style from "../css/TotalPage.module.css";

import CollageCard from "../components/CollageCard";
const API_BASE = process.env.REACT_APP_API_BASE;



const TotalPage = () => {

    const [collages, setCollages] = useState([]);


    useEffect(() => {
        const fetchCutouts = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/allCutouts`);
                // const data = await res.text();
                const data = await res.json();
                setCollages(data);
                console.log(data);
            } catch (err) {
                console.error("❌ cutouts 불러오기 실패:client", err);
            }
        };
        fetchCutouts();
    }, []);


    return (
        <div className={style.con}>
            <h1 style={{ display: "none" }}>TotalPage</h1>
            <ul>
                {collages.map((item, idx) => (
                    <CollageCard key={idx} collage={item} />
                ))}
            </ul>

        </div>
    )
}

export default TotalPage