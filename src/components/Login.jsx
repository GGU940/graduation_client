import React, { useState } from 'react';
import style from "../css/LoginAreU.module.css";

import { API_BASE } from '../store/ref';
import currentNameStore from '../store/currentNameStore';

const Login = () => {

    const setCurrentName = currentNameStore((state) => state.setCurrentName); // 추가
    const [name, setName] = useState("");



    const handleSubmit = async () => {
        if (!name.trim()) {
            return alert("이름을 입력하세요");
        }


        const res = await fetch(`${API_BASE}/api/confirmUserName`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });

        const data = await res.json();
        setName(data.name);
        console.log("*******", data.name);

        // setName(data.name)
        setCurrentName(data.name); // ✅ Zustand + localStorage 동시에 저장
        window.location.href = "/areyou";


    }

    return (
        <div className={style.bg}>
            <h1 style={{ display: "none" }}>Login</h1>
            <div className={style.loginCon}>
                <span>이름을 입력해주세요</span>
                <input type="text"
                    className={style.textBox}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="동명이 있을 시 번호가 붙습니다." />

                <button
                    className={name.trim() ? style.btnOn : style.btnOff}
                    onClick={handleSubmit}
                >제출</button>
            </div>

        </div>
    )
}

export default Login