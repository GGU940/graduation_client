import React, { useState, useEffect, useRef } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import SVGicon from './SVGicon';
import style from '../css/InitialPage.module.css'

import useArtParamsStore from '../store/artParamsStore';

const QuestionCon = ({ setInitialPageExit }) => {

    const [plzAni, setPlzAni] = useState(false);

    const [answer1, setAnswer1] = useState('');
    const [answer2, setAnswer2] = useState('');
    const [answer3, setAnswer3] = useState('');
    const answerList = [answer1, answer2, answer3];
    const setAnswerList = [setAnswer1, setAnswer2, setAnswer3];

    const questionList = [{
        q: `아이콘을 관찰하셨나요?.`,
        a: ['관찰했습니다', '아니오 (마우스를 이용해보세요)']
    }, {
        q: '위의 덩굴식물(배경)과, 복합시설건물(아이콘) 중, 어느 것이 더 가치있나요?',
        a: ['덩굴식물', '복합시설건물']
    }, {
        q: '오늘날 세상의 지향점은 당신과 같나요?',
        a: ['같다.', '다르다.']
    }];
    const setParams = useArtParamsStore((state) => state.setParams);

    const timerRef = useRef(null);
    const timerRef2 = useRef(null);

    const nodeRef1 = useRef(null);// 1. 바깥쪽 slideBox를 위한 ref
    const nodeRefBtn = useRef(null);// 제출 btn를 위한 ref

    // 2. 안쪽 3개의 qBox를 위한 ref 배열 생성
    const nodeRefQ0 = useRef(null);
    const nodeRefQ1 = useRef(null);
    const nodeRefQ2 = useRef(null);
    const qBoxRefs = [nodeRefQ0, nodeRefQ1, nodeRefQ2];




    const stringToFloatBrowser = async (text) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);

        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const dataView = new DataView(hashBuffer); //해시 버퍼(32바이트)를 DataView로 감싸기
        const hashInt = dataView.getBigUint64(0); //첫 8바이트(64비트)만 읽어서 BigInt로 변환

        const maxHash = 2n ** 64n;//정규화 (2^64로 나누기)

        //BigInt를 일반 숫자(float)로 변환하여 반환
        return Number(hashInt) / Number(maxHash);
    }

    useEffect(() => {
        console.log("ㅠㅠㅠㅠQuestionCon")
        setPlzAni(true);

        return () => {
            // 5. 만약 타이머가(ref에 ID가) 아직 실행 대기 중이라면
            if (timerRef.current) {
                console.log("컴포넌트 언마운트: 타이머를 취소합니다.");
                clearTimeout(timerRef.current); // 예약된 타이머 취소
            }
            if (timerRef2.current) {
                console.log("컴포넌트 언마운트: 2번 타이머 취소");
                clearTimeout(timerRef2.current);
            }
            console.log('\n ---- question Con 닫힘-----  \n')
        };
    }, [])


    useEffect(() => {
        console.log('&&&&&', answerList)
    }, [answer1, answer2, answer3])


    const handleSubmit = async () => {

        console.log("handleSubmit 누름 ###");

        const [ans1Float, ans2Float, ans3Float] = await Promise.all([
            stringToFloatBrowser(answer1),
            stringToFloatBrowser(answer2),
            stringToFloatBrowser(answer3),
        ]);
        const params = { ans1Float, ans2Float, ans3Float };

        setParams(params); // Zustand + LocalStorage에 저장

        console.log("✅ 아트 파라미터 저장 완료:", params);

        gotoPage();
    }


    const gotoPage = () => {

        console.log("gotoPage 발동");

        //이전에 실행된 타이머가 있다면 일단 취소 (중복 클릭 방지)
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // 3. 타이머를 시작하고, 반환된 ID를 ref에 저장합니다.
        timerRef.current = setTimeout(() => {
            setPlzAni(false);
            setInitialPageExit(true);

            timerRef.current = null; // 실행 완료 후 ref 비우기


        }, 300);

    }



    return (
        <>
            <TransitionGroup component={null}>
                {/* :자식 요소가 추가/제거될 때 'enter'와 'exit' 애니메이션을 실행  */}

                {plzAni ? (

                    < CSSTransition
                        in={true}      // ✅ 1. 애니메이션 스위치를 켭니다.
                        appear={true}  // ✅ 2. 마운트될 때 'enter' 애니메이션을 즉시 실행합니다.
                        key="step3-qna"
                        timeout={300}// 
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

                        <div className={`${style.slideBox}`} ref={nodeRef1} style={{ backgroundColor: ' rgba(16, 58, 211, 0.7)', color: 'white' }}
                        >

                            <TransitionGroup component={null}>
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
                                            <CSSTransition
                                                key={index} // 👈 각 질문(Q0, Q1, Q2)에 고유한 key
                                                timeout={300} // 👈 새 애니메이션 시간
                                                in={true}      // ✅ 1. "지금 보여야 할 상태"라고 알려줌
                                                appear={true}  // ✅ 2. "마운트될 때도 enter 애니메이션 실행"
                                                classNames={{ // 👈 새 CSS 클래스 이름
                                                    enter: style.questionEnter,
                                                    enterActive: style.questionEnterActive,
                                                }}
                                                nodeRef={qBoxRefs[index]}
                                            >
                                                <div className={style.qBox}
                                                    ref={qBoxRefs[index]}
                                                >

                                                    <SVGicon
                                                        color={'yellow'}
                                                        kind={whatKind}
                                                    />
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
                                            </CSSTransition>
                                        )



                                    }

                                    return null;
                                })}
                                {answer3.length > 0 ? (
                                    <CSSTransition
                                        key={'btnTransition'} // 👈 각 질문(Q0, Q1, Q2)에 고유한 key
                                        timeout={300} // 👈 새 애니메이션 시간
                                        in={true}      // ✅ 1. "지금 보여야 할 상태"라고 알려줌
                                        appear={true}  // ✅ 2. "마운트될 때도 enter 애니메이션 실행"
                                        classNames={{ // 👈 새 CSS 클래스 이름
                                            enter: style.questionEnter,
                                            enterActive: style.questionEnterActive,
                                        }}
                                        nodeRef={nodeRefBtn}
                                    >

                                        <div className={style.qSubmitArea} ref={nodeRefBtn}>

                                            <button
                                                className={style.qSubmit}
                                                onClick={() => handleSubmit()}>
                                                제출하기
                                            </button>
                                        </div>
                                    </CSSTransition>


                                ) : ''}

                            </TransitionGroup>
                        </div>
                    </CSSTransition >
                ) : ''}
            </TransitionGroup >
        </>
    )
}

export default QuestionCon