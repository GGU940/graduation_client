import React, { useState, useEffect, useRef } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import style from '../css/InitialPage.module.css'


const QuestionCon = () => {

    const questionList = ['1번질문', '2번질문', '3번질문'];
    const [answer1, setAnswer1] = useState(0);
    const [answer2, setAnswer2] = useState(0);
    const [answer3, setAnswer3] = useState(0);
    const answerList = [answer1, answer2, answer3];
    const setAnswerList = [setAnswer1, setAnswer2, setAnswer3];

    const typedRef1 = useRef(null);
    const typedRef2 = useRef(null);
    const typedRef3 = useRef(null);
    const allTypedRefs = [typedRef1, typedRef2, typedRef3];

    // ✅ CSSTransition을 위한 ref 
    const nodeRef1 = useRef(null);


    useEffect(() => {
        // 타이핑할 텍스트와 해당 Ref를 배열로 정의
        const typingData = [
            { ref: typedRef1, strings: [questionList[0]], delay: 500 },
            { ref: typedRef2, strings: [questionList[1]], delay: 100 },
            { ref: typedRef3, strings: [questionList[2]], delay: 100 },

        ];


        // let cleanupFunction = () => { }; // 타이머와 인스턴스를 정리할 함수 cleanup함수를 반환받아 저장할 것.
        // if (isIconHoverd) {
        //     // startTyping 함수를 호출하고, 반환되는 cleanup 함수를 저장합니다.
        //     cleanupFunction = startTyping(typingData)
        // } else {
        //     // isIconHoverd가 false가 될 때, 이전에 타이핑된 텍스트 잔상을 바로 지워줍니다
        //     allTypedRefs.forEach(ref => {
        //         if (ref.current) { ref.current.innerHTML = ''; }
        //         // 💡 cleanupFunction이 실행되지 않았어도, 다음 렌더링 시 이전 cleanup이 실행되어 정리됨.
        //     })
        // }
        // return cleanupFunction;
    }, [answerList]); // isIconHoverd가 변경될 때마다 이 effect를 재실행 (및 정리)


    useEffect(() => {
        console.log('&&&&&', answerList)
    }, [answer1, answer2, answer3])






    return (<TransitionGroup component={null}>

        <CSSTransition
            in={true}      // ✅ 1. 애니메이션 스위치를 켭니다.
            appear={true}  // ✅ 2. 컴포넌트가 처음 나타날 때 애니메이션을 실행합니다.
            key="step3-qna"
            timeout={600}//  300ms(opacity) + 300ms(delay)
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

                {questionList.map((q, index) => {
                    if (answerList[index - 1] !== 0 || index === 0) {

                        return (


                            <div className={style.qBox} key={index}>

                                <p ref={allTypedRefs[index]}>
                                    {q}
                                </p>

                                <div className={style.inputBox}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            onChange={() => { setAnswerList[index](1); console.log("clickkkkk") }}
                                        /> 선택1
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            onChange={() => { setAnswerList[index](2); console.log("clickkkkk") }}
                                        /> 선택2
                                    </label>
                                </div>
                            </div>


                        )
                    }
                    return null; // map에서는 항상 return 값이 있는 것이 좋습니다.
                })}

                <div className={style.recaptchaBox}>
                    인증
                </div>

            </div>
        </CSSTransition>
    </TransitionGroup>)
}

export default QuestionCon