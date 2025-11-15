import React, { Suspense, useState } from 'react'
// import style from '../css/NewTotalPage.module.css'
import Model from '../components/Model';
import { Environment, OrbitControls, } from '@react-three/drei';
import { Canvas, } from '@react-three/fiber';



const NewTotalPage = () => {
    // const [modelStop, setModelStop] = useState(false);
    const arrayForTest = Array.from({ length: 12 });

    console.log(arrayForTest);

    const SPACING_X = 0.25; //모델 간 간격

    //  X축 오프셋(중앙 정렬)을 배열의 실제 길이를 기준으로 '동적'으로 계산   // (전체 길이의 절반만큼 왼쪽으로 이동)
    const dynamicXOffset = ((arrayForTest.length - 1) * SPACING_X) / 2;

    // const SPACING_Z = 2.0;
    // const xOffset = ((COLUMNS - 1) * SPACING_X) / 2;
    // const zOffset = ((5 - 1) * SPACING_Z) / 2;

    // --- (변경) ---
    // className 대신 inline style을 사용합니다.
    // 캔버스가 렌더링될 공간을 확보하기 위해 div에 높이와 너비를 100%로 설정합니다.
    // (이 div의 부모 요소가 화면 전체 높이를 가져야 합니다.)
    const pageStyle = {
        width: '100vw',
        height: '100vh', // 뷰포트(화면) 전체 높이
        backgroundColor: '#000000' // 배경색 추가 (구분을 위해)
    };



    return (
        < div
            // className={style.NewTotalPage}
            style={pageStyle}
        >
            <Canvas camera={{ position: [0, 2, 7], fov: 20 }} > {/*  3D 씬을 렌더링할 캔버스  position:[x, y, z], fov(시야각):클 수록 광각렌즈*/}
                <Suspense fallback={null}>{/*  모델이 로드될 때까지 대기 (fallback={null}은 로딩 중 아무것도 표시 안 함) */}

                    {arrayForTest.map((_, index) => {
                        const x = index * SPACING_X - dynamicXOffset;
                        const z = 0;
                        const y = 0;
                        return (

                            <Model key={index}
                                // modelStop={modelStop} 
                                position={[x, y, z]}
                                scale={0.2} />
                        )
                    })
                    }

                    <Environment preset="studio" intensity={2} /> {/*모델을 비추는 기본 조명 설정 (없으면 검게 보임)*/}
                </Suspense>
                <OrbitControls enableZoom={true} /> {/* 360도 회전 컨트롤러 (줌 비활성화, 자동 회전) */}
            </Canvas>
        </div >




    )
}

export default NewTotalPage