import { create } from "zustand";

// 1. 로컬 스토리지에서 초기값을 안전하게 불러오는 헬퍼 함수
const getInitialParams = () => {
    try {
        const item = localStorage.getItem("artParams");
        // 저장된 JSON이 있으면 파싱해서 반환
        return item ? JSON.parse(item) : { ans1Float: 0.0, ans2Float: 0.0, ans3Float: 0.0 };
    } catch (e) {
        // 파싱 실패 시 기본값 반환
        return { nameFloat: 0.0, valueA: 0.0, valueB: 0.0 };
    }
}


//아트 파라미터 전용 스토어 생성
const useArtParamsStore = create((set) => ({
    // --- State (상태) ---
    ...getInitialParams(), // 로컬 스토리지에서 불러온 초기값

    // --- Actions (동작) ---

    /**
     * 3개의 float 파라미터를 Zustand와 LocalStorage에 저장합니다.
     * params - { ans1Float, ans2Float, ans3Float }
     */
    setParams: (params) => {
        // 로컬 스토리지에 JSON 문자열로 저장
        localStorage.setItem("artParams", JSON.stringify(params));
        // Zustand state 업데이트
        set(params);
    },

    /**
     * 파라미터를 리셋합니다. (선택 사항)
     */
    resetParams: () => {
        localStorage.removeItem("artParams");
        set({ nameFloat: 0.0, valueA: 0.0, valueB: 0.0 });
    }
}));

export default useArtParamsStore;