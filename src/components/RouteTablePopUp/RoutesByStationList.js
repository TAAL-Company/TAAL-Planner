import { Button, Divider } from "@mui/material";
import React from "react";
import InputFileUpload from "../InputFileUpload/InputFileUpload";

const RoutesByStationList = ({
    data,
    language,
    headerMapping,
    handleRemoveAudio,
    handleUploadAudio,
    handleDragOver,
    handleDrop,
    handleAudioDrop,
    draggedImage,
    draggedAudio,
    handleOpenAudioGallery,
    setData,
    handleOpenImageGallery,
}) => {

    headerMapping = {
        Task: ["Task", "כותרת"],
        Station: ["Station", "תחנה"],
        Subtitle: ["Subtitle", "כותרת משנה"],
        "Estimated Time Seconds": ["Estimated Time Seconds", "שניות זמן משוערות"],
        Help: ["Help", "גלגל הצלה"],
        image: ["Image", "תמונה"],
        audio: ["Audio", "אודיו"],
    };

    // --- Helpers ---
    const handleRemoveImage = (rowIdx) => {
        setData((prevData) => {
            const newData = [...prevData];
            newData[rowIdx] = { ...newData[rowIdx], image: null };
            return newData;
        });
    };

    const handleEditCell = (rowIdx, key, value) => {
        setData((prevData) => {
            const newData = [...prevData];
            newData[rowIdx] = { ...newData[rowIdx], [key]: value };
            return newData;
        });
    };

    const handleUploadImage = (rowIdx, file) => {
        setData((prevData) => {
            const newData = [...prevData];
            newData[rowIdx] = { ...newData[rowIdx], image: file };
            return newData;
        });
    };

    const handleAddTask = (rowIdx) => {
        setData((prevData) => {
            const newData = [...prevData];
            let stationAbove = newData[rowIdx]?.Station || "";
            console.log(newData[rowIdx]);

            newData.splice(rowIdx + 1, 0, {
                Task: "",
                Station: stationAbove,
                stationdata: newData[rowIdx]?.stationdata || null,
                Subtitle: "",
                "Estimated Time Seconds": "",
                Help: "",
                image: null,
                audio: null,
            });
            return newData;
        });
    };

    const handleDeleteTask = (rowIdx) => {
        setData((prevData) => prevData.filter((_, idx) => idx !== rowIdx));
    };

    // --- Group consecutive stations ---
    const groupedData = data.reduce((acc, row, index) => {
        const prevStation = data[index - 1]?.Station;
        if (row.Station !== prevStation) {
            acc.push({ station: row.Station, tasks: [] });
        }
        acc[acc.length - 1].tasks.push({ row, rowIndex: index });
        return acc;
    }, []);

    // --- Render ---
    return (
        <div>
            {console.log(groupedData)}
            {groupedData.map(({ station, tasks }, stationIdx) => (
                <div key={stationIdx} style={{ marginBottom: 32 }}>
                    {/* Divider with station name */}
                    <Divider style={{ margin: "16px 0" }}>{station}</Divider>

                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            minWidth: 800,
                            direction: language === "English" ? "rtl" : "ltr",
                            textAlign: language === "English" ? "right" : "left",
                        }}
                    >
                        <thead>
                            <tr>
                                {Object.keys(data[0])
                                    .filter((key) => key !== "Site" && key !== "stationdata") // keep Image/Audio, remove only Site
                                    .map((key) => (
                                        <th
                                            key={key}
                                            style={{
                                                border: "1px solid #ccc",
                                                padding: 8,
                                                background: "#f0f0f0",
                                                fontWeight: 600,
                                                direction: language === "English" ? "rtl" : "ltr",
                                                textAlign: language === "English" ? "right" : "left",
                                            }}
                                        >
                                            {language === "English"
                                                ? headerMapping[key]?.[1] || key // Hebrew
                                                : headerMapping[key]?.[0] || key // English
                                            }
                                        </th>
                                    ))}
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>


                        <tbody>
                            {tasks.map(({ row, rowIndex }) => (
                                <tr
                                    key={rowIndex}
                                    style={{ transition: "background 0.2s", cursor: "pointer" }}
                                >
                                    {Object.keys(data[0])
                                        .filter((key) => key !== "Image" && key !== "Site" && key !== "stationdata")
                                        .map((key) => (
                                            <td
                                                key={key}
                                                style={{
                                                    border: "1px solid #ccc",
                                                    padding: 8,
                                                    position: "relative",
                                                    verticalAlign: "middle",
                                                    background:
                                                        (key === "image" && draggedImage) ||
                                                            (key === "audio" && draggedAudio)
                                                            ? "#e6f7ff"
                                                            : undefined,
                                                    outline:
                                                        (key === "image" && draggedImage) ||
                                                            (key === "audio" && draggedAudio)
                                                            ? "2px dashed #256fa1"
                                                            : undefined,
                                                    transition: "background 0.2s, outline 0.2s",
                                                    direction: language === "English" ? "rtl" : "ltr",
                                                    textAlign: language === "English" ? "right" : "left",
                                                }}
                                                {...(key === "image"
                                                    ? {
                                                        onDragOver: handleDragOver,
                                                        onDrop: () => handleDrop(rowIndex),
                                                    }
                                                    : key === "audio"
                                                        ? {
                                                            onDragOver: handleDragOver,
                                                            onDrop: () => handleAudioDrop(rowIndex),
                                                        }
                                                        : {})}
                                            >
                                                {key === "image" ? (
                                                    <div
                                                        style={{
                                                            position: "relative",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 8,
                                                            minHeight: 40,
                                                            direction:
                                                                language === "English" ? "rtl" : "ltr",
                                                        }}
                                                    >
                                                        {row[key] && (
                                                            <>
                                                                <img
                                                                    src={
                                                                        typeof row[key] === "string"
                                                                            ? row[key]
                                                                            : URL.createObjectURL(row[key])
                                                                    }
                                                                    alt="preview"
                                                                    style={{
                                                                        width: 150,
                                                                        height: 150,
                                                                        objectFit: "contain",
                                                                        borderRadius: 4,
                                                                        border: "1px solid #ddd",
                                                                    }}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveImage(rowIndex)}
                                                                    style={{
                                                                        position: "absolute",
                                                                        top: 2,
                                                                        right: 2,
                                                                        background: "rgba(255,255,255,0.85)",
                                                                        border: "none",
                                                                        borderRadius: "50%",
                                                                        cursor: "pointer",
                                                                        width: 22,
                                                                        height: 22,
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        fontWeight: "bold",
                                                                        color: "#ca0a0a",
                                                                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                                                                    }}
                                                                    title={
                                                                        language === "English"
                                                                            ? "הסר תמונה"
                                                                            : "Remove image"
                                                                    }
                                                                >
                                                                    ×
                                                                </button>
                                                            </>
                                                        )}
                                                        <InputFileUpload
                                                            language={language}
                                                            setPicture={(file) => handleUploadImage(rowIndex, file)}
                                                        />
                                                        {/* <label
                                                            style={{
                                                                display: "inline-block",
                                                                padding: "4px 10px",
                                                                background: "#eee",
                                                                borderRadius: 4,
                                                                border: "1px solid #ccc",
                                                                cursor: "pointer",
                                                                fontSize: 12,
                                                                marginLeft: row[key] ? 8 : 0,
                                                            }}
                                                        >
                                                            {row[key]
                                                                ? language === "English"
                                                                    ? "החלף"
                                                                    : "Replace"
                                                                : language === "English"
                                                                    ? "העלה"
                                                                    : "Upload"}
                                                            <input
                                                                dir={language === "English" ? "rtl" : "ltr"}
                                                                type="file"
                                                                accept="image/*"
                                                                style={{ display: "none" }}
                                                                onChange={(e) => {
                                                                    if (e.target.files?.[0]) {
                                                                        handleUploadImage(rowIndex, e.target.files[0]);
                                                                    }
                                                                }}
                                                            />
                                                        </label> */}
                                                        <Button
                                                            variant="outlined"
                                                            
                                                            onClick={() => handleOpenImageGallery(rowIndex)}
                                                            // style={{
                                                            //     fontSize: 10,
                                                            //     padding: "2px 8px",
                                                            //     minWidth: "auto",
                                                            // }}
                                                        >
                                                            {language === "English" ? "גלריה" : "Gallery"}
                                                        </Button>
                                                        {/* {!row[key] && (
                                                            <span
                                                                style={{
                                                                    color: "#aaa",
                                                                    fontSize: 13,
                                                                    marginLeft: 8,
                                                                }}
                                                            >
                                                                {language === "English"
                                                                    ? "גרור תמונה לכאן"
                                                                    : "Drag image here"}
                                                            </span>
                                                        )} */}
                                                    </div>
                                                ) : key === "audio" ? (
                                                    <div
                                                        style={{
                                                            position: "relative",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 8,
                                                            minHeight: 40,
                                                            direction:
                                                                language === "English" ? "rtl" : "ltr",
                                                        }}
                                                    >
                                                        {row[key] && (
                                                            <>
                                                                <div
                                                                    style={{
                                                                        display: "flex",
                                                                        flexDirection: "column",
                                                                        alignItems: "center",
                                                                        gap: 4,
                                                                    }}
                                                                >
                                                                    <audio
                                                                        controls
                                                                        style={{ width: "200px", height: "30px" }}
                                                                    >
                                                                        <source
                                                                            src={
                                                                                typeof row[key] === "string"
                                                                                    ? row[key]
                                                                                    : URL.createObjectURL(row[key])
                                                                            }
                                                                            type="audio/mpeg"
                                                                        />
                                                                    </audio>
                                                                    <span
                                                                        style={{
                                                                            fontSize: 12,
                                                                            color: "#666",
                                                                            maxWidth: "200px",
                                                                            overflow: "hidden",
                                                                            textOverflow: "ellipsis",
                                                                            whiteSpace: "nowrap",
                                                                        }}
                                                                    >
                                                                        {typeof row[key] === "string"
                                                                            ? row[key].split("/").pop()
                                                                            : row[key].name}
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveAudio(rowIndex)}
                                                                    style={{
                                                                        position: "absolute",
                                                                        top: 2,
                                                                        right: 2,
                                                                        background: "rgba(255,255,255,0.85)",
                                                                        border: "none",
                                                                        borderRadius: "50%",
                                                                        cursor: "pointer",
                                                                        width: 22,
                                                                        height: 22,
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        fontWeight: "bold",
                                                                        color: "#ca0a0a",
                                                                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                                                                    }}
                                                                    title={
                                                                        language === "English"
                                                                            ? "הסר אודיו"
                                                                            : "Remove audio"
                                                                    }
                                                                >
                                                                    ×
                                                                </button>
                                                            </>
                                                        )}
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                gap: 4,
                                                            }}
                                                        >
                                                            <label
                                                                style={{
                                                                    display: "inline-block",
                                                                    padding: "4px 10px",
                                                                    background: "#eee",
                                                                    borderRadius: 4,
                                                                    border: "1px solid #ccc",
                                                                    cursor: "pointer",
                                                                    fontSize: 12,
                                                                    textAlign: "center",
                                                                }}
                                                            >
                                                                {row[key]
                                                                    ? language === "English"
                                                                        ? "החלף"
                                                                        : "Replace"
                                                                    : language === "English"
                                                                        ? "העלה אודיו"
                                                                        : "Upload Audio"}
                                                                <input
                                                                    dir={language === "English" ? "rtl" : "ltr"}
                                                                    type="file"
                                                                    accept="audio/*"
                                                                    style={{ display: "none" }}
                                                                    onChange={(e) => {
                                                                        if (e.target.files?.[0]) {
                                                                            handleUploadAudio(rowIndex, e.target.files[0]);
                                                                        }
                                                                    }}
                                                                />
                                                            </label>
                                                            <Button
                                                                variant="outlined"
                                                                
                                                                onClick={() => handleOpenAudioGallery(rowIndex)}
                                                                // style={{
                                                                //     fontSize: 10,
                                                                //     padding: "2px 8px",
                                                                //     minWidth: "auto",
                                                                // }}
                                                            >
                                                                {language === "English" ? "גלריה" : "Gallery"}
                                                            </Button>
                                                        </div>
                                                        {/* {!row[key] && (
                                                            <span
                                                                style={{
                                                                    color: "#aaa",
                                                                    fontSize: 13,
                                                                    marginLeft: 8,
                                                                }}
                                                            >
                                                                {language === "English"
                                                                    ? "העלה קובץ אודיו"
                                                                    : "Upload audio file"}
                                                            </span>
                                                        )} */}
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={row[key] ?? ""}
                                                        onChange={(e) =>
                                                            handleEditCell(rowIndex, key, e.target.value)
                                                        }
                                                        style={{
                                                            width: "100%",
                                                            border: "1px solid #ddd",
                                                            borderRadius: 4,
                                                            background: "#fafafa",
                                                            padding: "4px 8px",
                                                            fontSize: 14,
                                                            direction: language === "English" ? "rtl" : "ltr",
                                                            textAlign: language === "English" ? "right" : "left",
                                                        }}
                                                    />
                                                )}
                                            </td>
                                        ))}
                                    <td>
                                        <button
                                            onClick={() => handleDeleteTask(rowIndex)}
                                            style={{
                                                background: "red",
                                                color: "white",
                                                border: "none",
                                                borderRadius: 4,
                                                padding: "4px 8px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {language !== "English" ? "Delete" : "מחק"}
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleAddTask(rowIndex)}
                                            style={{
                                                background: "green",
                                                color: "white",
                                                border: "none",
                                                borderRadius: 4,
                                                padding: "4px 8px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {language !== "English" ? "Add" : "הוסף"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
};

export default RoutesByStationList;
