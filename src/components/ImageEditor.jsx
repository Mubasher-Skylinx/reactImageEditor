import { useEffect, useRef, useState } from "react";
import { Cropper, CircleStencil, CropperPreview } from "react-advanced-cropper";
import { getAbsoluteZoom, getZoomFactor } from "advanced-cropper/extensions/absolute-zoom";
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
        crop: true,
        filter: false,
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

    const [image, setImage] = useState(profile);

    const cropperRef = useRef(null);
    const imageRef = useRef(null);

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

    const zoom = (e) => {
        let newZoomValue = Number(e.target.value);
        let valueToBeZoomed;

        let state = cropperRef.current.getState();
        let settings = cropperRef.current.getSettings();

        const absoluteZoom = getAbsoluteZoom(state, settings);

        if (imageState.zoom < newZoomValue) {
            valueToBeZoomed = Math.min(1, absoluteZoom + 0.25);
        } else {
            valueToBeZoomed = Math.min(1, absoluteZoom - 0.25);
        }

        cropperRef.current.zoomImage(getZoomFactor(state, settings, valueToBeZoomed), {
            transitions: true,
        });

        setImageState((prevState) => {
            return {
                ...prevState,
                zoom: newZoomValue,
            };
        });
    };

    const flip = (horizontal, vertical) => () => {
        cropperRef.current?.flipImage(horizontal, vertical);
    };

    const rotate = (e) => {
        const rotationValue = Number(e.target.value);

        const rotationDifference = rotationValue - imageState.rotate;

        if (rotationDifference === 0) {
            cropperRef.current.reset();
            return;
        }

        const increment = rotationDifference > 0 ? 1 : -1;

        const rotationSteps = Math.abs(rotationDifference);

        for (let i = 0; i < rotationSteps; i++) {
            cropperRef.current?.rotateImage(increment);
        }

        setImageState((prevState) => {
            return {
                ...prevState,
                rotate: rotationValue,
            };
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
        // console.log(cropper.getCoordinates(), cropper.getCanvas());
        // console.log(cropper.getCoordinates(), cropper.getCanvas()?.toDataURL?.()); // toDataURL bad approach
    };

    const handleApplyFilter = () => {};

    useEffect(() => {
        setAdjustments({
            brightness: 1.2,
            hue: 0,
            saturation: 1.5,
            contrast: 1.2,
        });
    }, []);

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
                    className="imageEditor__cropper img-filter-clarendon"
                    src={image}
                    ref={cropperRef}
                    onChange={onChange}
                    stencilComponent={CircleStencil}
                    stencilProps={{
                        aspectRatio: 1,
                        // aspectRatio: {
                        //     minimum: 19 / 9,
                        // },
                        overlayClassName: "cropper-overlay",
                        previewClassName: "img-filter-clarendon",
                        grid: true,
                    }}
                    backgroundProps={adjustments}
                    onUpdate={onUpdate}
                />

                <CropperPreview
                    cropper={cropperRef}
                    ref={previewRef}
                    className="img-filter-clarendon"
                    {...previewState}
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
                            onChange={onImageChange}
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
                            <label htmlFor="zoom">Zoom {imageState.zoom}</label>
                            <input
                                type="range"
                                name="zoom"
                                id="zoom"
                                defaultValue={0}
                                min={0}
                                max={5}
                                step={0.5}
                                onChange={zoom}
                            />
                        </div>

                        <div className="place-items place-items-vertical">
                            <label htmlFor="rotation">Rotation {imageState.rotate}</label>
                            <input
                                type="range"
                                name="rotation"
                                id="rotation"
                                defaultValue={imageState.zoom}
                                min={-360}
                                max={360}
                                step={1}
                                onChange={rotate}
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
                        <div className="place-items place-items-vertical">
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

{
    /* <div className="btn-actions">
                    <button className="btn" onClick={flip(true, false)}>
                        Flip Horizontal
                    </button>
                    <button className="btn" onClick={flip(false, true)}>
                        Flip Vertical
                    </button>
                    <button className="btn" onClick={rotate(-1)}>
                        Rotate Counter-Clockwise
                    </button>
                    <button className="btn" onClick={rotate(1)}>
                        Rotate Clockwise
                    </button>
                    <button className="btn" onClick={download}>
                        Download
                    </button>
                </div> */
}
