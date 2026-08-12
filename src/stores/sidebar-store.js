import { create } from "zustand";

export const useSidebarStore = create((set) => ({
  displayedPart: "default",
  orderId: null,
  isSidebarOpen: false,
  setOrderId: (id) => set({ orderId: id }),
  setDisplayedPart: (part) => set({ displayedPart: part }),
  // Closing the shell always returns to the nav panel so the next open
  // does not revive a stale notifications/comments view.
  setSidebarOpen: (isSidebarOpen) =>
    set(
      isSidebarOpen
        ? { isSidebarOpen }
        : { isSidebarOpen: false, displayedPart: "default" }
    ),
  // PanelLeft / menu toggle is for the navigation sidebar only.
  // If notifications or comments are showing, switch back to nav (keep open)
  // instead of just flipping width while leaving displayedPart stale.
  toggleSidebar: () =>
    set((state) => {
      if (state.displayedPart !== "default") {
        return { displayedPart: "default", isSidebarOpen: true };
      }
      return { isSidebarOpen: !state.isSidebarOpen, displayedPart: "default" };
    }),
}));
