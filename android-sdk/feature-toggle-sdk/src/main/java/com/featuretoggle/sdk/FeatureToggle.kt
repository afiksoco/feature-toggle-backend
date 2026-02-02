package com.featuretoggle.sdk

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.*
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.concurrent.TimeUnit

/**
 * Feature Toggle SDK for Android
 *
 * Usage:
 * ```kotlin
 * // Initialize once in Application.onCreate()
 * FeatureToggle.initialize(
 *     context = this,
 *     config = FeatureToggleConfig(
 *         appId = "com.example.myapp",
 *         apiUrl = "https://api-jade-two-62.vercel.app"
 *     )
 * )
 *
 * // Set user ID (after user logs in)
 * FeatureToggle.setUserId("user123")
 *
 * // Check if feature is enabled
 * if (FeatureToggle.isEnabled("dark_mode")) {
 *     enableDarkMode()
 * }
 * ```
 */
object FeatureToggle {

    private const val TAG = "FeatureToggle"
    private const val PREFS_NAME = "feature_toggle_prefs"
    private const val KEY_FEATURES = "cached_features"
    private const val KEY_USER_ID = "user_id"

    private var config: FeatureToggleConfig? = null
    private var userId: String? = null
    private var features: Map<String, Boolean> = emptyMap()
    private var isInitialized = false

    private val gson = Gson()
    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    private var prefs: SharedPreferences? = null
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    private var listener: FeatureToggleListener? = null

    /**
     * Initialize the SDK. Call this once in Application.onCreate()
     */
    fun initialize(context: Context, config: FeatureToggleConfig) {
        this.config = config
        this.prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        // Load cached features
        loadCachedFeatures()

        // Load cached user ID
        userId = prefs?.getString(KEY_USER_ID, null)

        isInitialized = true
        Log.d(TAG, "Initialized with appId: ${config.appId}")

        // If we have a cached user ID, refresh features
        userId?.let { refreshFeatures() }
    }

    /**
     * Set the current user ID. This triggers a feature refresh.
     */
    fun setUserId(userId: String) {
        this.userId = userId
        prefs?.edit()?.putString(KEY_USER_ID, userId)?.apply()
        refreshFeatures()
    }

    /**
     * Clear the current user (e.g., on logout)
     */
    fun clearUser() {
        userId = null
        features = emptyMap()
        prefs?.edit()?.remove(KEY_USER_ID)?.remove(KEY_FEATURES)?.apply()
    }

    /**
     * Check if a feature is enabled for the current user
     */
    fun isEnabled(featureKey: String): Boolean {
        if (!isInitialized) {
            Log.w(TAG, "SDK not initialized! Call FeatureToggle.initialize() first.")
            return false
        }
        return features[featureKey] ?: false
    }

    /**
     * Check if a feature is enabled with a default value
     */
    fun isEnabled(featureKey: String, defaultValue: Boolean): Boolean {
        if (!isInitialized) {
            Log.w(TAG, "SDK not initialized! Call FeatureToggle.initialize() first.")
            return defaultValue
        }
        return features[featureKey] ?: defaultValue
    }

    /**
     * Get all feature flags
     */
    fun getAllFeatures(): Map<String, Boolean> {
        return features.toMap()
    }

    /**
     * Set a listener for feature updates
     */
    fun setListener(listener: FeatureToggleListener?) {
        this.listener = listener
    }

    /**
     * Manually refresh features from the server
     */
    fun refreshFeatures() {
        val currentConfig = config ?: run {
            Log.w(TAG, "Cannot refresh: SDK not initialized")
            return
        }
        val currentUserId = userId ?: run {
            Log.w(TAG, "Cannot refresh: No user ID set")
            return
        }

        scope.launch {
            try {
                val newFeatures = fetchFeatures(currentConfig, currentUserId)
                features = newFeatures
                saveCachedFeatures(newFeatures)

                withContext(Dispatchers.Main) {
                    listener?.onFeaturesUpdated(newFeatures)
                }

                Log.d(TAG, "Features refreshed: $newFeatures")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to refresh features", e)
                withContext(Dispatchers.Main) {
                    listener?.onError(e)
                }
            }
        }
    }

    /**
     * Synchronously fetch features (blocking call - use from background thread)
     */
    @Throws(IOException::class)
    fun refreshFeaturesSync() {
        val currentConfig = config ?: throw IllegalStateException("SDK not initialized")
        val currentUserId = userId ?: throw IllegalStateException("No user ID set")

        val newFeatures = fetchFeatures(currentConfig, currentUserId)
        features = newFeatures
        saveCachedFeatures(newFeatures)
    }

    private fun fetchFeatures(config: FeatureToggleConfig, userId: String): Map<String, Boolean> {
        val requestBody = EvaluateRequest(
            app_id = config.appId,
            user_id = userId,
            feature_keys = null
        )

        val json = gson.toJson(requestBody)
        val body = json.toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url("${config.apiUrl}/api/sdk/evaluate")
            .post(body)
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IOException("API error: ${response.code}")
            }

            val responseBody = response.body?.string()
                ?: throw IOException("Empty response body")

            val evaluateResponse = gson.fromJson(responseBody, EvaluateResponse::class.java)
            return evaluateResponse.features
        }
    }

    private fun loadCachedFeatures() {
        val cached = prefs?.getString(KEY_FEATURES, null) ?: return
        try {
            val type = object : TypeToken<Map<String, Boolean>>() {}.type
            features = gson.fromJson(cached, type) ?: emptyMap()
            Log.d(TAG, "Loaded cached features: $features")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to load cached features", e)
        }
    }

    private fun saveCachedFeatures(features: Map<String, Boolean>) {
        val json = gson.toJson(features)
        prefs?.edit()?.putString(KEY_FEATURES, json)?.apply()
    }
}

/**
 * Configuration for the Feature Toggle SDK
 */
data class FeatureToggleConfig(
    val appId: String,
    val apiUrl: String
)

/**
 * Listener for feature updates
 */
interface FeatureToggleListener {
    fun onFeaturesUpdated(features: Map<String, Boolean>)
    fun onError(error: Exception)
}

// Internal data classes for API communication
internal data class EvaluateRequest(
    val app_id: String,
    val user_id: String,
    val feature_keys: List<String>?
)

internal data class EvaluateResponse(
    val features: Map<String, Boolean>
)
