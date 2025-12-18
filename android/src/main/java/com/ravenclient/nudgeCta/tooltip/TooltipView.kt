package com.ravenclient.nudgeCta.tooltip

import android.content.Context
import android.graphics.*
import android.util.TypedValue
import android.view.Gravity
import android.view.ViewGroup.LayoutParams.WRAP_CONTENT
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import android.annotation.SuppressLint
import android.graphics.Typeface
import androidx.core.content.res.ResourcesCompat
import kotlin.math.roundToInt

enum class TooltipPosition {
    TOP, BOTTOM, LEFT, RIGHT
}

class TooltipView(context: Context) : FrameLayout(context) {
    private var title: String = ""
    private var subTitle: String? = null
    private var targetFrame: Rect = Rect()
    private var position: TooltipPosition = TooltipPosition.TOP

    private var backgroundColor: Int = Color.BLACK
    private var titleColor: Int = Color.WHITE
    private var subTitleColor: Int = Color.LTGRAY
    private var cornerRadius: Float = 0f
    private var arrowSize: Float = dpToPx(8f)
    private var arrowCenter: Float = 0f

    private var titleAlignment: String = "left"
    private var subTitleAlignment: String = "left"

    private var paddingTop: Float = dpToPx(4f)
    private var paddingBottom: Float = dpToPx(4f)
    private var paddingStart: Float = dpToPx(8f)
    private var paddingEnd: Float = dpToPx(8f)

    private var marginTop: Float = 0f
    private var marginBottom: Float = 0f
    private var marginStart: Float = 0f
    private var marginEnd: Float = 0f

    private var titleFontFamily: String? = null
    private var titleFontWeight: String? = null
    private var subTitleFontFamily: String? = null
    private var subTitleFontWeight: String? = null

    private val container = LinearLayout(context).apply {
        orientation = LinearLayout.VERTICAL
        layoutParams = LayoutParams(WRAP_CONTENT, WRAP_CONTENT)
    }

    @SuppressLint("CustomDeprecatedView")
    private val titleView = TextView(context).apply {
        layoutParams = LayoutParams(WRAP_CONTENT, WRAP_CONTENT)
        textSize = 14f
        setTextColor(titleColor)
    }

    @SuppressLint("CustomDeprecatedView")
    private val subTitleView = TextView(context).apply {
        layoutParams = LayoutParams(WRAP_CONTENT, WRAP_CONTENT)
        textSize = 12f
        setTextColor(subTitleColor)
        visibility = GONE
    }

    init {
        layoutParams = LayoutParams(WRAP_CONTENT, WRAP_CONTENT)
        setWillNotDraw(false)
        z = 1000f
        translationZ = 1000f

        container.addView(titleView)
        container.addView(subTitleView)
        addView(container)

        setPaddingInside(paddingTop, paddingBottom, paddingStart, paddingEnd)
    }

    fun setTitle(title: String) {
        this.title = title
        titleView.text = title
        requestLayout()
    }

    fun setSubTitle(subTitle: String?) {
        this.subTitle = subTitle
        if (subTitle.isNullOrEmpty()) {
            subTitleView.visibility = GONE
        } else {
            subTitleView.visibility = VISIBLE
            subTitleView.text = subTitle
        }
        requestLayout()
    }

    fun setPosition(position: TooltipPosition) {
        this.position = position
        requestLayout()
    }

    fun setColors(bgColor: Int, titleColor: Int, subTitleColor: Int) {
        this.backgroundColor = bgColor
        this.titleColor = titleColor
        this.subTitleColor = subTitleColor
        titleView.setTextColor(titleColor)
        subTitleView.setTextColor(subTitleColor)
        invalidate()
    }

    fun setCornerRadius(radius: Float) {
        this.cornerRadius = dpToPx(radius)
        invalidate()
    }

    fun setTitleFontSize(size: Float) {
        titleView.setTextSize(TypedValue.COMPLEX_UNIT_SP, size)
        requestLayout()
    }

    fun setSubTitleFontSize(size: Float) {
        subTitleView.setTextSize(TypedValue.COMPLEX_UNIT_SP, size)
        requestLayout()
    }

    fun setTitleFontFamily(family: String?) {
        titleFontFamily = family
        applyTitleFont()
    }

    fun setSubTitleFontFamily(family: String?) {
        subTitleFontFamily = family
        applySubTitleFont()
    }

    fun setTitleFontWeight(weight: String?) {
        titleFontWeight = weight
        applyTitleFont()
    }

    fun setSubTitleFontWeight(weight: String?) {
        subTitleFontWeight = weight
        applySubTitleFont()
    }

    private fun applyTitleFont() {
        applyFontFamily(titleView, titleFontFamily, titleFontWeight)
        requestLayout()
    }

    private fun applySubTitleFont() {
        applyFontFamily(subTitleView, subTitleFontFamily, subTitleFontWeight)
        requestLayout()
    }

    private fun applyFontFamily(target: TextView, family: String?, weight: String?) {
        val typefaceStyle = when (weight?.uppercase()) {
            "BOLD" -> Typeface.BOLD
            "MEDIUM" -> Typeface.NORMAL // Medium is typically NORMAL with a specific font family
            "REGULAR" -> Typeface.NORMAL
            else -> Typeface.NORMAL
        }

        if (!family.isNullOrEmpty()) {
            val trimmed = family.trim()

            // Try loading from assets/fonts/ directory first
            val fontFileNames = buildFontFileNames(trimmed, weight)
            for (fontFileName in fontFileNames) {
                try {
                    val assets = context.assets
                    if (assets != null) {
                        val typeface = Typeface.createFromAsset(assets, fontFileName)
                        if (typeface != null) {
                            val styledTypeface = Typeface.create(typeface, typefaceStyle)
                            if (styledTypeface != null) {
                                target.typeface = styledTypeface
                                return
                            }
                        }
                    }
                } catch (_: Exception) {
                    // Try next variation
                }
            }

            // Try loading from res/font resources
            val resName = trimmed.lowercase().replace('-', '_')
            val resId = context.resources.getIdentifier(resName, "font", context.packageName)
            if (resId != 0) {
                try {
                    ResourcesCompat.getFont(context, resId)?.let { tf ->
                        val styledTypeface = Typeface.create(tf, typefaceStyle)
                        if (styledTypeface != null) {
                            target.typeface = styledTypeface
                            return
                        }
                    }
                } catch (_: Exception) {
                }
            }

            // Fallback to system font
            try {
                val baseTypeface = Typeface.create(trimmed, Typeface.NORMAL)
                if (baseTypeface != null) {
                    val styledTypeface = Typeface.create(baseTypeface, typefaceStyle)
                    if (styledTypeface != null) {
                        target.typeface = styledTypeface
                        return
                    }
                }
            } catch (_: Exception) {}
        } else if (weight != null) {
            try {
                val currentTypeface = target.typeface ?: Typeface.DEFAULT
                val styledTypeface = Typeface.create(currentTypeface, typefaceStyle)
                if (styledTypeface != null) {
                    target.typeface = styledTypeface
                }
            } catch (_: Exception) {}
        }
    }

    private fun buildFontFileNames(family: String, weight: String?): List<String> {
        val familyName = family.replace(" ", "-")
        val weightSuffix = when (weight?.uppercase()) {
            "BOLD" -> "Bold"
            "MEDIUM" -> "Medium"
            "SEMIBOLD", "SEMI_BOLD" -> "SemiBold"
            "REGULAR" -> "Regular"
            else -> "Regular"
        }

        // Handle Inter -> Inter24pt mapping
        val actualFamilyName = if (familyName.equals("Inter", ignoreCase = true)) {
            "Inter24pt"
        } else {
            familyName
        }

        val fileNames = mutableListOf<String>()

        // Try exact match: fonts/Roboto-Bold.ttf or fonts/Inter24pt-Bold.ttf
        fileNames.add("fonts/$actualFamilyName-$weightSuffix.ttf")

        // Try lowercase: fonts/roboto-bold.ttf or fonts/inter24pt-bold.ttf
        fileNames.add("fonts/${actualFamilyName.lowercase()}-${weightSuffix.lowercase()}.ttf")

        // If family already contains weight (e.g., "Roboto-Bold"), try that
        if (family.contains("-")) {
            fileNames.add("fonts/$actualFamilyName.ttf")
            fileNames.add("fonts/${actualFamilyName.lowercase()}.ttf")
        }

        // Try without weight suffix if weight is Regular
        if (weightSuffix == "Regular") {
            fileNames.add("fonts/$actualFamilyName.ttf")
            fileNames.add("fonts/${actualFamilyName.lowercase()}.ttf")
        }

        // Also try original family name in case fonts are copied to app assets
        if (actualFamilyName != familyName) {
            fileNames.add("fonts/$familyName-$weightSuffix.ttf")
            fileNames.add("fonts/${familyName.lowercase()}-${weightSuffix.lowercase()}.ttf")
        }

        return fileNames
    }

    fun setTitleAlignment(alignment: String) {
        this.titleAlignment = alignment
        titleView.textAlignment = when (alignment.lowercase()) {
            "center" -> TextView.TEXT_ALIGNMENT_CENTER
            "right" -> TextView.TEXT_ALIGNMENT_TEXT_END
            else -> TextView.TEXT_ALIGNMENT_TEXT_START
        }
        (titleView.layoutParams as? LinearLayout.LayoutParams)?.gravity = when (alignment.lowercase()) {
            "center" -> Gravity.CENTER_HORIZONTAL
            "right" -> Gravity.END
            else -> Gravity.START
        }
        updateContainerGravity()
        requestLayout()
    }

    fun setSubTitleAlignment(alignment: String) {
        this.subTitleAlignment = alignment
        subTitleView.textAlignment = when (alignment.lowercase()) {
            "center" -> TextView.TEXT_ALIGNMENT_CENTER
            "right" -> TextView.TEXT_ALIGNMENT_TEXT_END
            else -> TextView.TEXT_ALIGNMENT_TEXT_START
        }
        (subTitleView.layoutParams as? LinearLayout.LayoutParams)?.gravity = when (alignment.lowercase()) {
            "center" -> Gravity.CENTER_HORIZONTAL
            "right" -> Gravity.END
            else -> Gravity.START
        }
        updateContainerGravity()
        requestLayout()
    }

    private fun updateContainerGravity() {
        container.gravity =
            if (titleAlignment.lowercase() == "center" && subTitleAlignment.lowercase() == "center")
                Gravity.CENTER_HORIZONTAL else Gravity.START
    }

    fun setPaddingInside(top: Float, bottom: Float, start: Float, end: Float) {
        paddingTop = dpToPx(top)
        paddingBottom = dpToPx(bottom)
        paddingStart = dpToPx(start)
        paddingEnd = dpToPx(end)
        container.setPadding(
            paddingStart.roundToInt(),
            paddingTop.roundToInt(),
            paddingEnd.roundToInt(),
            paddingBottom.roundToInt()
        )
        requestLayout()
    }

    fun setMarginValue(top: Float, bottom: Float, start: Float, end: Float) {
        marginTop = dpToPx(top)
        marginBottom = dpToPx(bottom)
        marginStart = dpToPx(start)
        marginEnd = dpToPx(end)
        requestLayout()
    }

    fun setArrowSize(size: Float) {
        arrowSize = dpToPx(size)
        requestLayout()
    }

    fun setTargetFrame(frame: Rect) {
        targetFrame = frame
        requestLayout()
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec)
        val contentWidth = container.measuredWidth
        val contentHeight = container.measuredHeight

        val requiredWidth: Int
        val requiredHeight: Int

        if (position == TooltipPosition.TOP || position == TooltipPosition.BOTTOM) {
            requiredWidth = contentWidth
            requiredHeight = contentHeight + arrowSize.roundToInt()
        } else {
            requiredWidth = contentWidth + arrowSize.roundToInt()
            requiredHeight = contentHeight
        }

        setMeasuredDimension(requiredWidth, requiredHeight)
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        try {
            val tooltipWidth = width.toFloat()
            val tooltipHeight = height.toFloat()
            val screenWidth = context.resources.displayMetrics.widthPixels.toFloat()
            val screenHeight = context.resources.displayMetrics.heightPixels.toFloat()

            val spaceAbove = targetFrame.top
            val spaceBelow = screenHeight - targetFrame.bottom
            val spaceLeft = targetFrame.left
            val spaceRight = screenWidth - targetFrame.right

            // Ensure tooltip flips based on space available
            position = when (position) {
                TooltipPosition.TOP -> if (spaceAbove < tooltipHeight + marginBottom) TooltipPosition.BOTTOM else TooltipPosition.TOP
                TooltipPosition.BOTTOM -> if (spaceBelow < tooltipHeight + marginTop) TooltipPosition.TOP else TooltipPosition.BOTTOM
                TooltipPosition.LEFT -> if (spaceLeft < tooltipWidth + marginEnd) TooltipPosition.RIGHT else TooltipPosition.LEFT
                TooltipPosition.RIGHT -> if (spaceRight < tooltipWidth + marginStart) TooltipPosition.LEFT else TooltipPosition.RIGHT
            }

            // Apply margins on the tooltip's own position
            val tooltipX = when (position) {
                TooltipPosition.LEFT -> targetFrame.left - tooltipWidth - arrowSize - marginEnd
                TooltipPosition.RIGHT -> targetFrame.right + arrowSize + marginStart
                else -> (targetFrame.centerX() - tooltipWidth / 2f)
            }.let { x ->
                val maxX = screenWidth - tooltipWidth
                if (maxX >= 0f) x.coerceIn(0f, maxX) else x.coerceAtLeast(0f)
            }

            val tooltipY = when (position) {
                TooltipPosition.TOP -> targetFrame.top - tooltipHeight - arrowSize - marginBottom
                TooltipPosition.BOTTOM -> targetFrame.bottom + arrowSize + marginTop
                else -> (targetFrame.centerY() - tooltipHeight / 2f)
            }.let { y ->
                val maxY = screenHeight - tooltipHeight
                if (maxY >= 0f) y.coerceIn(0f, maxY) else y.coerceAtLeast(0f)
            }

            x = tooltipX
            y = tooltipY

            val l = if (position == TooltipPosition.RIGHT) arrowSize.roundToInt() else 0
            val t = if (position == TooltipPosition.BOTTOM) arrowSize.roundToInt() else 0
            val r = l + container.measuredWidth
            val b = t + container.measuredHeight
            container.layout(l, t, r, b)

            arrowCenter = when (position) {
                TooltipPosition.TOP, TooltipPosition.BOTTOM -> {
                    val centerX = targetFrame.centerX() - tooltipX
                    val minArrow = arrowSize
                    val maxArrow = tooltipWidth - arrowSize
                    if (maxArrow >= minArrow) {
                        centerX.coerceIn(minArrow, maxArrow)
                    } else {
                        // If tooltip is too small, center the arrow
                        tooltipWidth / 2f
                    }
                }
                TooltipPosition.LEFT, TooltipPosition.RIGHT -> {
                    val centerY = targetFrame.centerY() - tooltipY
                    val minArrow = arrowSize
                    val maxArrow = tooltipHeight - arrowSize
                    if (maxArrow >= minArrow) {
                        centerY.coerceIn(minArrow, maxArrow)
                    } else {
                        // If tooltip is too small, center the arrow
                        tooltipHeight / 2f
                    }
                }
            }
        } catch (_: Exception) {}
    }

    override fun onDraw(canvas: Canvas) {
        try {
            super.onDraw(canvas)
            val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = backgroundColor
                style = Paint.Style.FILL
                setShadowLayer(4f, 0f, 2f, Color.argb(50, 0, 0, 0))
            }

            val rect = RectF()
            val w = width.toFloat()
            val h = height.toFloat()
            val arrow = arrowSize

            when (position) {
                TooltipPosition.TOP -> rect.set(0f, 0f, w, h - arrow)
                TooltipPosition.BOTTOM -> rect.set(0f, arrow, w, h)
                TooltipPosition.LEFT -> rect.set(0f, 0f, w - arrow, h)
                TooltipPosition.RIGHT -> rect.set(arrow, 0f, w, h)
            }

            val path = Path().apply {
                addRoundRect(rect, cornerRadius, cornerRadius, Path.Direction.CW)
            }

            val arrowPath = Path()
            when (position) {
                TooltipPosition.TOP -> {
                    val yTip = h
                    arrowPath.moveTo(arrowCenter - arrow, rect.bottom)
                    arrowPath.lineTo(arrowCenter, yTip)
                    arrowPath.lineTo(arrowCenter + arrow, rect.bottom)
                }
                TooltipPosition.BOTTOM -> {
                    val yTip = 0f
                    arrowPath.moveTo(arrowCenter - arrow, rect.top)
                    arrowPath.lineTo(arrowCenter, yTip)
                    arrowPath.lineTo(arrowCenter + arrow, rect.top)
                }
                TooltipPosition.LEFT -> {
                    val xTip = w
                    arrowPath.moveTo(rect.right, arrowCenter - arrow)
                    arrowPath.lineTo(xTip, arrowCenter)
                    arrowPath.lineTo(rect.right, arrowCenter + arrow)
                }
                TooltipPosition.RIGHT -> {
                    val xTip = 0f
                    arrowPath.moveTo(rect.left, arrowCenter - arrow)
                    arrowPath.lineTo(xTip, arrowCenter)
                    arrowPath.lineTo(rect.left, arrowCenter + arrow)
                }
            }

            path.addPath(arrowPath)
            canvas.drawPath(path, paint)
        } catch (_: Exception) {}
    }

    /** Convert dp to px */
    private fun dpToPx(dp: Float): Float {
        return try {
            TypedValue.applyDimension(
                TypedValue.COMPLEX_UNIT_DIP,
                dp,
                context.resources.displayMetrics
            )
        } catch (_: Exception) {
            dp * 3f // Approximate conversion fallback
        }
    }
}