/**
 * SSR-Safe SweetAlert2 Wrapper for The Kriya Lab
 * Prevents window/document SSR issues and handles dynamic client-side loading
 */
export async function getSwal() {
  if (typeof window !== "undefined") {
    const Swal = (await import("sweetalert2")).default;
    return Swal;
  }
  return null;
}

export const showAlert = {
  success: async (title: string, text?: string, timer = 2000) => {
    const Swal = await getSwal();
    if (Swal) {
      return Swal.fire({
        icon: "success",
        title,
        text,
        timer,
        showConfirmButton: false,
        customClass: {
          popup: "font-['Poppins',sans-serif] rounded-2xl",
        },
      });
    }
    return undefined;
  },

  error: async (title: string, text?: string) => {
    const Swal = await getSwal();
    if (Swal) {
      return Swal.fire({
        icon: "error",
        title,
        text,
        confirmButtonColor: "#334d84",
        customClass: {
          popup: "font-['Poppins',sans-serif] rounded-2xl",
        },
      });
    }
    return undefined;
  },

  warning: async (title: string, text?: string) => {
    const Swal = await getSwal();
    if (Swal) {
      return Swal.fire({
        icon: "warning",
        title,
        text,
        confirmButtonColor: "#334d84",
        customClass: {
          popup: "font-['Poppins',sans-serif] rounded-2xl",
        },
      });
    }
    return undefined;
  },

  confirm: async (title: string, text: string, confirmText = "Yes, delete it!") => {
    const Swal = await getSwal();
    if (Swal) {
      return Swal.fire({
        title,
        text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#f06548",
        cancelButtonColor: "#878a99",
        confirmButtonText: confirmText,
        cancelButtonText: "Cancel",
        customClass: {
          popup: "font-['Poppins',sans-serif] rounded-2xl",
        },
      });
    }
    return { isConfirmed: false, isDenied: false, isDismissed: true };
  },

  undoableDelete: async (itemName: string) => {
    const Swal = await getSwal();
    if (Swal) {
      return Swal.fire({
        title: "Deleting...",
        html: `Record <b>${itemName}</b> will be permanently deleted.<br/>You have 3 seconds to undo.`,
        icon: "warning",
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonText: "Undo",
        cancelButtonColor: "#334d84",
        timer: 3000,
        timerProgressBar: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
          popup: "font-['Poppins',sans-serif] rounded-2xl",
        },
      });
    }
    return { dismiss: "timer" as any };
  },
};

