import React, { useState, useEffect } from "react";
import * as THREE from 'three';
import potpack from 'potpack';

// --- (상수 정의는 동일) ---
const TEXTURE_ARGS = { width: 450, height: 800 };
const BUILDING_HEIGHT = 3;
const BUILDING_ASPECT_RATIO = TEXTURE_ARGS.width / TEXTURE_ARGS.height;
const GEOMETRY_ARGS = {
    width: BUILDING_HEIGHT * BUILDING_ASPECT_RATIO,
    height: BUILDING_HEIGHT,
    depth: BUILDING_HEIGHT * BUILDING_ASPECT_RATIO,
};
const GAP = 20;
const HALF_GAP = GAP / 2;
// --- --- ---

// [수정] 헬퍼 함수에서 Number() 형 변환 확인
const createTextureFromColumns = async (columns, imagePathMap) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '808080';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let currentXOffset = 0;

    for (const column of columns) {
        const boxes = column.images.map(img => ({
            w: Number(img.width) + GAP,  // 👈 Number() 추가 (안전장치)
            h: Number(img.height) + GAP, // 👈 Number() 추가 (안전장치)
            ...img
        }));
        potpack(boxes);

        await Promise.all(boxes.map(box => new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            const webpackSrc = imagePathMap.get(box.src);
            if (!webpackSrc) {
                console.error(`이미지 경로를 찾을 수 없습니다: ${box.src}`);
                return reject(new Error('Image path not found in map'));
            }
            img.src = webpackSrc;
            img.onload = () => {
                const finalX = currentXOffset + box.x + HALF_GAP;
                const finalY = box.y + HALF_GAP;
                ctx.drawImage(img, finalX, finalY, box.width, box.height);
                resolve();
            };
            img.onerror = reject;
        })));
        currentXOffset += column.width;
    }
    return new THREE.CanvasTexture(canvas);
};

// --- [추가] 바깥쪽(회색), 투명 재질을 미리 생성 ---
const grayMaterial = new THREE.MeshStandardMaterial({
    color: "#808080",      // 👈 회색
    transparent: true,    // 👈 1. 투명도 활성화
    opacity: 1,     // 👈 2. 투명도 50%로 설정 (0.0 ~ 1.0 사이 값)
}); // 👈 회색
const invisibleMaterial = new THREE.MeshStandardMaterial({ visible: false });

// [추가] 바깥쪽 박스가 사용할 6면 재질 배열 (위/아래 뚫림)
const outerMaterials = [
    grayMaterial,      // Right
    grayMaterial,      // Left
    invisibleMaterial, // Top (뚫림)
    invisibleMaterial, // Bottom (뚫림)
    grayMaterial,      // Front
    grayMaterial       // Back
];
// --- --- ---

const LayoutBuilding = ({ columnsData, position, imagePathMap }) => {
    // [수정] 안쪽 재질이므로 'innerMaterials'로 이름 변경
    const [innerMaterials, setInnerMaterials] = useState(null);

    useEffect(() => {
        const generateMaterials = async () => {
            const mainTexture = await createTextureFromColumns(columnsData, imagePathMap);

            const matFront = new THREE.MeshStandardMaterial({ map: mainTexture.clone() });
            matFront.map.offset.set(0, 0); matFront.map.repeat.set(0.25, 1);
            const matRight = new THREE.MeshStandardMaterial({ map: mainTexture.clone() });
            matRight.map.offset.set(0.25, 0); matRight.map.repeat.set(0.25, 1);
            const matBack = new THREE.MeshStandardMaterial({ map: mainTexture.clone() });
            matBack.map.offset.set(0.5, 0); matBack.map.repeat.set(0.25, 1);
            const matLeft = new THREE.MeshStandardMaterial({ map: mainTexture.clone() });
            matLeft.map.offset.set(0.75, 0); matLeft.map.repeat.set(0.25, 1);

            // [중요] 안쪽 재질은 'BackSide'를 유지합니다.
            [matFront, matRight, matBack, matLeft].forEach(mat => {
                mat.side = THREE.BackSide;
            });

            // [수정] 'innerMaterials' state에 저장
            setInnerMaterials([
                matRight, matLeft,
                invisibleMaterial, invisibleMaterial, // 위, 아래 (뚫림)
                matFront, matBack
            ]);
        };

        if (columnsData && imagePathMap && imagePathMap.size > 0) {
            generateMaterials();
        }
    }, [columnsData, imagePathMap]);

    // 안쪽 재질이 로딩 중이면 null 반환
    if (!innerMaterials) return null;

    // [수정] 두 개의 <mesh>를 <group>으로 묶어서 반환
    return (
        <group position={position}>
            {/* 1. 안쪽 (텍스처) 박스 */}
            <mesh castShadow>
                <boxGeometry args={[GEOMETRY_ARGS.width, GEOMETRY_ARGS.height, GEOMETRY_ARGS.depth]} />
                {innerMaterials.map((material, index) => (
                    <primitive key={`inner-${index}`} object={material} attach={`material-${index}`} />
                ))}
            </mesh>

            {/* 2. 바깥쪽 (회색) 박스 */}
            <mesh receiveShadow>
                {/* 안쪽 박스보다 아주 살짝 크게 만듭니다. */}
                <boxGeometry args={[
                    GEOMETRY_ARGS.width + 0.01,
                    GEOMETRY_ARGS.height + 0.01,
                    GEOMETRY_ARGS.depth + 0.01
                ]} />
                {/* 6면에 회색/투명 재질 배열 적용 */}
                {outerMaterials.map((material, index) => (
                    <primitive key={`outer-${index}`} object={material} attach={`material-${index}`} />
                ))}
            </mesh>
        </group>
    );
}

export default LayoutBuilding;