import React, { useEffect, useState, useRef } from 'react';
import currentNameStore from '../store/currentNameStore';
import Typed from 'typed.js';
import style from '../css/InitialPage.module.css'

import { API_BASE } from '../store/ref';
// import { div } from 'framer-motion/client';

const Login = ({
    isIconActive,
    isIconHoverd
}) => {
    const typedRef1 = useRef(null);
    const typedRef2 = useRef(null);
    const typedRef3 = useRef(null);
    const typedRef4 = useRef(null);
    const typedRef5 = useRef(null);
    const typedRef6 = useRef(null);

    // 🔴 [수정 1] 모든 setTimeout ID를 추적하기 위한 ref
    const typingTimeoutIds = useRef([]);


    useEffect(() => {
        // 1. Typed 인스턴스를 배열에 저장
        const typedInstances = [];

        // 🔴 [수정 2] 모든 ref를 배열로 묶어 cleanup 시 쉽게 접근
        const allTypedRefs = [typedRef1, typedRef2, typedRef3, typedRef4, typedRef5, typedRef6];

        // 2. 타이핑할 텍스트와 해당 Ref를 배열로 정의
        const typingData = [
            { ref: typedRef1, strings: ['우리는 모든 것이 동시에 연결된, 과잉 연결의 환경 속에 살고 있습니다.'], delay: 500 },
            { ref: typedRef2, strings: ['정보와 기술은 빠르게 흘러가고, 형태를 유지하지 않으며, 끊임없이 선택과 갱신을 요구하는 시대에 놓여 있습니다.'], delay: 100 },
            { ref: typedRef3, strings: ['기술 사회 속 현대인의 모습은, 필요에 따라 정체성을 유동적으로 조립한다는 점에서 "복합 건축물"과 닮아있습니다.'], delay: 100 },
            { ref: typedRef4, strings: ['이러한 유사성을 기반으로, 복합 시설의 구조가 갖는 불안정성에, 현대인의 불안정성을 투영하여 보고자 합니다.'], delay: 100 },
            { ref: typedRef5, strings: ['이 작업은 복합 건축물에 자신을 투영해보는 경험을 통해 주체성과 정체성을 묻습니다.'], delay: 100 },
            { ref: typedRef6, strings: ['참여를 원하면 아이콘을 눌러주세요.'], delay: 100 },
        ];

        // 🔴 [수정 3] 타이핑 시퀀스 함수를 useEffect 내부로 이동
        // (stale closure 문제를 해결하고, timeout ID를 정확히 관리하기 위함)
        const startTypingSequence = (index) => {
            if (index >= typingData.length) return;

            const { ref, strings, delay } = typingData[index];
            const nextIndex = index + 1;

            const currentTimeout = setTimeout(() => {
                // 이 콜백이 실행될 때 ref.current가 없으면(cleanup이 실행된 경우) 중단
                if (!ref.current) return;

                const typedInstance = new Typed(ref.current, {
                    strings: strings,
                    typeSpeed: 20,
                    loop: false,
                    showCursor: false,
                    onComplete: () => {
                        startTypingSequence(nextIndex); // 다음 시퀀스 재귀 호출
                    },
                });
                typedInstances.push(typedInstance);
            }, delay);

            // 🔴 [수정 4] 생성된 모든 timeout ID를 ref 배열에 추가
            typingTimeoutIds.current.push(currentTimeout);
        };


        // 🔴 [수정 5] isIconHoverd가 true일 때만 타이핑 시퀀스 시작
        if (isIconHoverd) {
            startTypingSequence(0);
        }

        // 컴포넌트가 사라지거나 isHovered가 false가 될 때 (의존성이 변할 때)
        return () => {
            // 1. 모든 Typed 인스턴스를 파괴
            typedInstances.forEach(instance => instance.destroy());

            // 2. 🔴 [수정 6] 예약된 '모든' setTimeout을 취소
            typingTimeoutIds.current.forEach(id => clearTimeout(id));
            typingTimeoutIds.current = []; // ID 배열 초기화

            // 3. 🔴 [수정 7] 텍스트가 남아있지 않도록 DOM 초기화
            // (조건문 제거 -> cleanup 시 항상 실행되도록)
            allTypedRefs.forEach(ref => {
                if (ref.current) ref.current.innerHTML = '';
            });
        };
    }, [isIconHoverd]); // isIconHoverd가 변경될 때마다 이 effect를 재실행 (및 정리)







    // --------- (이하 동일)
    const setCurrentName = currentNameStore((state) => state.setCurrentName);
    const [name, setName] = useState("");



    const handleSubmit = async (e) => {
        e.preventDefault();

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

        setCurrentName(data.name);
        // window.location.href = "/areyou";
    }

    return (
        <div className={style.loginBox}>
            <div className={`${style.titleBox} ${isIconHoverd && !isIconActive ? style.iconHoverd : ''}`}>
                <span> 1/∞  </span>
                {!isIconActive ? (
                    <span className={style.userNameSpace}>  Instance01  </span>
                ) : (<form onSubmit={handleSubmit}>
                    <input type="text"
                        className={style.renameInput}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Instance01" />

                    <button type='submit'
                        style={{ display: 'none' }}
                    ></button>
                </form>)}
                <span>  2025</span>
            </div>

            {!isIconActive ? (
                <div className={`${style.explainBox} ${isIconHoverd && !isIconActive ? style.iconHoverd : ''}`}>
                    <span ref={typedRef1}></span>
                    <span ref={typedRef2}></span><br />
                    <span ref={typedRef3}></span>
                    <span ref={typedRef4}></span>
                    <span ref={typedRef5}></span><br />
                    <span ref={typedRef6}></span>
                </div>
            ) : (
                <div style={{ color: 'red' }}>
                    isIconActive
                </div>
            )
            }
        </div >
    )
}

export default Login