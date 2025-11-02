// import { param } from "framer-motion/client";
import { useRef } from "react";
// import { instance } from "three/tsl";
import Typed from "typed.js";


// @returns {function} startTyping - 타이핑 시퀀스를 시작하고 정리 함수(cleanup)를 반환하는 함수.

export const useTypingSequence = () => {

    const typedInstances = useRef([]); //Typed.js 인스턴스 (객체)를 저장
    const timeoutIDs = useRef([]); //setTimeout으로 생성된 모든 타이머 id저장 -> 추후 clearTimeout 할 수 있도록

    //  * 타이핑 시퀀스를 시작하고 정리 함수(cleanup)를 반환하는 메인 함수.
    //  * @param { Array < Object >} typingData - { ref, strings, delay } 형태의 타이핑 데이터.
    //  * @param { function} [onSequenceComplete] - 전체 시퀀스가 완료되었을 때 실행할 콜백.
    //  * @returns { function} cleanup 함수(모든 인스턴스와 타이머를 정리).

    const cleanup = (typingData) => {
        timeoutIDs.current.forEach(id => clearTimeout(id));
        timeoutIDs.current = [];

        //활성화된 모든 Typed 인스턴스를 파괴 (애니메이션 멈춤)
        typedInstances.current.forEach(instance => {
            if (instance && instance.destroy) { instance.destroy() }
        })
        typedInstances.current = [];

        typingData.forEach(item => {
            if (item.ref.current) { item.ref.current.innerHTML = ''; }
        });
    };
    // return cleanup;

    const startTyping = (typingData, onSequenceComplete) => {
        cleanup(typingData);

        // [재귀 함수] 시퀀스의 다음 단계를 실행하는 핵심 로직
        const executeStep = (index) => {

            if (index >= typingData.length) {  //배열의 끝 = 마지막 문장이면 콜백 실행 후 하수 종료
                if (onSequenceComplete) onSequenceComplete();
                return
            }

            const { ref, strings, delay } = typingData[index];
            const nextIndex = index + 1;

            // 1. delay 시간 후 다음 타이핑을 시작하도록 setTimeout 설정
            const currentTimeoutID = setTimeout(() => {
                if (!ref.current) { return; } //ref요소 업스면 반환

                const instance = new Typed(ref.current, {
                    strings: strings,
                    typeSpeed: 20,
                    loop: false,
                    showCursor: false,

                    onComplete: () => {
                        executeStep(nextIndex);
                    },
                });

                typedInstances.current.push(instance);  //// 생성된 인스턴스를 Ref에 저장하여 나중에 destroy() 할 수 있도록
            }, delay);
            timeoutIDs.current.push(currentTimeoutID);
        };



        executeStep(0);


        return () => cleanup(typingData);

    };
    return startTyping;
};