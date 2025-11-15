import React, { useEffect, useState, useRef } from 'react'
import style from "../css/Loading.module.css"
import { useTypingSequence } from '../utils/useTypingSequene';
import SVGicon from './SVGicon';

const Loading = ({
    errorText = '',
    loadingText = 'Loading...',
    nextStep = '',
    setModelStop,
    setGoNext }
) => {
    const [loadingMotion, setLoadingMotion] = useState(true);
    const [showError, setShowError] = useState(false);


    const typedRef1 = useRef(null);//로딩
    const typedRef2 = useRef(null);//error
    const startTyping = useTypingSequence();

    useEffect(() => {
        const typingData = [
            { ref: typedRef1, strings: [loadingText], delay: 500 },
        ];

        let cleanupFunction = () => { };
        if (loadingMotion && !showError) {
            cleanupFunction = startTyping(typingData)
        } else {
            if (typedRef1.current) { typedRef1.current.innerHTML = ''; }
        }
        return cleanupFunction;
    }, [loadingMotion]);



    useEffect(() => {
        console.log("\n loading 컴포넌트 마운팅~~");
        const timer = setTimeout(() => {
            setModelStop(true);
            setLoadingMotion(false);

            if (errorText.length > 0) {
                console.log(errorText);
                setShowError(true);
            }
        }, 3000);

        // 컴포넌트가 사라질 때 타이머를 정리(cleanup)하는 것이 좋습니다.
        return () => {
            clearTimeout(timer);
            console.log("clearTimeout ##")
        }
    }, [])

    const btnHandle = () => {
        setLoadingMotion(true);

        setModelStop(false);
        const exitTimer = setTimeout(() => {
            setGoNext(nextStep);
            console.log("로딩 끝");

        }, 3000);
        return () => {
            clearTimeout(exitTimer);
            console.log("clearTimeout ##")
        }
    }

    return (
        <div className={`${style.loadingBg} ${showError ? style.showError : ''}`}>
            {loadingMotion ? (
                <>
                    <SVGicon color={'#fff'} kind={'arrow'} />

                    <p className={style.loadingText} ref={typedRef1}>
                        {loadingText}
                    </p>
                </>
            ) :

                (setModelStop &&
                    <>
                        <SVGicon color={'#ff0000'} kind={'error'} />

                        <div className={style.errorText} >
                            {errorText.map((text, index) => {
                                return (<p key={index}>
                                    {text}
                                </p>
                                )
                            })}
                            <input type="button" value="Yes" onClick={btnHandle} />
                        </div>
                    </>
                )
            }

        </div >
    )
}

export default Loading