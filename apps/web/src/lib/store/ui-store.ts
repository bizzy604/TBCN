import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// ============================================
// UI Store - Manages global UI state
// ============================================

interface UIState {
  // Sidebar state
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Modal state
  activeModal: string | null;
  modalData: Record<string, unknown> | null;
  
  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openModal: (modalId: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>()(
  immer((set) => ({
    // Initial state
    sidebarOpen: false,
    sidebarCollapsed: false,
    activeModal: null,
    modalData: null,
    globalLoading: false,
    loadingMessage: null,

    // Actions
    toggleSidebar: () =>
      set((state) => {
        state.sidebarOpen = !state.sidebarOpen;
      }),

    setSidebarOpen: (open) =>
      set((state) => {
        state.sidebarOpen = open;
      }),

    setSidebarCollapsed: (collapsed) =>
      set((state) => {
        state.sidebarCollapsed = collapsed;
      }),

    openModal: (modalId, data) =>
      set((state) => {
        state.activeModal = modalId;
        state.modalData = data || null;
      }),

    closeModal: () =>
      set((state) => {
        state.activeModal = null;
        state.modalData = null;
      }),

    setGlobalLoading: (loading, message) =>
      set((state) => {
        state.globalLoading = loading;
        state.loadingMessage = message || null;
      }),
  }))
);
