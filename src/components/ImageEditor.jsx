import { useEffect, useRef, useState } from "react";
import { Cropper, CircleStencil, CropperPreview } from "react-advanced-cropper";
import { getAbsoluteZoom, getZoomFactor } from "advanced-cropper/extensions/absolute-zoom";
import { AdjustableCropperBackground } from "./AdjustableCropperBackground.jsx";
import { AdjustablePreviewBackground } from "./AdjustablePreviewBackground.jsx";
import "react-advanced-cropper/dist/style.css";

import profile from "@/assets/images/profile.jpg";
import "@/styles/components/ImageEditor.css";

export default function ImageEditor() {
    const previewRef = useRef(null);

    const [imageState, setImageState] = useState({
        zoom: 0,
        rotate: 0,
    });
    const [mode, setMode] = useState({
        crop: false,
        filter: true,
    });
    const [previewState, setPreviewState] = useState({
        state: null,
        image: null,
        transitions: null,
    });
    const [adjustments, setAdjustments] = useState({
        brightness: 0,
        hue: 0,
        saturation: 0,
        contrast: 0,
    });

    const [image, setImage] = useState(profile);

    const cropperRef = useRef(null);
    const imageRef = useRef(null);

    const onUpdate = (cropper) => {
        previewRef.current?.refresh();
        setPreviewState({
            state: cropper.getState(),
            image: cropper.getImage(),
            transitions: cropper.getTransitions(),
            loaded: cropper.isLoaded(),
            loading: cropper.isLoading(),
        });
    };

    const handleChangeMode = (mode) => () => {
        switch (mode) {
            case "crop":
                setMode((prevState) => {
                    return {
                        ...prevState,
                        crop: true,
                        filter: false,
                    };
                });
                break;

            case "filter":
                setMode((prevState) => {
                    return {
                        ...prevState,
                        crop: false,
                        filter: true,
                    };
                });
                break;

            default:
                break;
        }
    };

    const handleImageChange = (e) => {
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

    const onZoom = (e) => {
        const cropper = cropperRef.current;
        if (cropper) {
            cropper.zoomImage(
                getZoomFactor(cropper.getState(), cropper.getSettings(), e.target.value),
                {
                    transitions: false,
                }
            );
        }
    };

    const flip = (horizontal, vertical) => () => {
        cropperRef.current?.flipImage(horizontal, vertical);
    };

    const onRotate = (e) => {
        const { value } = e.target;

        const difference = value - imageState.rotate;

        cropperRef.current?.rotateImage(difference, {
            transitions: false,
        });
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

    const resetPhoto = () => {
        cropperRef.current?.reset();
    };

    // THIS FUNCTION WILL CALL WHEN EVER THERE IS CHANGE IN EDITOR
    const onChange = (cropper) => {
        const state = cropper.getState();
        setImageState({
            rotate: state.transforms.rotate,
            zoom: getAbsoluteZoom(state, cropper.getSettings()),
        });
        // console.log(cropper.getCoordinates(), cropper.getCanvas());
        // console.log(cropper.getCoordinates(), cropper.getCanvas()?.toDataURL?.()); // toDataURL bad approach
    };

    const handleApplyFilter = (e) => {
        let { value } = e.target;
        switch (value) {
            case "clarendon": {
                setAdjustments({
                    brightness: 1.2,
                    saturation: 1.5,
                    contrast: 1.2,
                    hue: 0,
                });
                break;
            }

            case "gingham": {
                setAdjustments({
                    saturation: 0.8,
                    contrast: 0.8,
                    brightness: 0,
                    hue: 0,
                });
                break;
            }

            case "juno": {
                setAdjustments({
                    brightness: 1.1,
                    contrast: 1.1,
                    saturation: 1.2,
                    sepia: 0.3,
                    hue: 0,
                });
                break;
            }

            case "lark": {
                setAdjustments({
                    brightness: 1.1,
                    saturation: 0.8,
                    hue: 0,
                    contrast: 0,
                });
                break;
            }

            case "moon": {
                setAdjustments({
                    brightness: 0.8,
                    contrast: 1.2,
                    grayscale: 1,
                    sepai: 0.2,
                    hue: 0,
                    saturation: 0,
                });
                break;
            }

            case "reyes": {
                setAdjustments({
                    brightness: 1.2,
                    contrast: 0.9,
                    grayscale: 0,
                    sepai: 0.2,
                    hue: 0,
                    saturation: 0,
                });
                break;
            }

            case "willow": {
                setAdjustments({
                    brightness: 0.9,
                    saturation: 0.7,
                    contrast: 0,
                    grayscale: 0,
                    sepai: 0,
                    hue: 0,
                });
                break;
            }

            default:
                break;
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
        <section className="imageEditor__container">
            <header>
                <h2>Cover Photo</h2>

                <button className="btn">&times;</button>
            </header>

            <div className="imageEditor__preview__container">
                <Cropper
                    className="imageEditor__cropper "
                    src={image}
                    ref={cropperRef}
                    onChange={onChange}
                    stencilComponent={CircleStencil}
                    stencilProps={{
                        aspectRatio: 1,
                        overlayClassName: "cropper-overlay",
                        grid: true,
                    }}
                    backgroundComponent={AdjustableCropperBackground}
                    backgroundProps={adjustments}
                    onUpdate={onUpdate}
                />

                <CropperPreview
                    cropper={cropperRef}
                    ref={previewRef}
                    {...previewState}
                    backgroundComponent={AdjustablePreviewBackground}
                    backgroundProps={adjustments}
                />
            </div>

            <footer>
                <div className="btn-group">
                    <button className="btn">Delete Photo</button>
                    <button className="btn" onClick={resetPhoto}>
                        Reset Photo
                    </button>
                </div>

                <div className="btn-group">
                    <div className="form-group form-group-horizontal">
                        <label htmlFor="uploadImage" className="btn">
                            Change image
                        </label>
                        <input
                            ref={imageRef}
                            type="file"
                            accept="image/*"
                            id="uploadImage"
                            onChange={handleImageChange}
                            hidden
                        />
                    </div>
                    <button className="btn bg-primary">Apply</button>
                    <button className="btn" onClick={download}>
                        Download
                    </button>
                </div>
            </footer>

            <section className="tabs-container">
                <section className="tabs-action place-items place-items-horizontal">
                    <div
                        className={`btn ${mode.crop ? "active" : ""}`}
                        onClick={handleChangeMode("crop")}
                    >
                        Crop
                    </div>
                    <div
                        className={`btn ${mode.filter ? "active" : ""}`}
                        onClick={handleChangeMode("filter")}
                    >
                        Filters
                    </div>
                </section>
            </section>

            <section className="image__settings-container">
                {mode.crop && (
                    <div className="btn-actions place-items place-items-horizontal">
                        <div className="place-items place-items-vertical">
                            <label htmlFor="zoom">Zoom {parseInt(imageState.zoom * 10)}</label>
                            <input
                                type="range"
                                name="zoom"
                                id="zoom"
                                value={imageState.zoom}
                                min={0}
                                max={1}
                                step={0.1}
                                onChange={onZoom}
                            />
                        </div>

                        <div className="place-items place-items-vertical">
                            <label htmlFor="rotation">Rotation {imageState.rotate}</label>
                            <input
                                type="range"
                                name="rotation"
                                id="rotation"
                                value={imageState.rotate}
                                min={-360}
                                max={360}
                                step={1}
                                onChange={onRotate}
                            />
                        </div>
                        <button className="btn" onClick={flip(true, false)}>
                            Flip Horizontal
                        </button>
                        <button className="btn" onClick={flip(false, true)}>
                            Flip Vertical
                        </button>
                        <button
                            className="btn"
                            onClick={() => {
                                cropperRef.current?.rotateImage(-90);
                                setImageState((prevState) => {
                                    return {
                                        ...prevState,
                                        rotate: prevState.rotate - 90,
                                    };
                                });
                            }}
                        >
                            Rotate Counter-Clockwise
                        </button>
                        <button
                            className="btn"
                            onClick={() => {
                                cropperRef.current?.rotateImage(90);
                                setImageState((prevState) => {
                                    return {
                                        ...prevState,
                                        rotate: prevState.rotate + 90,
                                    };
                                });
                            }}
                        >
                            Rotate Clockwise
                        </button>
                    </div>
                )}

                {mode.filter && (
                    <div className="btn-actions place-items place-items-horizontal">
                        <div className="place-items place-items-vertical filters-container">
                            <label htmlFor="zoom">Filters</label>
                            <select name="filter" id="filter" onChange={handleApplyFilter}>
                                <option value="clarendon">Clarendon</option>
                                <option value="gingham">Gingham</option>
                                <option value="juno">Juno</option>
                                <option value="lark">Lark</option>
                                <option value="moon">Moon</option>
                                <option value="reyes">Reyes</option>
                                <option value="willow">Willow</option>
                            </select>
                        </div>
                    </div>
                )}
            </section>
        </section>
    );
}
