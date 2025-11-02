import React, { useEffect, useState, useRef } from 'react';
// import Typed from 'typed.js';
import style from '../css/InitialPage.module.css'

import { API_BASE } from '../store/ref';
import { useTypingSequence } from '../utils/useTypingSequene';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
// import { span } from 'framer-motion/client';
// import { div } from 'framer-motion/client';

const Login = ({
    isIconActive,
    isIconHoverd,
    isLogin,
    setIsLogin
}) => {

    const typedRef1 = useRef(null);
    const typedRef2 = useRef(null);
    const typedRef3 = useRef(null);
    const typedRef4 = useRef(null);
    const typedRef5 = useRef(null);
    const typedRef6 = useRef(null);

    const typedRef11 = useRef(null);
    const typedRef12 = useRef(null);


    // ✅ CSSTransition을 위한 ref 2개 생성
    const nodeRef1 = useRef(null);
    const nodeRef2 = useRef(null);
    const startTyping = useTypingSequence();


    useEffect(() => {
        const allTypedRefs = [typedRef1, typedRef2, typedRef3, typedRef4, typedRef5, typedRef6];
        // 타이핑할 텍스트와 해당 Ref를 배열로 정의
        const typingData = [
            { ref: typedRef1, strings: ['우리는 모든 것이 동시에 연결된, 과잉 연결의 환경 속에 살고 있습니다.'], delay: 500 },
            { ref: typedRef2, strings: ['정보와 기술은 빠르게 흘러가고, 형태를 유지하지 않으며, 끊임없이 선택과 갱신을 요구하는 시대에 놓여 있습니다.'], delay: 100 },
            { ref: typedRef3, strings: ['기술 사회 속 현대인의 모습은, 필요에 따라 정체성을 유동적으로 조립한다는 점에서 "복합 건축물"과 닮아있습니다.'], delay: 100 },
            { ref: typedRef4, strings: ['이러한 유사성을 기반으로, 복합 시설의 구조가 갖는 불안정성에, 현대인의 불안정성을 투영하여 보고자 합니다.'], delay: 100 },
            { ref: typedRef5, strings: ['이 작업은 복합 건축물에 자신을 투영해보는 경험을 통해 주체성과 정체성을 묻습니다.'], delay: 100 },
            { ref: typedRef6, strings: ['참여를 원하면 아이콘을 눌러주세요.'], delay: 100 },
        ];


        let cleanupFunction = () => { }; // 타이머와 인스턴스를 정리할 함수 cleanup함수를 반환받아 저장할 것.
        if (isIconHoverd && !isIconActive) {
            // startTyping 함수를 호출하고, 반환되는 cleanup 함수를 저장합니다.
            cleanupFunction = startTyping(typingData)
        } else {
            // isIconHoverd가 false가 될 때, 이전에 타이핑된 텍스트 잔상을 바로 지워줍니다
            allTypedRefs.forEach(ref => {
                if (ref.current) { ref.current.innerHTML = ''; }
                // 💡 cleanupFunction이 실행되지 않았어도, 다음 렌더링 시 이전 cleanup이 실행되어 정리됨.
            })
        }
        return cleanupFunction;
    }, [isIconHoverd, isIconActive]); // isIconHoverd가 변경될 때마다 이 effect를 재실행 (및 정리)




    useEffect(() => {
        const allTypedRefs = [typedRef11, typedRef12];
        // 타이핑할 텍스트와 해당 Ref를 배열로 정의
        const typingData = [
            { ref: typedRef11, strings: ['이름을 입력하세요.'], delay: 1500 },
            { ref: typedRef12, strings: ['동명인 존재 시 번호가 붙습니다..'], delay: 100 },
        ];


        let cleanupFunction = () => { }; // 타이머와 인스턴스를 정리할 함수 cleanup함수를 반환받아 저장할 것.
        if (isIconActive) {
            // startTyping 함수를 호출하고, 반환되는 cleanup 함수를 저장합니다.
            cleanupFunction = startTyping(typingData);
        } else {
            // isIconHoverd가 false가 될 때, 이전에 타이핑된 텍스트 잔상을 바로 지워줍니다
            allTypedRefs.forEach(ref => {
                if (ref.current) { ref.current.innerHTML = ''; }
                // 💡 cleanupFunction이 실행되지 않았어도, 다음 렌더링 시 이전 cleanup이 실행되어 정리됨.
            })
        }
        return cleanupFunction;
    }, [isIconActive]); // isIconHoverd가 변경될 때마다 이 effect를 재실행 (및 정리)




    // --------- (이하 동일)
    const [name, setName] = useState(""); //유저 이름 저장

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
        console.log("******* server 이름 확인 정상작동", data.name);
        setIsLogin(data.name);
    }

    useEffect(() => {
        console.log("isLogin이 변경되었당", isLogin)
    }, [isLogin])

    return (<>
        <div className={style.loginBox}>
            <div className={`${style.titleBox} ${isIconHoverd && !isIconActive ? style.iconHoverd : ''}`}>
                <span> 1/∞  </span>

                {!isLogin ? (
                    !isIconActive ? (
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
                    </form>)
                ) : (
                    <span>{isLogin}</span>
                )}

                <span>  2025</span>
            </div>
        </div >



        <TransitionGroup component={null}>

            {!isIconActive ? (isIconHoverd ? (
                <CSSTransition
                    key="step1-statement"
                    timeout={300}
                    classNames={{ // ✅ 여기도 동일하게
                        enter: style.slideEnter,
                        enterActive: style.slideEnterActive,
                        enterDone: style.slideEnterDone,
                        exit: style.slideExit,
                        exitActive: style.slideExitActive,
                        exitDone: style.slideExitDone,
                    }}
                    nodeRef={nodeRef1}>
                    <div className={style.slideBox} ref={nodeRef1}>
                        <span className={style.explainTyped} ref={typedRef1}></span>
                        <span className={style.explainTyped} ref={typedRef2}></span><br />
                        <span className={style.explainTyped} ref={typedRef3}></span>
                        <span className={style.explainTyped} ref={typedRef4}></span>
                        <span className={style.explainTyped} ref={typedRef5}></span><br />
                        <span className={style.explainTyped} ref={typedRef6}></span>
                    </div>
                </CSSTransition>
            ) : null
            ) : (isLogin ? null : (
                <CSSTransition
                    key="step2-rename"
                    timeout={300}
                    classNames={{ // ✅ 여기도 동일하게
                        enter: style.slideEnter,
                        enterActive: style.slideEnterActive,
                        enterDone: style.slideEnterDone,
                        exit: style.slideExit,
                        exitActive: style.slideExitActive,
                        exitDone: style.slideExitDone,
                    }}
                    nodeRef={nodeRef2}>

                    <div className={style.slideBox} ref={nodeRef2}>
                        <span className={style.explainTyped} ref={typedRef11}> </span> <br />
                        <span className={style.explainTyped} ref={typedRef12}></span>
                    </div>
                </CSSTransition>
            ))}


        </TransitionGroup >


    </>
    )
}

export default Login