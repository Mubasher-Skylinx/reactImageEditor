import { forwardRef } from "react";
import { getBackgroundStyle } from "advanced-cropper";
import { AdjustableImage } from "./AdjustableImage";

export const AdjustableCropperBackground = forwardRef(
    (
        { className, cropper, crossOrigin, brightness = 0, saturation = 0, hue = 0, contrast = 0 },
        ref
    ) => {
        const state = cropper.getState();
        const transitions = cropper.getTransitions();
        const image = cropper.getImage();

        const style = image && state ? getBackgroundStyle(image, state, transitions) : {};

        return (
            <AdjustableImage
                src={image?.src}
                crossOrigin={crossOrigin}
                brightness={brightness}
                saturation={saturation}
                contrast={contrast}
                hue={hue}
                ref={ref}
                className={className}
                style={style}
            />
        );
    }
);
