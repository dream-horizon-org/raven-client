package com.ravenclient.screeninspector.route

/**
 * Abstraction for detecting the current route/screen name.
 * Allows pluggable implementations for React Native, pure native Android, etc.
 */
interface RouteProvider {
    /**
     * Gets the current route/screen name.
     * @return The route name, or "Unknown" if detection fails
     */
    fun getCurrentRouteName(): String
}

