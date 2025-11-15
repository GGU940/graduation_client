import React, { useState, useEffect, useRef } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import SVGicon from './SVGicon';
import style from '../css/InitialPage.module.css'


const QuestionCon = () => {

    const [plzAni, setPlzAni] = useState(false);

    const [answer1, setAnswer1] = useState('');
    const [answer2, setAnswer2] = useState('');
    const [answer3, setAnswer3] = useState('');
    const answerList = [answer1, answer2, answer3];
    const setAnswerList = [setAnswer1, setAnswer2, setAnswer3];

    // const [, setWhatKind] = useState('question');

    const questionList = [{
        q: `아이콘을 관찰하셨나요?.`,
        a: ['네', '아니오']
    }, {
        q: '위의 덩굴식물(배경)과, 복합시설건물(아이콘) 중, 어느 것이 더 가치있나요?',
        a: ['덩굴식물', '복합시설건물']
    }, {
        q: '오늘날 세상의 지향점은 당신과 같나요?',
        a: ['같다.', '다르다.']
    }];

    // ✅ CSSTransition을 위한 ref 
    const nodeRef1 = useRef(null);

    useEffect(() => {
        console.log("ㅠㅠㅠㅠQuestionCon")
        setPlzAni(true);
    }, [])




    useEffect(() => {
        console.log('&&&&&', answerList)
    }, [answer1, answer2, answer3])






    return (
        <>
            <TransitionGroup component={null}>
                {/* :자식 요소가 추가/제거될 때 'enter'와 'exit' 애니메이션을 실행  */}

                {plzAni ? (


                    < CSSTransition
                        // in={true}      // ✅ 1. 애니메이션 스위치를 켭니다.
                        // appear={true}  // ✅ 2. 마운트될 때 'enter' 애니메이션을 즉시 실행합니다.
                        key="step3-qna"
                        timeout={600}// 
                        classNames={{ // ✅ 여기도 동일하게
                            enter: style.slideEnter,
                            enterActive: style.slideEnterActive,
                            enterDone: style.slideEnterDone,
                            exit: style.slideExit,
                            exitActive: style.slideExitActive,
                            exitDone: style.slideExitDone,
                        }
                        }
                        nodeRef={nodeRef1} >

                        <div className={style.slideBox} ref={nodeRef1}>

                            {questionList.map((questionSet, index) => {

                                const showQ0 = index === 0;
                                const showQ1 = index === 1 && answerList[0] !== '';
                                const showQ2 = index === 2 && answerList[1].length > 2;



                                if (showQ0 || showQ1 || showQ2) {
                                    let whatKind = 'question';
                                    if (Array.isArray(questionSet.a)) {//답이 문자열일 경우 :질문2
                                        if (answerList[index].length > 2) whatKind = 'complete';

                                    } else {
                                        if (answerList[index] !== '') whatKind = 'complete';

                                    }
                                    return (
                                        <div className={style.qBox} key={index}>

                                            <SVGicon
                                                color={'#000'}
                                                kind={whatKind} />
                                            <p >
                                                {questionSet.q}
                                            </p>

                                            <div className={style.inputBox}>

                                                {!Array.isArray(questionSet.a) ? (

                                                    <>
                                                        <input
                                                            type="text"
                                                            name={`answerGroup${index}`}
                                                            onChange={(e) => setAnswerList[index](e.target.value)}
                                                            value={answerList[index]}
                                                            placeholder="2자 이상 입력" />
                                                    </>

                                                ) : (
                                                    <>

                                                        <label>
                                                            <input
                                                                type="radio" // 👈 'checkbox'에서 'radio'로 변경
                                                                name={`answerGroup${index}`} // 👈 두 버튼에 동일한 name 속성 부여
                                                                onChange={() => { setAnswerList[index](questionSet.a[0]); console.log("1번질문>>>", answer1); }}
                                                            /> {questionSet.a[0]}
                                                        </label>
                                                        <label>
                                                            <input
                                                                type="radio" // 👈 'checkbox'에서 'radio'로 변경
                                                                name={`answerGroup${index}`}// 👈 두 버튼에 동일한 name 속성 부여
                                                                onChange={() => { setAnswerList[index](questionSet.a[1]);; console.log("1번질문>>>", answer1); }}
                                                            /> {questionSet.a[1]}
                                                        </label>
                                                    </>)}

                                            </div>
                                        </div>
                                    )



                                }

                                return null;
                            })}


                            <button className={style.qSubmit} onClick={() => { window.location.href = "http://localhost:3000/newplay"; }}>
                                다음
                            </button>

                        </div>
                    </CSSTransition>
                ) : ''}
            </TransitionGroup >
        </>
    )
}

export default QuestionCon