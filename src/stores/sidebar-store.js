import { create } from "zustand";

export const useSidebarStore = create((set) => ({
  displayedPart: "default",
  orderId: null,
  isSidebarOpen: false,
  setOrderId: (id) => set({ orderId: id }),
  setDisplayedPart: (part) => set({ displayedPart: part }),
  // Closing the nav shell does not clear utility panels (notifications /
  // comments / payments) — those live in a separate left-side panel.
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  // PanelLeft / menu toggle is for the navigation sidebar only.
  toggleSidebar: () =>
    set((state) => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),
}));
