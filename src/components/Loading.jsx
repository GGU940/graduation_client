import React, { useEffect, useState, useRef } from 'react'
import style from "../css/Loading.module.css"
import { useTypingSequence } from '../utils/useTypingSequene';
import LoadingIcon from './LoadingIcon';

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
                    <LoadingIcon color={'#fff'} />

                    <p className={style.loadingText} ref={typedRef1}>
                        {loadingText}
                    </p>
                </>
            ) :

                (setModelStop &&
                    <>
                        <svg className={style.errorSymbol} width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 22H22L12 2Z" fill="#ff0000" stroke="#ff0000" stroke-width="2" />
                            <path d="M12 8V13" stroke="black" stroke-width="2" stroke-linecap="butt" stroke-linejoin="round" />
                            <circle cx="12" cy="17" r="1.5" fill="black" />
                        </svg>
                        <div className={style.errorText} >
                            {errorText.map((text) => {
                                return (<p>
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