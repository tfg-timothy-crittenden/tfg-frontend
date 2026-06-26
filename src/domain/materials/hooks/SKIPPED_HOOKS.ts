/**
 * HOOKS NOT IMPLEMENTED — REASONING
 * ───────────────────────────────────
 *
 * getQuestion (materialId, partNumber, questionNumber)
 * ─────────────────────────────────────────────────────
 * Not wrapped in a hook yet. This endpoint fetches a single MaterialNode for
 * question playback during a test session. The question data is already
 * embedded in the SpeakingSectionEdit returned by useSpeakingSectionForEdit,
 * so adding a parallel hook would risk stale / conflicting data.
 *
 * Add a hook here once the test-taking UI is being built and the consumption
 * context is clear (e.g. whether it needs independent caching, prefetching
 * per question, or is simply called imperatively during playback).
 *
 * getMaterialNodeAssets (nodeId)
 * ─────────────────────────────────────────────────────
 * Not wrapped in a hook yet. Asset arrays are already nested inside the
 * MaterialNode returned by getQuestion. A standalone hook would only be
 * useful if assets need to be fetched independently (e.g. an asset panel
 * that loads lazily). Add one if that UI requirement arises.
 *
 * generatePresignedUrl (bucket, objectKey)
 * ─────────────────────────────────────────────────────
 * Intentionally never gets a hook. Presigned URLs are:
 *   1. Ephemeral — they expire and must not be cached across renders.
 *   2. Request-specific — each upload/playback generates a unique URL.
 * Call generatePresignedUrl() directly from mutation handlers or
 * upload utilities, not via React Query.
 */
