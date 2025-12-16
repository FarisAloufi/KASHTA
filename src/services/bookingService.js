import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/**
 * تحديث حالة الخدمات في الطلب
 * @param {string} bookingId 
 * @param {string} currentUserId 
 * @param {string} userRole 
 * @param {string} newStatus 
 * @param {string|null} reason
 */
export const updateBookingItemStatus = async (bookingId, currentUserId, userRole, newStatus, reason = null) => {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      throw new Error("الطلب غير موجود");
    }

    const bookingData = bookingSnap.data();
    const currentItems = bookingData.items || bookingData.services || [];

    const updatedItems = currentItems.map((item) => {
      if (userRole === 'admin' || item.providerId === currentUserId) {
        return { ...item, status: newStatus };
      }
      return item;
    });

    let newGlobalStatus = "pending";
    const allStatuses = updatedItems.map(i => i.status || "pending");

    if (allStatuses.every(s => s === "cancelled")) {
        newGlobalStatus = "cancelled";
    } 
    else if (allStatuses.every(s => s === "completed")) {
        newGlobalStatus = "completed";
    } 
    else if (allStatuses.every(s => s === "ready" || s === "completed")) {
        newGlobalStatus = "ready";
    } 
    else if (allStatuses.every(s => s === "confirmed" || s === "ready" || s === "completed")) {
        newGlobalStatus = "confirmed";
    } 
    else {
        newGlobalStatus = newStatus;
    }

    const updateData = {
      items: updatedItems,
      services: updatedItems, 
      status: newGlobalStatus
    };

    if (reason) {
      updateData.cancellationReason = reason;
    }

    await updateDoc(bookingRef, updateData);

    return { 
      updatedItems, 
      newMainStatus: newGlobalStatus 
    };

  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
};