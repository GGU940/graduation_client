import { create } from 'zustand';

const useUIStore = create((set) => ({
    cursorSize: 350,
    setCursorSize: (size) => set({ cursorSize: size }),
}));

export default useUIStore;