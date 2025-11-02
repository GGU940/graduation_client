import { create } from 'zustand';
// import {persist} from 'zustan'

const currentNameStore = create((set) => ({
    currentName: localStorage.getItem("userName") || "",  // 초기값 로컬스토리지에서 불러오기
    setCurrentName: (name) => {
        localStorage.setItem("userName", name); // zustand로 저장되면서 동시에 로컬에도 저장
        set({ currentName: name });
    },
    resetCurrentName: () => {
        localStorage.removeItem("userName");
        set({ currentName: "" });
        console.log("zusand resetLogin 실행됨!!")
    }
}));

export default currentNameStore;