package com.networksecurity

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule

@ReactModule(name = NetworkSecurityModule.NAME)
class NetworkSecurityModule(reactContext: ReactApplicationContext) :
  NativeNetworkSecuritySpec(reactContext) {

  private var lastVPNState: Boolean? = null
  private val connectivityManager: ConnectivityManager? =
    reactContext.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager

  private val networkCallback = object : ConnectivityManager.NetworkCallback() {
    override fun onCapabilitiesChanged(network: Network, networkCapabilities: NetworkCapabilities) {
      super.onCapabilitiesChanged(network, networkCapabilities)
      checkAndEmitVPNStatus()
    }

    override fun onLost(network: Network) {
      super.onLost(network)
      checkAndEmitVPNStatus()
    }
  }

  init {
    // Register network callback for real-time VPN detection
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        connectivityManager?.registerDefaultNetworkCallback(networkCallback)
      }
    } catch (e: Exception) {
      // Ignore registration errors
    }
  }

  override fun getName(): String {
    return NAME
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  override fun isVPNActive(promise: Promise) {
    try {
      val isVPN = checkVPNConnection()
      promise.resolve(isVPN)
    } catch (e: Exception) {
      promise.reject("VPN_CHECK_ERROR", "Failed to check VPN status: ${e.message}", e)
    }
  }

  override fun addListener(eventName: String) {
    // Required for EventEmitter support - no-op
  }

  override fun removeListeners(count: Double) {
    // Required for EventEmitter support - no-op
  }

  private fun checkVPNConnection(): Boolean {
    val cm = connectivityManager ?: return false

    return try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        val activeNetwork = cm.activeNetwork ?: return false
        val capabilities = cm.getNetworkCapabilities(activeNetwork) ?: return false
        capabilities.hasTransport(NetworkCapabilities.TRANSPORT_VPN)
      } else {
        // For older Android versions, check all networks
        @Suppress("DEPRECATION")
        val networks = cm.allNetworks
        networks.any { network ->
          val capabilities = cm.getNetworkCapabilities(network)
          capabilities?.hasTransport(NetworkCapabilities.TRANSPORT_VPN) ?: false
        }
      }
    } catch (e: Exception) {
      false
    }
  }

  private fun checkAndEmitVPNStatus() {
    try {
      val isVPN = checkVPNConnection()
      
      // Only emit if state changed to avoid duplicate events
      if (lastVPNState != isVPN) {
        lastVPNState = isVPN
        sendEvent("vpnStatusChanged", isVPN)
      }
    } catch (e: Exception) {
      // Ignore errors during background checks
    }
  }

  private fun sendEvent(eventName: String, isVPN: Boolean) {
    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      ?.emit(eventName, isVPN)
  }

  override fun onCatalystInstanceDestroy() {
    super.onCatalystInstanceDestroy()
    try {
      connectivityManager?.unregisterNetworkCallback(networkCallback)
    } catch (e: Exception) {
      // Ignore unregistration errors
    }
  }

  companion object {
    const val NAME = "NetworkSecurity"
  }
}
