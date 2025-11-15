import React, { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, } from '@react-three/drei'; // 헬퍼 라이브러리

import style from '../css/InitialPage.module.css'
import currentNameStore from '../store/currentNameStore';
import Login from '../components/Login';
import FaceChecker from '../components/FaceCheckerLive'
import QuestionCon from '../components/QuestionCon';
import Loading from '../components/Loading';

/**---------------
 * 3D 모델(.glb)을 로드하고 씬(scene)을 반환하는 내부 컴포넌트
 * 모델 로직을 별도 컴포넌트로 분리하면 Suspense 적용에 유리하다.
 */
function Model({ modelStop }) {
    //useGLTF 훅을 사용해 .glb 파일을 로드
    const { scene } = useGLTF('../../models/icon1.glb');

    //ref 생성 -> 모델 참조
    const modelRef = useRef();

    // 4. useFrame 훅: 매 프레임마다 실행되는 애니메이션 루프
    // (state, delta) -> delta는 프레임 간의 시간 간격 (애니메이션을 부드럽게 함)
    useFrame((state, delta) => {
        // 5. ref.current가 존재하면 (모델이 로드되면)
        if (modelRef.current && !modelStop) {
            // 6. 모델의 Y축 회전(rotation.y) 값을 매 프레임마다 조금씩 증가시킨다.
            // delta * 0.5 에서 0.5는 회전 속도. 값을 조절하면 속도가 바뀐다.
            modelRef.current.rotation.y += delta * 0.5;
        }
    });

    //  <primitive> 태그는 R3F(설계도 뉘앙스)가 아닌 Three.js 객체(scene)를 직접 렌더링할 때 사용한다.
    // object 속성에 로드한 scene을 전달한다.
    // scale={1.0}은 모델의 크기를 1배로 설정 (0.5로 하면 절반 크기)
    return <primitive
        ref={modelRef}
        object={scene}
        scale={1.0}
        position={[0, -1, 0]} />;
}
//-----------------------------

const InitialPage = () => {
    const [iconCenter, setIconCenter] = useState({ x: 0, y: 0 });
    const [isFace, setIsFace] = useState(false); //얼굴인식 여부
    const [faceTiming, setFaceTiming] = useState(false); //화면에 나오는


    const [isIconActive, setIsIconActive] = useState(false);
    const [isIconHoverd, setIsIconHoverd] = useState(false);
    const [modelStop, setModelStop] = useState(false);
    const [loading, setLoading] = useState(false);

    const isLogin = currentNameStore((state) => state.currentName);
    const setIsLogin = currentNameStore((state) => state.setCurrentName);
    const resetLogin = currentNameStore((state) => state.resetCurrentName);

    const lineRef = useRef(null);
    const iconRef = useRef(null); //.iconBox div를 DOM에서 직접 선택하기 위한 useRef 
    const timerRef = useRef(null);

    const [goNext, setGoNext] = useState(null);
    const [initialPageExit, setInitialPageExit] = useState(false);


    useEffect(() => {
        console.log("~~~~~~ 페이지 마운팅 댐 ~~~~~~~")
        resetLogin()
        console.log("%%%%%%%% isLogin : ", isLogin)

        // 마우스가 움직일 때마다 
        const handleMouseMove = (e) => {
            // 'lineRef'에 담긴 실제 DOM 엘리먼트에 직접 접근
            if (lineRef.current) {
                // React 리렌더링 없이 DOM 속성(attribute)을 바로 변경
                lineRef.current.setAttribute('x1', e.clientX);
                lineRef.current.setAttribute('y1', e.clientY);

                // 랜덤 굵기도 여기서 직접 설정 (React 렌더링과 분리)
                const randomWidth = [Math.random() * 36] + 4;
                lineRef.current.setAttribute('stroke-width', randomWidth);

                //React State 대신 DOM 스타일을 '보이게' 변경
                lineRef.current.style.display = 'block';
            }


            // 이전에 설정된 타이머가 있다면 '취소'
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            timerRef.current = setTimeout(() => {
                if (lineRef.current) {
                    lineRef.current.style.display = 'none';
                }
            }, 100)
        };

        // 이벤트 리스너 등록
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };

    }, [])

    useEffect(() => {
        if (isLogin) {
            console.log("로그인됌??????", isLogin);
            setLoading(true);
        } else {
            setLoading(false);
        }

    }, [isLogin])

    useEffect(() => {
        if (iconRef.current) {
            if (isIconHoverd) {
                iconRef.current.classList.add(style.iconHoverd);
            } else {
                iconRef.current.classList.remove(style.iconHoverd);
            }
        }
    }, [isIconHoverd])


    useEffect(() => {
        if (isIconActive) {
            console.log("isIconActive!!!!!")
            iconRef.current.classList.remove(style.iconHoverd);
        }
    }, [isIconActive])


    useEffect(() => {
        let timeoutId;
        //재귀 setTImeout
        const blinkStep = () => {
            if (!isFace) { return; }//얼굴 안보일때 멈춤

            setFaceTiming(prev => !prev);
            let randomTimeShort = Math.floor(Math.random() * 701) + 100;
            let randomTimeLong = Math.floor(Math.random() * 1500) + 1500;
            const delay = faceTiming ? randomTimeLong : randomTimeShort;//다음 지연 시간 결정

            timeoutId = setTimeout(blinkStep, delay);
        };

        if (isFace) {
            timeoutId = setTimeout(blinkStep, 10);//첫 실행
        } else {
            setFaceTiming(false);
        }
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isFace])

    //중심점 위치 찾기
    useLayoutEffect(() => {
        const updateIconCenter = () => {
            if (iconRef.current) {
                // divRef.current (즉, .iconBox div)의 현재 화면상 위치와 크기 정보를 'rect' 객체로 반환받는다.
                // (rect 객체에는 left, top, right, bottom, width, height 등이 들어있음)
                const rect = iconRef.current.getBoundingClientRect();

                setIconCenter({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
            }
        };

        updateIconCenter();// 컴포넌트가 처음 마운트될 때 중심점을 계산하기 위해 한 번 즉시 실행


        // --- 이벤트 리스너 등록 ---
        // 브라우저 창 크기가 바뀔 때마다('resize'),스크롤 이벤트가 발생할 때마다('scroll') updateDivCenter 함수를 다시 실행
        window.addEventListener('resize', updateIconCenter);
        window.addEventListener('scroll', updateIconCenter, true);//'true' 옵션 (Capture Phase): 스크롤 이벤트가 버블링되기 전에 먼저 감지


        // --- 클린업(Cleanup) 함수 ---
        return () => {
            window.removeEventListener('resize', updateIconCenter);
            window.removeEventListener('scroll', updateIconCenter, true);
        };
    }, []);

    // iconCenter state가 변경될 때마다 실행되는 Effect
    useEffect(() => {
        // lineRef.current가 존재하고 (즉, <line>이 렌더링되었고)
        if (lineRef.current) {
            // div의 중심점(x2, y2) 속성을 DOM에 직접 업데이트
            lineRef.current.setAttribute('x2', iconCenter.x);
            lineRef.current.setAttribute('y2', iconCenter.y);
        }
    }, [iconCenter]); // iconCenter state가 바뀔 때만 이 코드가 실행됨



    return (
        <section className={style.pageBG}>
            {isLogin === "" && (
                <svg className={style.lineSvg}>

                    <line
                        //시작점
                        ref={lineRef}
                        //끝점
                        x2={iconCenter.x}
                        y2={iconCenter.y}
                        //style
                        stroke='white'
                        style={{ display: 'none' }}
                    // strokeWidth={(Math.random() * 20 + 25)}
                    />
                </svg>
            )}
            <div
                className={style.iconBox}
                ref={iconRef}
                onClick={() => setIsIconActive(true)}
                onMouseEnter={isIconActive ? null : () => setIsIconHoverd(true)}
                onMouseLeave={isIconActive ? null : () => setIsIconHoverd(false)}
            >

                <div className={style.iconImg}>
                    {loading && goNext !== 'Question' ?
                        <Loading
                            errorText={[`${isLogin}님을 접속하는 데에 실패하였습니다.`, '새로운 연결을 위한 인증 절차를 진행합니다.']}
                            nextStep={'Question'}
                            setModelStop={setModelStop}
                            setGoNext={setGoNext} />
                        : ''}

                    {!isLogin &&
                        <FaceChecker
                            isFace={isFace}
                            setIsFace={setIsFace}
                            faceTiming={faceTiming}

                        />}

                    {faceTiming ? '' : (
                        <Canvas camera={{ position: [0, 2, 8], fov: 20 }} > {/*  3D 씬을 렌더링할 캔버스  position:[x, y, z], fov(시야각):클 수록 광각렌즈*/}


                            <Suspense fallback={null}>{/*  모델이 로드될 때까지 대기 (fallback={null}은 로딩 중 아무것도 표시 안 함) */}
                                <Model modelStop={modelStop} />
                                <Environment preset="studio" intensity={2} /> {/*모델을 비추는 기본 조명 설정 (없으면 검게 보임)*/}

                            </Suspense>


                            <OrbitControls enableZoom={false} /> {/* 360도 회전 컨트롤러 (줌 비활성화, 자동 회전) */}
                        </Canvas>
                    )}

                </div>


                <div className={style.iconName}>
                    <Login
                        isIconActive={isIconActive}
                        isIconHoverd={isIconHoverd}
                        isLogin={isLogin}
                        setIsLogin={setIsLogin}
                    />

                </div>
            </div>

            {/* Qe*/}


            {goNext === 'Question' ?
                <QuestionCon /> : ''
            }
        </section>)

}

export default InitialPage