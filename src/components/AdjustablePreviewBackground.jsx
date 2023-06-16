import React from "react";
import { getPreviewStyle } from "advanced-cropper";
import { AdjustableImage } from "./AdjustableImage";

export const AdjustablePreviewBackground = ({
    className,
    cropper,
    crossOrigin,
    brightness = 0,
    saturation = 0,
    hue = 0,
    contrast = 0,
    size,
}) => {
    const state = cropper.getState();
    const transitions = cropper.getTransitions();
    const image = cropper.getImage();

    const style = image && state && size ? getPreviewStyle(image, state, size, transitions) : {};

    return (
        <AdjustableImage
            src={image?.src}
            crossOrigin={crossOrigin}
            brightness={brightness}
            saturation={saturation}
            hue={hue}
            contrast={contrast}
            className={className}
            style={style}
        />
    );
};
