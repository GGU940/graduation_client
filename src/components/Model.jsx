// import { useGLTF } from '@react-three/drei';
// // import { useFrame } from '@react-three/fiber';
// import React, { useRef } from 'react'

// const Model = ({ position = [0, 0, 0], scale = 1.0 }) => {
//     const { scene } = useGLTF('../../models/test.glb');

//     const modelRef = useRef();
//     // useFrame((state, delta) => {
//     //     // 5. ref.current가 존재하면 (모델이 로드되면)
//     //     if (modelRef.current && !modelStop) {
//     //         modelRef.current.rotation.y += delta * 0.2;
//     //     }
//     // });

//     return (
//         <primitive
//             ref={modelRef}
//             object={scene}
//             scale={scale}
//             position={position}
//         />
//     );
// }
// useGLTF.preload('../../models/test.glb');
// export default Model;

import { useGLTF } from '@react-three/drei';
// 1. useMemo를 import 합니다.
import React, { useRef, useMemo } from 'react'

const Model = ({ position = [0, 0, 0], scale = 1.0 }) => {
    const { scene } = useGLTF('../../models/test.glb');

    // --- (수정) ---
    // 2. 원본 scene을 useMemo를 사용해 '복제(clone)'합니다.
    //    이제 5개의 모델이 각자 고유한 복제본을 갖게 됩니다.
    const clonedScene = useMemo(() => scene.clone(), [scene]);

    const modelRef = useRef();

    return (
        <primitive
            ref={modelRef}
            // 3. object에 원본 scene 대신 복제본(clonedScene)을 전달합니다.
            object={clonedScene}
            scale={scale}
            position={position}
        />
    );
}
useGLTF.preload('../../models/test.glb');
export default Model;