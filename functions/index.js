const {
  onDocumentCreated,
  onDocumentDeleted,
} = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { onCall } = require("firebase-functions/v2/https");

initializeApp();
const db = getFirestore();

// FOLLOW creado
exports.onFollowCreate = onDocumentCreated(
  "users/{sourceUid}/following/{targetUid}",
  async (event) => {
    const { sourceUid, targetUid } = event.params;

    const batch = db.batch();

    // Crear espejo: followers
    batch.set(db.doc(`users/${targetUid}/followers/${sourceUid}`), {
      sourceUid,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Incrementar contadores
    batch.set(
      db.doc(`users/${sourceUid}`),
      {
        followingCount: FieldValue.increment(1),
      },
      { merge: true }
    );

    batch.set(
      db.doc(`users/${targetUid}`),
      {
        followersCount: FieldValue.increment(1),
      },
      { merge: true }
    );

    await batch.commit();
  }
);

// FOLLOW eliminado
exports.onFollowDelete = onDocumentDeleted(
  "users/{sourceUid}/following/{targetUid}",
  async (event) => {
    const { sourceUid, targetUid } = event.params;

    const batch = db.batch();

    // 1. Borrar espejo en followers
    batch.delete(db.doc(`users/${targetUid}/followers/${sourceUid}`));

    // 2. Actualizar contadores con merge
    batch.set(
      db.doc(`users/${sourceUid}`),
      {
        followingCount: FieldValue.increment(-1),
      },
      { merge: true }
    );

    batch.set(
      db.doc(`users/${targetUid}`),
      {
        followersCount: FieldValue.increment(-1),
      },
      { merge: true }
    );

    await batch.commit();
  }
);

// Función protegida que solo un admin puede ejecutar desde la app
exports.recalculateFollowCountsSecure = onCall(async (request) => {
  const auth = request.auth;

  if (!auth) {
    throw new Error("Not authenticated.");
  }

  const uid = auth.uid;

  const userSnap = await db.doc(`users/${uid}`).get();
  const userData = userSnap.data();

  if (!userData || userData.role !== "admin") {
    throw new Error("Access denied. Admins only.");
  }

  const usersSnap = await db.collection("users").get();
  const updates = [];

  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;

    const followersSnap = await db
      .collection(`users/${userId}/followers`)
      .get();
    const followingSnap = await db
      .collection(`users/${userId}/following`)
      .get();

    const newFollowersCount = followersSnap.size;
    const newFollowingCount = followingSnap.size;

    updates.push(
      db.doc(`users/${userId}`).update({
        followersCount: newFollowersCount,
        followingCount: newFollowingCount,
      })
    );
  }

  await Promise.all(updates);

  return {
    status: "ok",
    message: "Contadores actualizados correctamente",
  };
});
