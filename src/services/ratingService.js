import { db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';

/**
 * دالة لحساب متوسط التقييمات لخدمة واحدة
 * @param {string} serviceId 
 * @param {function} callback 
 * @returns {function} 
 */
export const subscribeToAverageRating = (serviceId, callback) => {
   
    const ratingsRef = collection(db, "ratings");
    const q = query(ratingsRef, where("serviceId", "==", serviceId));

  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        let totalRating = 0;
        let count = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.rating && typeof data.rating === 'number') {
                totalRating += data.rating; 
                count += 1;
            }
        });

        const average = count > 0 ? (totalRating / count) : 0;
        
       
        callback({
            average: parseFloat(average.toFixed(1)), 
            count: count
        });
    });

    return unsubscribe;
};