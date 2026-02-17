package com.ravenclient.screeninspector.ui

import android.app.Activity
import android.graphics.Color
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import com.ravenclient.screeninspector.UiInspectorManager
import com.ravenclient.screeninspector.output.JsonOutputBuilder
import com.ravenclient.screeninspector.route.RouteProviderFactory

/**
 * Draggable FAB overlay for UI Inspector functionality.
 * 
 * Features:
 * - Displays current route/screen name
 * - Capture button to trigger screen inspection
 * - Draggable across the screen
 * - Loading/success/error states for capture operations
 * 
 * This overlay is automatically managed by [InspectorFabManager] and should not
 * be instantiated directly. It's only created when `enableInspector` is true.
 */
class InspectorFabOverlay(
    private val activity: Activity
) {
    companion object {
        private const val TAG = "InspectorFabOverlay"
        private const val FAB_WIDTH_DP = 140
        private const val FAB_MARGIN_DP = 16
        private const val FAB_BOTTOM_MARGIN_DP = 80
        private const val BUTTON_RESET_DELAY_MS = 2000L
        private const val API_SIMULATION_DELAY_MS = 1500L
        
        // Raven brand colors from design system
        private const val COLOR_PRIMARY = "#1E293B" // Raven-inspired deep slate blue
        private const val COLOR_TEXT_PRIMARY = "#111827" // Text primary
        private const val COLOR_TEXT_SECONDARY = "#6B7280" // Text secondary
        private const val COLOR_DIVIDER = "#E5E7EB" // Divider
        private const val COLOR_SUCCESS = "#10B981" // Secondary/emerald green
        private const val COLOR_ERROR = "#EF4444" // Error red
    }
    
    private var overlayView: ViewGroup? = null
    private var fabContainer: FrameLayout? = null
    private var routeNameView: TextView? = null
    private var captureButton: FrameLayout? = null
    private var captureButtonText: TextView? = null
    private var captureButtonIcon: View? = null
    
    private val inspectorManager = UiInspectorManager(
        routeProvider = RouteProviderFactory.createReactNativeProvider()
    )
    
    private enum class ButtonState {
        IDLE,
        LOADING,
        SUCCESS,
        ERROR
    }
    
    private var buttonState = ButtonState.IDLE
    
    // Dragging state
    private var initialX = 0f
    private var initialY = 0f
    private var initialTouchX = 0f
    private var initialTouchY = 0f

    /**
     * Shows the overlay FAB
     */
    fun show() {
        if (overlayView != null) {
            return // Already shown
        }

        val rootView = activity.window.decorView.rootView as? ViewGroup
            ?: return

        // Create overlay container
        val overlay = FrameLayout(activity).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.TRANSPARENT)
            isClickable = false
            isFocusable = false
        }

        // Create draggable FAB container
        val fabContainer = createDraggableFab()
        overlay.addView(fabContainer)

        rootView.addView(overlay)
        overlayView = overlay
        this.fabContainer = fabContainer

        // Update route name initially
        updateRouteName()
        
        // Register for real-time route change updates
        registerRouteListener()
    }
    
    private val routeChangeListener = object : com.ravenclient.screeninspector.CurrentScreenTracker.RouteChangeListener {
        override fun onRouteChanged(routeName: String) {
            // Update FAB route name in real-time
            updateRouteNameDisplay(routeName)
        }
    }
    
    private fun registerRouteListener() {
        com.ravenclient.screeninspector.CurrentScreenTracker.addListener(routeChangeListener)
    }
    
    private fun unregisterRouteListener() {
        com.ravenclient.screeninspector.CurrentScreenTracker.removeListener(routeChangeListener)
    }

    /**
     * Hides the overlay
     */
    fun hide() {
        unregisterRouteListener()
        overlayView?.let { overlay ->
            val parent = overlay.parent as? ViewGroup
            parent?.removeView(overlay)
        }
        overlayView = null
        fabContainer = null
        routeNameView = null
        captureButton = null
    }

    /**
     * Creates a draggable FAB container with route name and capture button
     * Designed similar to Plotline's UI Inspector - clean and intuitive
     */
    private fun createDraggableFab(): FrameLayout {
        val container = FrameLayout(activity).apply {
            layoutParams = FrameLayout.LayoutParams(
                dpToPx(FAB_WIDTH_DP),
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.BOTTOM or Gravity.END
            ).apply {
                setMargins(
                    dpToPx(FAB_MARGIN_DP),
                    dpToPx(FAB_MARGIN_DP),
                    dpToPx(FAB_MARGIN_DP),
                    dpToPx(FAB_BOTTOM_MARGIN_DP)
                )
            }
            // Make entire container draggable
            setOnTouchListener { view, event ->
                handleTouch(view, event)
            }
        }

        val cardView = FrameLayout(activity).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT
            )
            setBackgroundColor(Color.WHITE)
            // Rounded corners (no elevation/shadow)
            background = createRoundedBackground()
        }

        // Content layout
        val contentLayout = LinearLayout(activity).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT
            )
            setPadding(dpToPx(12), dpToPx(12), dpToPx(12), dpToPx(12))
        }

        // Header with icon and title
        val headerLayout = LinearLayout(activity).apply {
            orientation = LinearLayout.HORIZONTAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                setMargins(0, 0, 0, dpToPx(8))
            }
            gravity = Gravity.CENTER_VERTICAL
        }

        // Raven icon - "R" letter in a circle
        val iconView = TextView(activity).apply {
            text = "R"
            textSize = 12f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            layoutParams = LinearLayout.LayoutParams(
                dpToPx(24),
                dpToPx(24)
            ).apply {
                setMargins(0, 0, dpToPx(8), 0)
            }
            background = createCircleBackground()
        }
        headerLayout.addView(iconView)

        // Title text
        val titleText = TextView(activity).apply {
            text = "Raven Inspector"
            textSize = 14f
            setTextColor(Color.parseColor(COLOR_TEXT_PRIMARY))
            setTypeface(null, android.graphics.Typeface.BOLD)
            layoutParams = LinearLayout.LayoutParams(
                0,
                LinearLayout.LayoutParams.WRAP_CONTENT,
                1f
            )
        }
        headerLayout.addView(titleText)
        contentLayout.addView(headerLayout)

        // Divider
        val divider = View(activity).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dpToPx(1)
            ).apply {
                setMargins(0, 0, 0, dpToPx(8))
            }
            setBackgroundColor(Color.parseColor(COLOR_DIVIDER))
        }
        contentLayout.addView(divider)

        // Route name display (compact, no "Route:" prefix, center aligned)
        routeNameView = TextView(activity).apply {
            text = "Unknown"
            textSize = 11f
            setTextColor(Color.parseColor(COLOR_TEXT_SECONDARY))
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, dpToPx(10))
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }
        contentLayout.addView(routeNameView)

        // Capture button (modern design, no shadow)
        captureButton = FrameLayout(activity).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dpToPx(36)
            )
            setBackgroundColor(Color.parseColor(COLOR_PRIMARY))
            background = createRoundedButtonBackground()
            isClickable = true
            isFocusable = true

            setOnClickListener {
                if (buttonState == ButtonState.IDLE) {
                    onCaptureClicked()
                }
            }
        }

        // Button text
        captureButtonText = TextView(activity).apply {
            text = "Capture Screen"
            textSize = 12f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        }
        captureButton?.addView(captureButtonText)
        
        // Icon container will be added dynamically based on button state
        
        contentLayout.addView(captureButton)

        cardView.addView(contentLayout)
        container.addView(cardView)
        return container
    }

    /**
     * Creates a rounded rectangle drawable for card background
     */
    private fun createRoundedBackground(): android.graphics.drawable.Drawable {
        val drawable = android.graphics.drawable.GradientDrawable()
        drawable.setColor(Color.WHITE)
        drawable.cornerRadius = dpToPx(12).toFloat()
        return drawable
    }

    /**
     * Creates a rounded rectangle drawable for button background
     */
    private fun createRoundedButtonBackground(): android.graphics.drawable.Drawable {
        val drawable = android.graphics.drawable.GradientDrawable()
        drawable.setColor(Color.parseColor(COLOR_PRIMARY))
        drawable.cornerRadius = dpToPx(8).toFloat()
        return drawable
    }

    /**
     * Creates a circle drawable for icon
     */
    private fun createCircleBackground(): android.graphics.drawable.Drawable {
        val drawable = android.graphics.drawable.GradientDrawable()
        drawable.setColor(Color.parseColor(COLOR_PRIMARY))
        drawable.shape = android.graphics.drawable.GradientDrawable.OVAL
        return drawable
    }

    /**
     * Handles touch events for dragging
     */
    private fun handleTouch(view: View, event: MotionEvent): Boolean {
        // Check if touch is on the capture button (only on ACTION_DOWN)
        if (event.action == MotionEvent.ACTION_DOWN) {
            captureButton?.let { button ->
                val location = IntArray(2)
                button.getLocationOnScreen(location)
                val buttonLeft = location[0]
                val buttonTop = location[1]
                val buttonRight = buttonLeft + button.width
                val buttonBottom = buttonTop + button.height
                
                val touchX = event.rawX.toInt()
                val touchY = event.rawY.toInt()
                
                if (touchX >= buttonLeft && touchX <= buttonRight &&
                    touchY >= buttonTop && touchY <= buttonBottom) {
                    // Touch is on button, let button handle it
                    return false
                }
            }
        }
        
        // Touch is not on button, handle dragging
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                initialX = view.x
                initialY = view.y
                initialTouchX = event.rawX
                initialTouchY = event.rawY
                return true
            }
            MotionEvent.ACTION_MOVE -> {
                val deltaX = event.rawX - initialTouchX
                val deltaY = event.rawY - initialTouchY
                
                var newX = initialX + deltaX
                var newY = initialY + deltaY
                
                // Constrain to screen bounds
                val parent = view.parent as? ViewGroup ?: return false
                val maxX = parent.width - view.width
                val maxY = parent.height - view.height
                
                newX = newX.coerceIn(0f, maxX.toFloat())
                newY = newY.coerceIn(0f, maxY.toFloat())
                
                view.x = newX
                view.y = newY
                return true
            }
            MotionEvent.ACTION_UP -> {
                return true
            }
        }
        return false
    }

    /**
     * Handles capture button click - triggers screen inspection
     */
    private fun onCaptureClicked() {
        // Set loading state
        setButtonState(ButtonState.LOADING)
        
        // Hide FAB overlay during inspection to exclude it from capture
        overlayView?.visibility = View.GONE
        
        inspectorManager.inspectScreen(activity) { result ->
            // Show FAB overlay again after inspection completes
            overlayView?.visibility = View.VISIBLE
            
            if (result != null) {
                // Log to console
                val json = JsonOutputBuilder.toJsonString(result)
                android.util.Log.d("InspectorFab", "Screen inspection result:")
                android.util.Log.d("InspectorFab", "Screen: ${result.screenName}")
                android.util.Log.d("InspectorFab", "Elements: ${result.elements.size}")
                android.util.Log.d("InspectorFab", "JSON: $json")

                // Update route name
                routeNameView?.text = result.screenName
                routeNameView?.setTextColor(Color.parseColor(COLOR_SUCCESS)) // Green for success
                
                // TODO: Call your API here to send data to backend
                // For now, simulate API call
                sendDataToBackend(json, result) { success ->
                    if (success) {
                        setButtonState(ButtonState.SUCCESS)
                        activity.window.decorView.postDelayed({
                            setButtonState(ButtonState.IDLE)
                            updateRouteName()
                        }, BUTTON_RESET_DELAY_MS)
                    } else {
                        setButtonState(ButtonState.ERROR)
                        activity.window.decorView.postDelayed({
                            setButtonState(ButtonState.IDLE)
                            updateRouteName()
                        }, BUTTON_RESET_DELAY_MS)
                    }
                }
            } else {
                android.util.Log.e("InspectorFab", "Failed to inspect screen")
                routeNameView?.text = "Error"
                routeNameView?.setTextColor(Color.parseColor(COLOR_ERROR)) // Red for error
                setButtonState(ButtonState.ERROR)
                
                // Reset after delay
                activity.window.decorView.postDelayed({
                    setButtonState(ButtonState.IDLE)
                    updateRouteName()
                }, BUTTON_RESET_DELAY_MS)
            }
        }
    }
    
    /**
     * Sends captured data to backend API
     * Replace this with your actual API call
     */
    private fun sendDataToBackend(
        json: String,
        result: com.ravenclient.screeninspector.models.ScreenInspectionResult,
        callback: (Boolean) -> Unit
    ) {
        // TODO: Implement your API call here
        // Example:
        // apiService.sendInspectionData(result).enqueue(object : Callback<Response> {
        //     override fun onResponse(call: Call<Response>, response: Response<ResponseBody>) {
        //         callback(response.isSuccessful)
        //     }
        //     override fun onFailure(call: Call<Response>, t: Throwable) {
        //         callback(false)
        //     }
        // })
        
        // TODO: Replace with actual API call
        activity.window.decorView.postDelayed({
            callback(true) // Simulate success
        }, API_SIMULATION_DELAY_MS)
    }
    
    /**
     * Sets the button state and updates UI accordingly
     */
    private fun setButtonState(state: ButtonState) {
        buttonState = state
        captureButton?.isEnabled = (state == ButtonState.IDLE)
        captureButton?.isClickable = (state == ButtonState.IDLE)
        captureButton?.alpha = if (state == ButtonState.IDLE) 1.0f else 0.9f
        
        // Remove existing icon if any
        captureButtonIcon?.let { icon ->
            captureButton?.removeView(icon)
        }
        captureButtonIcon = null
        
        when (state) {
            ButtonState.IDLE -> {
                captureButtonText?.text = "Capture Screen"
                captureButtonText?.visibility = View.VISIBLE
                captureButton?.setBackgroundColor(Color.parseColor(COLOR_PRIMARY))
            }
            ButtonState.LOADING -> {
                // Hide text and show loading spinner in its place
                captureButtonText?.visibility = View.GONE
                val loadingView = createLoadingIndicator()
                captureButtonIcon = loadingView
                captureButton?.addView(loadingView)
                captureButton?.setBackgroundColor(Color.parseColor(COLOR_PRIMARY))
            }
            ButtonState.SUCCESS -> {
                // Hide text and show only success icon
                captureButtonText?.visibility = View.GONE
                val successView = createSuccessIndicator()
                captureButtonIcon = successView
                captureButton?.addView(successView)
                captureButton?.setBackgroundColor(Color.parseColor(COLOR_SUCCESS)) // Green
            }
            ButtonState.ERROR -> {
                // Hide text and show only error icon
                captureButtonText?.visibility = View.GONE
                val errorView = createErrorIndicator()
                captureButtonIcon = errorView
                captureButton?.addView(errorView)
                captureButton?.setBackgroundColor(Color.parseColor(COLOR_ERROR)) // Red
            }
        }
        
        // Update background drawable
        captureButton?.background = createRoundedButtonBackground()
    }
    
    /**
     * Creates a loading spinner indicator using ProgressBar
     */
    private fun createLoadingIndicator(): View {
        val progressBar = android.widget.ProgressBar(activity, null, android.R.attr.progressBarStyleSmall).apply {
            layoutParams = FrameLayout.LayoutParams(
                dpToPx(16),
                dpToPx(16),
                Gravity.CENTER
            )
            indeterminateTintList = android.content.res.ColorStateList.valueOf(Color.WHITE)
        }
        return progressBar
    }
    
    /**
     * Creates a success tick mark indicator
     */
    private fun createSuccessIndicator(): View {
        val textView = TextView(activity).apply {
            text = "✓"
            textSize = 14f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
            layoutParams = FrameLayout.LayoutParams(
                dpToPx(16),
                dpToPx(16),
                Gravity.CENTER
            )
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        return textView
    }
    
    /**
     * Creates an error indicator with exclamation mark
     */
    private fun createErrorIndicator(): View {
        val textView = TextView(activity).apply {
            text = "!"
            textSize = 18f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
            layoutParams = FrameLayout.LayoutParams(
                dpToPx(20),
                dpToPx(20),
                Gravity.CENTER
            )
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        return textView
    }

    /**
     * Updates the route name display (called initially)
     */
    private fun updateRouteName() {
        val routeName = com.ravenclient.screeninspector.CurrentScreenTracker.currentRouteName
        updateRouteNameDisplay(routeName)
    }
    
    /**
     * Updates the route name display (called from listener in real-time)
     */
    private fun updateRouteNameDisplay(routeName: String) {
        val displayText = if (routeName.isNotEmpty() && routeName != "Unknown") {
            routeName
        } else {
            "Unknown"
        }
        routeNameView?.text = displayText
        routeNameView?.setTextColor(Color.parseColor(COLOR_TEXT_SECONDARY)) // Reset to default gray
    }

    /**
     * Converts dp to pixels
     */
    private fun dpToPx(dp: Int): Int {
        val density = activity.resources.displayMetrics.density
        return (dp * density + 0.5f).toInt()
    }

    /**
     * Cleanup
     */
    fun destroy() {
        unregisterRouteListener()
        hide()
        inspectorManager.shutdown()
    }
}

