import { useEffect, useRef, useState } from "react";
import { Cropper, CircleStencil, CropperPreview } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";

import profile from "@/assets/images/profile.jpg";

export default function ImageEditor() {
    const [image, setImage] = useState(profile);

    const cropperRef = useRef(null);
    const previewRef = useRef(null);
    const imageRef = useRef(null);

    const [previewState, setPreviewState] = useState({
        state: null,
        image: null,
        transitions: null,
    });

    const onImageChange = (e) => {
        const { files } = e.target;
        if (files && files[0]) {
            // Create the blob link to the file to optimize performance:
            const blob = URL.createObjectURL(files[0]);
            // Get the image type from the extension. It's the simplest way, though be careful it can lead to an incorrect result:
            setImage(blob);
        } else {
            setImage("");
        }
    };

    // THIS FUNCTION WILL CALL WHEN EVER THERE IS CHANGE IN EDITOR
    const onChange = (cropper) => {
        // console.log(cropper.getCoordinates(), cropper.getCanvas());
        // console.log(cropper.getCoordinates(), cropper.getCanvas()?.toDataURL?.()); // toDataURL bad approach
    };

    const onUpdate = (cropper) => {
        setPreviewState({
            state: cropper.getState(),
            image: cropper.getImage(),
            transitions: cropper.getTransitions(),
            loaded: cropper.isLoaded(),
            loading: cropper.isLoading(),
        });
    };

    const zoomIn = (val) => () => {
        cropperRef.current.zoomImage(val);
    };
    const zoomOut = (val) => () => {
        cropperRef.current.zoomImage(val);
    };

    const flip = (horizontal, vertical) => () => {
        cropperRef.current?.flipImage(horizontal, vertical);
    };

    const rotate = (angle) => () => {
        cropperRef.current?.rotateImage(angle);
    };

    const download = () => {
        const cropper = cropperRef.current;
        if (cropper) {
            cropper.getCanvas()?.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const newTab = window.open();
                if (newTab && url) {
                    newTab.document.body.innerHTML = `<img src="${url}"></img>`;
                }
            });
        }
    };

    // FOR UPLOADING SERVER
    const onUpload = () => {
        const canvas = cropperRef.current?.getCanvas();
        if (canvas) {
            const form = new FormData();
            canvas.toBlob((blob) => {
                if (blob) {
                    form.append("file", blob);
                    fetch("http://example.com/upload/", {
                        method: "POST",
                        body: form,
                    });
                }
            }, "image/jpeg");
        }
    };

    useEffect(() => {
        return () => {
            if (image) {
                URL.revokeObjectURL(image);
            }
        };
    }, [image]);

    return (
        <section className="advance-cropper-container">
            <section className="image-picker">
                <div className="upload-example">
                    <div className="buttons-wrapper">
                        <button className="button">
                            <label htmlFor="uploadImage">Upload image</label>
                            <input
                                ref={imageRef}
                                type="file"
                                accept="image/*"
                                id="uploadImage"
                                onChange={onImageChange}
                            />
                        </button>
                    </div>
                </div>

                <div className="btn-actions">
                    <button onClick={zoomIn(2)}>Zoom +</button>
                    <button onClick={zoomOut(0.5)}>Zoom -</button>
                    <button onClick={flip(true, false)}>Flip Horizontal</button>
                    <button onClick={flip(false, true)}>Flip Vertical</button>
                    <button onClick={rotate(-1)}>Rotate Counter-Clockwise</button>
                    <button onClick={rotate(1)}>Rotate Clockwise</button>
                    <button onClick={download}>Download</button>
                </div>
            </section>

            <div className="advance-cropper-settings">
                <Cropper
                    src={image}
                    ref={cropperRef}
                    onChange={onChange}
                    className={"cropper"}
                    stencilComponent={CircleStencil}
                    stencilProps={{
                        aspectRatio: 1,
                        // aspectRatio: {
                        //     minimum: 19 / 9,
                        // },
                        overlayClassName: "cropper-overlay",
                        previewClassName: "cropper-preview",
                        grid: true,
                    }}
                    onUpdate={onUpdate}
                />

                <CropperPreview ref={previewRef} className="preview" {...previewState} />
            </div>
        </section>
    );
}
