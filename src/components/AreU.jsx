import React, { useEffect, useState } from 'react';
import classNames from 'classnames';

import style from "../css/LoginAreU.module.css";
import currentNameStore from '../store/currentNameStore';


const AreU = () => {

    const currentName = currentNameStore((state) => state.currentName);

    // 상태 관리
    const [loading, setLoading] = useState(false);      // 로딩 애니메이션 여부
    const [checked, setChecked] = useState(false);      // 체크박스 체크 여부
    const [authMessage, setAuthMessage] = useState(false); // "추가 인증 필요" 메시지 표시 여부

    // 체크박스 클릭 시 실행되는 함수
    const handleCheck = () => {
        if (!checked) {           // 이미 체크되어 있으면 재실행 방지
            setChecked(true);     // 체크 상태 true

            setTimeout(() => {
                setLoading(true);     // 로딩 애니메이션 시작

            }, 2000)


            // 1초 후 로딩 멈추고 인증 메시지 표시
            setTimeout(() => {
                setAuthMessage(true);  // "추가 인증 필요" 메시지 ON
                setLoading(false);     // 로딩 OFF
            }, 3000); // 1초 뒤 실행

            // 2.5초 후 페이지 이동
            setTimeout(() => {
                window.location.href = "/play";
            }, 6000); // 총 2.5초 뒤 페이지 전환
        }
    };


    return (
        <div className={style.bg}>
            <h1 style={{ display: "none" }}>AreU</h1>

            <div className={style.areyouCon}>
                <p>
                    {currentName}님, 환영합니다.
                    인증을 완료해주세요
                </p>

                <div className={classNames(style.checkContainer, {
                    [style.active]: checked,

                })}>
                    <input className={style.checkBox}
                        type="checkbox"
                        id="notRobot"
                        onChange={handleCheck}   // 클릭 시 handleCheck 실행
                        checked={checked}        // 상태 바인딩
                    />
                    <span>나는 사람입니다</span>
                </div>

                {/* 로딩 애니메이션 */}
                {loading && <div className={style.msg}>로딩 중...</div>}

                {/* 인증 메시지 */}
                {authMessage && <div className={style.msg}>추가 인증이 필요합니다...</div>}
            </div>

        </div >
    )
}

export default AreU