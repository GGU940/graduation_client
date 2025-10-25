import React, { useEffect, useState, useRef } from 'react';
import Typed from 'typed.js';

import style from '../css/InitialPage.module.css'

import { API_BASE } from '../store/ref';
import currentNameStore from '../store/currentNameStore';
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

    // const explainBoxRef = useRef(null);
    // const titleBoxRef = useRef(null);

    // 🔴 [추가] 타이핑 시퀀스를 시작하는 함수 (useEffect 밖으로 분리)
    const startTypingSequence = (index, typingData, typedInstances) => {
        if (index >= typingData.length) return;

        const { ref, strings, delay } = typingData[index];
        const nextIndex = index + 1;

        // 딜레이 후 현재 인스턴스 생성
        const currentTimeout = setTimeout(() => {
            // Ref.current가 존재하지 않으면 타이핑 중단
            if (!ref.current || !isIconHoverd) return;

            const typedInstance = new Typed(ref.current, {
                strings: strings,
                typeSpeed: 20,
                loop: false,
                showCursor: false,
                // 현재 인스턴스가 완료되면 다음 인스턴스를 시작
                onComplete: () => {
                    startTypingSequence(nextIndex, typingData, typedInstances);
                },
            });
            typedInstances.push(typedInstance);
        }, delay);

        // setTimeout ID를 반환하여 정리 함수에서 사용할 수 있도록 함
        return currentTimeout;
    };


    useEffect(() => {
        // 1. Typed 인스턴스를 배열에 저장하여 쉽게 접근
        const typedInstances = [];
        let typingTimeoutId = null;


        // 2. 타이핑할 텍스트와 해당 Ref를 배열로 정의
        const typingData = [
            { ref: typedRef1, strings: ['우리는 모든 것이 동시에 연결된, 과잉 연결의 환경 속에 살고 있습니다.'], delay: 500 },
            { ref: typedRef2, strings: ['정보와 기술은 빠르게 흘러가고, 형태를 유지하지 않으며, 끊임없이 선택과 갱신을 요구하는 시대에 놓여 있습니다.'], delay: 100 }, // 줄 바꿈 간격
            { ref: typedRef3, strings: ['기술 사회 속 현대인의 모습은, 필요에 따라 정체성을 유동적으로 조립한다는 점에서 "복합 건축물"과 닮아있습니다.'], delay: 100 },
            { ref: typedRef4, strings: ['이러한 유사성을 기반으로, 복합 시설의 구조가 갖는 불안정성에, 현대인의 불안정성을 투영하여 보고자 합니다.'], delay: 100 },
            { ref: typedRef5, strings: ['이 작업은 복합 건축물에 자신을 투영해보는 경험을 통해 주체성과 정체성을 묻습니다.'], delay: 100 },
            { ref: typedRef6, strings: ['참여를 원하면 아이콘을 눌러주세요.'], delay: 100 },
        ];


        // 4. 시퀀스 시작
        typingTimeoutId = startTypingSequence(0, typingData, typedInstances);



        // 컴포넌트가 사라지거나 isHovered가 false가 될 때 정리
        return () => {
            // 모든 Typed 인스턴스를 파괴
            typedInstances.forEach(instance => instance.destroy());

            // 실행 중인 setTimeout 정리
            if (typingTimeoutId) {
                clearTimeout(typingTimeoutId);
            }

            // 🔴 [추가] isHovered가 false가 될 때, 텍스트가 남아있지 않도록 DOM 초기화
            // (필요한 경우에만 사용. 타이핑 중단 시 바로 사라지게 함)
            if (!isIconHoverd) {
                [typedRef1, typedRef2, typedRef3, typedRef4, typedRef5, typedRef6].forEach(ref => {
                    if (ref.current) ref.current.innerHTML = '';
                });
            }
        };
    }, [isIconHoverd]);







    // ---------
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
        // window.location.href = "/areyou";


    }




    return (
        <div className={style.loginBox}>
            {/* <h1 style={{ display: "none" }}>Login</h1> */}

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
                    <button
                        type='submit'
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