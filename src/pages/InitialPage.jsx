import React, { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, } from '@react-three/drei'; // 헬퍼 라이브러리

import style from '../css/InitialPage.module.css'


/**
 * 3D 모델(.glb)을 로드하고 씬(scene)을 반환하는 내부 컴포넌트
 * 모델 로직을 별도 컴포넌트로 분리하면 Suspense 적용에 유리하다.
 */
function Model() {
    //useGLTF 훅을 사용해 .glb 파일을 로드
    const { scene } = useGLTF('../../models/icon1.glb');

    //ref 생성 -> 모델 참조
    const modelRef = useRef();
    // 4. useFrame 훅: 매 프레임마다 실행되는 애니메이션 루프
    // (state, delta) -> delta는 프레임 간의 시간 간격 (애니메이션을 부드럽게 함)
    useFrame((state, delta) => {
        // 5. ref.current가 존재하면 (모델이 로드되면)
        if (modelRef.current) {
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


const InitialPage = () => {





    return (
        <section className={style.pageBG}>
            <div className={style.iconBox}>
                <div className={style.iconImg}>
                    <Canvas camera={{ position: [0, 2, 8], fov: 20 }} > {/*  3D 씬을 렌더링할 캔버스  position:[x, y, z], fov(시야각):클 수록 광각렌즈*/}


                        <Suspense fallback={null}>{/*  모델이 로드될 때까지 대기 (fallback={null}은 로딩 중 아무것도 표시 안 함) */}
                            <Model />
                            <Environment preset="studio" intensity={2} /> 모델을 비추는 기본 조명 설정 (없으면 검게 보임)

                        </Suspense>


                        <OrbitControls enableZoom={false} /> {/* 360도 회전 컨트롤러 (줌 비활성화, 자동 회전) */}
                    </Canvas>
                </div>
                <div className={style.iconName}>
                    <span> 1/∞  </span>
                    <span>  제목  </span>
                    <span>  2025</span>

                </div>
            </div>

        </section>)

}

export default InitialPage