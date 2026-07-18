import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useLiveUpdates() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Listen to the live_update document
    const docRef = doc(db, "system", "live_update");
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        // Data changed, invalidate queries to fetch fresh data
        console.log("Live update detected, refreshing data...");
        queryClient.invalidateQueries();
      }
    }, (error) => {
      console.error("Live update listener error:", error);
    });

    return () => unsubscribe();
  }, [queryClient]);
}
