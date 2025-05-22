// src/utils/adminFunctions.js
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/firebase";

export const runRecalculation = async () => {
  const functions = getFunctions(app);
  const recalc = httpsCallable(functions, "recalculateFollowCountsSecure");

  try {
    const result = await recalc();
    console.log("✅", result.data.message);
    alert("Contadores actualizados correctamente.");
  } catch (error) {
    console.error("❌ Error:", error.message);
    alert("Error: " + error.message);
  }
};
