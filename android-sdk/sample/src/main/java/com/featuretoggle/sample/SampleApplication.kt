package com.featuretoggle.sample

import android.app.Application
import com.featuretoggle.sdk.FeatureToggle
import com.featuretoggle.sdk.FeatureToggleConfig

class SampleApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        // Initialize the Feature Toggle SDK
        FeatureToggle.initialize(
            context = this,
            config = FeatureToggleConfig(
                appId = "com.example.shopping",  // Your app ID from the admin portal
                apiUrl = "https://api-jade-two-62.vercel.app"  // Your API URL
            )
        )
    }
}
