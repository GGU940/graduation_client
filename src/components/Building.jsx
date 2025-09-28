import React, { useState, useEffect } from "react";
import * as THREE from 'three';
import { createCollageTexture } from '../utils/createCollageTexture';

// 텍스처 캔버스의 너비, 높이를 상수로 정의
const TEXTURE_ARGS = {
    width: 450,
    height: 800,
};

// ✅ 1. 건물의 3D 높이를 기준으로 너비를 텍스처 비율에 맞게 자동 계산
const BUILDING_HEIGHT = 3; // 3D 씬에서의 건물 높이 기준값
const BUILDING_ASPECT_RATIO = TEXTURE_ARGS.width / TEXTURE_ARGS.height; // 450 / 800 = 0.5625

const GEOMETRY_ARGS = {
    width: BUILDING_HEIGHT * BUILDING_ASPECT_RATIO, // 높이에 비율을 곱해 너비를 계산 (3 * 0.5625 = 1.6875)
    height: BUILDING_HEIGHT,
    depth: BUILDING_HEIGHT * BUILDING_ASPECT_RATIO, // 깊이도 너비와 동일하게 설정하여 정사각형 기둥으로 만듦
};


const Building = ({ cutoutsData, position }) => {
    // 1. 생성된 재질(materials)을 담을 상태를 만듭니다. 초기값은 null입니다.
    const [materials, setMaterials] = useState(null);

    // 2. cutoutsData가 변경될 때마다 텍스처와 재질을 생성하는 Effect를 실행합니다.
    useEffect(() => {
        // 비동기 함수를 정의합니다.
        const generateMaterials = async () => {
            const invisibleMaterial = new THREE.MeshStandardMaterial({
                visible: false /// 건물의 위/아래 면을 뚫린 것처럼 보이게 하기 위한 '투명한 재질'
            });
            // 4개의 면에 대한 텍스처 생성을 Promise.all로 병렬 처리합니다.
            const [rightTexture, leftTexture, frontTexture, backTexture] = await Promise.all([
                createCollageTexture(cutoutsData.right || [], TEXTURE_ARGS.width, TEXTURE_ARGS.height),
                createCollageTexture(cutoutsData.left || [], TEXTURE_ARGS.width, TEXTURE_ARGS.height),
                createCollageTexture(cutoutsData.front || [], TEXTURE_ARGS.width, TEXTURE_ARGS.height),
                createCollageTexture(cutoutsData.back || [], TEXTURE_ARGS.width, TEXTURE_ARGS.height)
            ]);


            const alphaTestValue = 0.01;
            // Three.js의 재질 순서: [오른쪽, 왼쪽, 위, 아래, 앞, 뒤]
            const finalMaterials = [
                // map: 겉에 입힐 텍스처(이미지)
                // transparent, opacity: 반투명 효과
                // side: DoubleSide로 설정하여 안쪽 면도 보이게 함

                new THREE.MeshStandardMaterial({ map: rightTexture, side: THREE.DoubleSide, alphaTest: alphaTestValue }),
                new THREE.MeshStandardMaterial({ map: leftTexture, side: THREE.DoubleSide, alphaTest: alphaTestValue }),
                invisibleMaterial, // 위
                invisibleMaterial, // 아래
                new THREE.MeshStandardMaterial({ map: frontTexture, side: THREE.DoubleSide, alphaTest: alphaTestValue }),
                new THREE.MeshStandardMaterial({ map: backTexture, side: THREE.DoubleSide, alphaTest: alphaTestValue }),
            ];

            // 생성된 재질 배열을 상태에 저장합니다.
            setMaterials(finalMaterials);
        };

        generateMaterials();

    }, [cutoutsData]); // cutoutsData가 바뀔 때만 이 Effect를 다시 실행합니다.

    // 3. 재질이 아직 생성되지 않았다면(로딩 중이라면) 아무것도 렌더링하지 않습니다.
    if (!materials) {
        return null;
    }

    // 4. 재질 생성이 완료되면 mesh를 렌더링합니다.
    // mesh는 3D 객체의 가장 기본 단위로, '모양(Geometry)'과 '재질(Material)'의 조합입니다.
    // 레고 블록의 '모양'과 '색깔'이라고 생각하면 쉽습니다.
    return (
        <mesh position={position} castShadow>
            {/* boxGeometry는 직육면체 '모양'을 정의합니다. args로 [너비, 높이, 깊이]를 받습니다. */}
            <boxGeometry args={[GEOMETRY_ARGS.width, GEOMETRY_ARGS.height, GEOMETRY_ARGS.depth]} />

            {/*
              상태에 저장된 6개의 재질 배열을 순회하며 각 면에 적용합니다.
              primitive는 이미 생성된 Three.js 객체(여기서는 material)를 장면에 추가할 때 사용합니다.
              attach={`material-${index}`}는 각 재질을 박스의 0~5번째 면에 순서대로 붙이라는 의미입니다.
            */}
            {materials.map((material, index) => (
                <primitive key={index} object={material} attach={`material-${index}`} />
            ))}
        </mesh>
    );


};

export default Building;