# Customization

Learn how to customize the appearance and behavior of nudges and tooltips.

## Nudge Customization

### Styling

Customize nudge appearance through template props:

```json
{
  "template": {
    "type": "Bottomsheet",
    "props": {
      "title": "Custom Nudge",
      "message": "Custom message",
      "backgroundColor": "#FFFFFF",
      "titleColor": "#000000",
      "messageColor": "#666666"
    }
  }
}
```

### Buttons

Customize button appearance and actions:

```json
{
  "primaryButton": {
    "text": "Get Started",
    "style": {
      "backgroundColor": "#007AFF",
      "textColor": "#FFFFFF"
    },
    "action": {
      "type": "DEEPLINK",
      "url": "app://home"
    }
  },
  "secondaryButton": {
    "text": "Maybe Later",
    "style": {
      "backgroundColor": "transparent",
      "textColor": "#007AFF"
    },
    "action": {
      "type": "DISMISS"
    }
  }
}
```

### Images

Add images to nudges:

```json
{
  "template": {
    "type": "Bottomsheet",
    "props": {
      "title": "New Feature",
      "image": "https://example.com/feature.png",
      "imageStyle": {
        "width": 200,
        "height": 200
      }
    }
  }
}
```

### Lottie Animations

Add Lottie animations:

```json
{
  "template": {
    "type": "Bottomsheet",
    "props": {
      "title": "Welcome!",
      "lottie": {
        "source": "https://example.com/animation.json",
        "autoPlay": true,
        "loop": true,
        "style": {
          "width": 200,
          "height": 200
        }
      }
    }
  }
}
```

## Tooltip Customization

### Appearance

```tsx
TooltipSystem.show({
  title: 'Custom Tooltip',
  backgroundColor: '#000000',
  titleColor: '#FFFFFF',
  borderRadius: 8,
  paddingLeft: 16,
  paddingRight: 16,
  paddingTop: 12,
  paddingBottom: 12,
});
```

### Typography

```tsx
TooltipSystem.show({
  title: 'Custom Tooltip',
  titleFontSize: 18,
  titleFontFamily: 'Arial',
  titleFontWeight: 'Bold',
  titleAlignment: 'center',
});
```

### Position and Arrow

```tsx
TooltipSystem.show({
  title: 'Custom Tooltip',
  position: 'bottom',
  arrowSize: 12,
  marginTop: 8,
  marginBottom: 8,
});
```

## Action Delay

Add delay before showing actions:

```json
{
  "actionId": "delayed-nudge",
  "type": "NUDGE_UI",
  "config": {
    "triggerDelay": 2000  // Show after 2 seconds
  },
  "template": { /* ... */ }
}
```

## Custom Actions

### Deep Link

Navigate to a screen:

```json
{
  "type": "DEEPLINK",
  "url": "app://home"
}
```

### Event

Trigger an analytics event:

```json
{
  "type": "EVENT",
  "eventName": "BUTTON_CLICKED",
  "eventParams": [
    {"key": "buttonId", "value": "signup"}
  ]
}
```

### Dismiss

Dismiss the nudge:

```json
{
  "type": "DISMISS"
}
```

## Best Practices

1. **Consistent Styling**: Use consistent colors and fonts
2. **Brand Colors**: Use your brand colors
3. **Readable Text**: Ensure text is readable
4. **Appropriate Sizes**: Use appropriate sizes for images/animations
5. **Test on Devices**: Test on different devices and screen sizes

## Next Steps

- [Nudges](/features/nudges) - Learn about nudges
- [Tooltips](/features/tooltips) - Learn about tooltips

