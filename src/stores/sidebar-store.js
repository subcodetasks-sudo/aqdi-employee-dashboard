import { create } from "zustand";


export const useSidebarStore = create(
  (set) => ({
    displayedPart: "default",
    orderId: null,
    isSidebarOpen: false,
    setOrderId: (id) => set({ orderId: id }),
    setDisplayedPart: (part) => set({ displayedPart: part }),
    setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  }),
);
