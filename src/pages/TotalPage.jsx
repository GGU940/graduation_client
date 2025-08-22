import { useEffect, useState, Suspense } from "react";
import { Canvas } from '@react-three/fiber';
// drei : R3F에서 자주 쓰는 유용한 도구(카메라, 조명, 컨트롤 등)를 모아놓은 라이브러리
import { OrbitControls, Stage } from '@react-three/drei';

import { API_BASE } from '../store/ref';
// import style from "../css/TotalPage.module.css";

import Building from "../components/Building";


const TotalPage = () => {
    // 서버에서 불러온 모든 건물(콜라주) 데이터를 저장할 상태
    const [collages, setCollages] = useState([]);

    // 컴포넌트가 처음 마운트될 때 서버에서 데이터를 한 번만 불러옵니다.
    useEffect(() => {
        const fetchAllCutouts = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/allCutouts`);
                const data = await res.json();
                setCollages(data);// 불러온 데이터를 상태에 저장.
                console.log("TotalPage 불러온 데이터:", data);
            } catch (err) {
                console.error("❌ TotalPage 데이터 불러오기 실패", err);
            }
        };
        fetchAllCutouts();
    }, []);


    return (

        <div style={{ width: '100vw', height: '100vh', background: '#dff0ffff' }}>

            {/* 
                2. 3D 렌더링을 위한 Canvas 설정 
                이 컴포넌트 내부에 있는 것들은 HTML이 아닌 3D 객체로 렌더링
                dpr: 기기의 픽셀 비율에 맞춰 선명하게 렌더링합니다.
                camera: 3D 공간을 바라보는 '카메라'의 초기 위치와 시야각(fov)을 설정합니다.
            */}
            <Canvas dpr={[1, 2]} camera={{ fov: 45, position: [0, 5, 10] /*[X, Y, Z] */ }}>


                {/* 
                    3. 로딩 중을 위한 Suspense 처리
                    Suspense는 비동기 작업(여기서는 Building 컴포넌트의 텍스처 로딩)이
                    끝날 때까지 기다려주는 역할을 합니다. 작업이 완료되기 전까지는
                    fallback에 지정된 것을 보여줍니다. (현재는 null이라 아무것도 안 보임)
                */}
                <Suspense fallback={null}>

                    {/* Stage: 조명, 그림자 등 배경 환경을 예쁘게 자동 설정 */}
                    <Stage environment="city" intensity={0.6}>

                        {/* 4. 불러온 데이터 배열을 순회하며 Building 컴포넌트로 넘겨주며 렌더링 */}
                        {collages.map((building, index) => (
                            <Building
                                key={building._id || index}
                                cutoutsData={building.cutouts}// 건물 한 채에 대한 콜라주 데이터를 props로 전달
                                position={[(index % 5) * 3 - 6, 0, Math.floor(index / 5) * 3 - 3]} // 건물들 위치 배열
                            />
                        ))}
                    </Stage>
                </Suspense>


                {/*
                  OrbitControls는 사용자가 마우스로 3D Scene을
                  회전시키거나(클릭+드래그), 줌인/아웃(휠)할 수 있게 해주는 '카메라 조종 장치'입니다.
                */}
                <OrbitControls makeDefault /*autoRotate*/ />
            </Canvas>
        </div >
    )
}

export default TotalPage