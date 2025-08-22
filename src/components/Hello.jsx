import React, { useEffect, useRef } from 'react'
import style from '../css/InitialPage.module.css'
import Typed from 'typed.js';


const Hello = () => {

    const typedRef1 = useRef(null);
    const typedRef2 = useRef(null);


    useEffect(() => {
        // 첫 번째 줄에 대한 인스턴스
        const typed1 = new Typed(typedRef1.current, {
            strings: ['안녕하세요'],
            typeSpeed: 4,
            loop: false,
            showCursor: false, // 커서는 하나만 보이도록 조절 가능
        });

        // 두 번째 줄에 대한 인스턴스
        const typed2 = new Typed(typedRef2.current, {
            strings: ['Hello'],
            typeSpeed: 4,
            loop: false,
        });

        // 컴포넌트가 사라질 때 두 인스턴스 모두 정리
        return () => {
            typed1.destroy();
            typed2.destroy();
        };
    }, []);

    return (
        <div className={style.HelloCompo}>
            <span
                className={style.contentText}
                ref={typedRef1}>
                {/* 안녕하세요 */}
            </span>
            <span
                className={style.contentText}
                ref={typedRef2}>
                {/* 안녕하세요 */}
            </span>


        </div>
    )
}

export default Hello