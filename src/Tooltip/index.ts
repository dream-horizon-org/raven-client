import {CtaTooltipAction} from '../cta'

import {FontWeight, NativeTooltip, TooltipOptions} from './NativeTooltip'

export const TooltipSystem = {
  show: (options: TooltipOptions) => {
    return NativeTooltip.show(options)
  },

  hide: (targetId: string) => {
    return NativeTooltip.hide(targetId)
  },

  hideAll: () => {
    return NativeTooltip.hideAll()
  },

  showFromCTA: (ctaAction: CtaTooltipAction) => {
    try {
      const template = ctaAction.template || {
        props: {},
        styles: {},
        actions: [],
      }

      const props = template.props || {}
      const styles = template.styles || {}
      const targetId = props.targetId || 'default_tooltip'

      const options: TooltipOptions = {
        title: props.title,
        subTitle: props.subTitle || '',
        targetId: targetId,
        position: props.position || 'top',
        backgroundColor: styles.backgroundColor || '#000000',
        titleColor: props.titleColor || '#FFFFFF',
        subTitleColor: props.subTitleColor || '#FFFFFF',
        titleFontFamily: props.titleFontFamily?.trim(),
        subTitleFontFamily: props.subTitleFontFamily?.trim(),
        titleFontWeight:
          (props.titleFontWeight as FontWeight) || FontWeight.Regular,
        subTitleFontWeight:
          (props.subTitleFontWeight as FontWeight) || FontWeight.Regular,
        autoDismissMs: props.autoDismissMs ?? 0,
        targetScreen: props.targetScreen || '',
        borderRadius: styles.borderRadius ?? 0,
        titleAlignment: props.titleAlignment || 'left',
        subTitleAlignment: props.subTitleAlignment || 'left',

        paddingLeft: styles.paddingLeft,
        paddingRight: styles.paddingRight,
        paddingTop: styles.paddingTop,
        paddingBottom: styles.paddingBottom,

        marginLeft: styles.marginLeft,
        marginRight: styles.marginRight,
        marginTop: styles.marginTop,
        marginBottom: styles.marginBottom,

        titleFontSize: props.titleFontSize ?? 16,
        subTitleFontSize: props.subTitleFontSize ?? 14,
        dismissOnOutsideTouch: props.dismissOnOutsideTouch ?? true,
        triggerDelay: props.triggerDelay ?? 0,
        arrowSize: props.arrowSize ?? 16,
      }
      return NativeTooltip.show({
        ...options,
      })
    } catch (err) {
      // Failed to show tooltip from CTA
    }
  },
}

export type {TooltipOptions}
