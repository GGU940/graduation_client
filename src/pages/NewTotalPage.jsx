import React, { Suspense, useEffect, useState } from 'react'
import io from 'socket.io-client'; // 👈 [추가]

import { Canvas, } from '@react-three/fiber';
import { Stage, OrbitControls, } from '@react-three/drei';
import { API_BASE } from '../store/ref';

import style from '../css/NewTotalPage.module.css'
import LayoutBuilding from '../components/LayoutBuilding';

//  NewPlayPage에서 사용했던 이미지 목록을 가져옵니다.
import { allImages } from '../store/outputImagesInfo.js';
// NewPlayPage와 동일한 로직으로 Webpack 경로 맵을 생성합니다.
const imageContext = require.context(
    '../outputImages', // Webpack이 찾을 위치
    false,
    /\.(jpe?g)$/i
);
const webpackNfdKeys = imageContext.keys();
const webpackNfcKeys = webpackNfdKeys.map(key => key.normalize('NFC'));

// '가방.jpg' -> '/static/media/가방.a8b4c2.jpg' 맵(Map) 생성
const imagePathMap = new Map();
allImages.forEach((imageInfo) => {
    const storeNfcPath = `./${imageInfo.src}`.normalize('NFC');
    const webpackKeyIndex = webpackNfcKeys.indexOf(storeNfcPath);
    if (webpackKeyIndex !== -1) {
        const originalNfdKey = webpackNfdKeys[webpackKeyIndex];
        // 맵에 저장: { "가방.jpg" => "/static/media/..." }
        imagePathMap.set(imageInfo.src, imageContext(originalNfdKey));
    }
});
// --- 맵 생성 완료 -



const NewTotalPage = () => {


    const [layouts, setLayouts] = useState([]);

    useEffect(() => {

        const fetchAllLayouts = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/allLayouts`);
                const data = await res.json();
                setLayouts(data)
                console.log(">> 01 <<. TotalPage 불러온 Layout 데이터:", data);
            } catch (err) {
                console.error("❌ TotalPage Layout 데이터 불러오기 실패", err);
            }
        }
        fetchAllLayouts();

        const socket = io(API_BASE);
        //  "new_layout" 이벤트(방송) 수신 대기
        socket.on("new_layout", (newLayoutData) => {
            console.log(">> 02 <<. 새 레이아웃 수신:", newLayoutData);
            // state에 새 건물(레이아웃) 즉시 추가
            setLayouts((prevLayouts) => [...prevLayouts, newLayoutData]);
        });

        //컴포넌트 언마운트 시 소켓 연결 해제
        return () => {
            socket.disconnect();
        };
    }, [])



    return (
        < div
            className={style.NewTotalPage}
        >
            <Canvas dpr={[1, 2]} camera={{ fov: 65, position: [0, 5, 10] }} >

                <Suspense fallback={null}>
                    <Stage environment="city" intensity={0.6}>

                        {layouts.map((layout, index) => (


                            <LayoutBuilding
                                key={layout._id || index}
                                columnsData={layout.columns}
                                position={[(index % 5) * 3 - 6, 0, Math.floor(index / 5) * 3 - 3]}
                                imagePathMap={imagePathMap}
                            />
                        ))
                        }


                    </Stage>
                </Suspense>
                <OrbitControls makeDefault />
            </Canvas >
        </div >




    )
}

export default NewTotalPage