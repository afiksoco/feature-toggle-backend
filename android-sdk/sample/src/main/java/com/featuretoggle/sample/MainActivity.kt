package com.featuretoggle.sample

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.featuretoggle.sdk.FeatureToggle
import com.featuretoggle.sdk.FeatureToggleListener

class MainActivity : AppCompatActivity(), FeatureToggleListener {

    private lateinit var userIdInput: EditText
    private lateinit var loginButton: Button
    private lateinit var refreshButton: Button
    private lateinit var featuresText: TextView
    private lateinit var darkModeStatus: TextView
    private lateinit var newCheckoutStatus: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        userIdInput = findViewById(R.id.userIdInput)
        loginButton = findViewById(R.id.loginButton)
        refreshButton = findViewById(R.id.refreshButton)
        featuresText = findViewById(R.id.featuresText)
        darkModeStatus = findViewById(R.id.darkModeStatus)
        newCheckoutStatus = findViewById(R.id.newCheckoutStatus)

        // Set up listener for feature updates
        FeatureToggle.setListener(this)

        loginButton.setOnClickListener {
            val userId = userIdInput.text.toString().trim()
            if (userId.isNotEmpty()) {
                // Set user ID - this triggers feature fetch
                FeatureToggle.setUserId(userId)
                Toast.makeText(this, "Logged in as: $userId", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, "Please enter a user ID", Toast.LENGTH_SHORT).show()
            }
        }

        refreshButton.setOnClickListener {
            FeatureToggle.refreshFeatures()
            Toast.makeText(this, "Refreshing features...", Toast.LENGTH_SHORT).show()
        }

        // Update UI with current features
        updateFeatureUI()
    }

    override fun onFeaturesUpdated(features: Map<String, Boolean>) {
        // Called when features are refreshed from server
        updateFeatureUI()
        Toast.makeText(this, "Features updated!", Toast.LENGTH_SHORT).show()
    }

    override fun onError(error: Exception) {
        Toast.makeText(this, "Error: ${error.message}", Toast.LENGTH_LONG).show()
    }

    private fun updateFeatureUI() {
        // Get all features
        val allFeatures = FeatureToggle.getAllFeatures()
        featuresText.text = if (allFeatures.isEmpty()) {
            "No features loaded. Login to fetch features."
        } else {
            allFeatures.entries.joinToString("\n") { "${it.key}: ${it.value}" }
        }

        // Check specific features
        val darkModeEnabled = FeatureToggle.isEnabled("dark_mode")
        val newCheckoutEnabled = FeatureToggle.isEnabled("new_checkout")

        darkModeStatus.text = "Dark Mode: ${if (darkModeEnabled) "ENABLED" else "DISABLED"}"
        darkModeStatus.setTextColor(
            if (darkModeEnabled) 0xFF4CAF50.toInt() else 0xFFF44336.toInt()
        )

        newCheckoutStatus.text = "New Checkout: ${if (newCheckoutEnabled) "ENABLED" else "DISABLED"}"
        newCheckoutStatus.setTextColor(
            if (newCheckoutEnabled) 0xFF4CAF50.toInt() else 0xFFF44336.toInt()
        )

        // Example: Apply dark mode if enabled
        if (darkModeEnabled) {
            // In a real app, you would apply dark theme here
            // AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        FeatureToggle.setListener(null)
    }
}
