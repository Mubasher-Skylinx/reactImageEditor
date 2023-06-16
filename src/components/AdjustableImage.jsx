import { forwardRef, useRef, useLayoutEffect } from "react";
import cn from "classnames";
import { mergeRefs } from "react-advanced-cropper";
import "@/styles/components/AdjustableImage.css";

export const AdjustableImage = forwardRef(
    (
        {
            src,
            className,
            crossOrigin,
            brightness = 0,
            saturation = 0,
            hue = 0,
            contrast = 0,
            style,
        },
        ref
    ) => {
        const imageRef = useRef(null);
        const canvasRef = useRef(null);

        const drawImage = () => {
            const image = imageRef.current;
            const canvas = canvasRef.current;
            if (canvas && image && image.complete) {
                const ctx = canvas.getContext("2d");
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;

                if (ctx) {
                    ctx.filter = [
                        `brightness(${100 + brightness * 100}%)`,
                        `contrast(${100 + contrast * 100}%)`,
                        `saturate(${100 + saturation * 100}%)`,
                        `hue-rotate(${hue * 360}deg)`,
                    ].join(" ");

                    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
                }
            }
        };

        useLayoutEffect(() => {
            drawImage();
        }, [src, brightness, saturation, hue, contrast]);

        return (
            <>
                <canvas
                    key={`${src}-canvas`}
                    ref={mergeRefs([ref, canvasRef])}
                    className={cn("adjustable-image-element", className)}
                    style={style}
                />
                {src ? (
                    <img
                        key={`${src}-img`}
                        ref={imageRef}
                        className={"adjustable-image-source"}
                        src={src}
                        crossOrigin={crossOrigin === true ? "anonymous" : crossOrigin || undefined}
                        onLoad={drawImage}
                    />
                ) : null}
            </>
        );
    }
);

AdjustableImage.displayName = "AdjustableImage";
