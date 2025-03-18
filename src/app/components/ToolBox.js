'use client';
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../css/toolbox.css";

const ToolBox = () => {
    const [benchLength, setBenchLength] = useState(1000);
    const [benchBricks, setBenchBricks] = useState([]);
    const [remainingLength, setRemainingLength] = useState(benchLength);
    const [gaps, setGaps] = useState(0);

    const [minGap, setMinGap] = useState(5);
    const [maxGap, setMaxGap] = useState(20);

    const [brickSizes, setBrickSizes] = useState([145, 120, 95, 90, 70, 45]);
    const [newSize, setNewSize] = useState("");

    const screenWidth = Math.max(...brickSizes);
    const scaleWithPixels = 32;

    // HSV-based color generation based on index in the brickSizes array
    const getBrickColor = (index) => `hsl(${(index * (360 / brickSizes.length)) % 360}, 40%, 60%)`;

    // Add one brick to benchBricks (normal click)
    const useBrick = (brick) => {
        const usedLength = benchBricks.reduce((sum, el) => sum + el, 0);
        const remainingSpace = benchLength - usedLength - brick;
        const newBricksCount = benchBricks.length + 1;
        const newGapSize = newBricksCount > 1 ? remainingSpace / (newBricksCount - 1) : 0;

        if (remainingSpace < 0 || newGapSize < 0) {
            console.log("Cannot add brick: Not enough space.");
            return;
        }

        setBenchBricks((prev) => [...prev, brick]);
    };


    const fillRemainingWithBrick = (brick) => {
        let currentBricks = [...benchBricks];

        while (true) {
            const usedLength = currentBricks.reduce((sum, el) => sum + el, 0);
            if (benchLength - usedLength < brick) break;
            currentBricks.push(brick);
        }
        setBenchBricks(currentBricks);
    };

    const removeBrick = (index) => {
        setBenchBricks((prev) => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        const used = benchBricks.reduce((sum, el) => sum + el, 0);
        setRemainingLength(benchLength - used);
        setGaps(benchBricks.length > 1 ? (benchLength - used) / (benchBricks.length - 1) : 0);
    }, [benchBricks, benchLength]);

    const getBrickSummary = () => {
        const count = {};
        benchBricks.forEach(brick => count[brick] = (count[brick] || 0) + 1);
    
        return (
            <ul className="summary-list">
                {Object.entries(count).map(([size, num]) => (
                    <li key={size}>{num} slat{num > 1 ? "s" : ""} of {size}mm</li>
                ))}
                <li><strong>Gap size:</strong> {gaps.toFixed(2)}mm</li>
            </ul>
        );
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const newOrder = Array.from(benchBricks);
        const [movedItem] = newOrder.splice(result.source.index, 1);
        newOrder.splice(result.destination.index, 0, movedItem);
        setBenchBricks(newOrder);
    };

    const usedLength = benchBricks.reduce((sum, el) => sum + el, 0);
    const progressPercentage = Math.min((usedLength / benchLength) * 100, 100);

    const getProgressBarColor = () => {
        if (gaps < minGap) return "red";
        if (gaps >= minGap && gaps <= maxGap) return "green";
        return "yellow";
    };

    // Preset handlers:
    const applyPreset145 = () => {
        setBrickSizes([145, 120, 95, 90, 70, 45]);
    };

    const applyPreset142 = () => {
        setBrickSizes([142, 120, 95, 90, 70, 42]);
    };

    const handleAddNewSize = () => {
        const size = parseInt(newSize, 10);
        if (!isNaN(size) && size > 0 && !brickSizes.includes(size)) {
            setBrickSizes([...brickSizes, size]);
            setNewSize("");
        }
    };

    return (
        <>
            <div className="toolbox-title">Bench Maker 3000!</div>

            <div className="input-row">
                <div className="input-group">
                    <label className="toolbox-label">Bench Length:</label>
                    <input
                        type="number"
                        value={benchLength}
                        onChange={(e) => setBenchLength(Number(e.target.value))}
                        className="toolbox-input"
                    />
                </div>
                <div className="input-group">
                    <label className="toolbox-label">Min Gap (mm):</label>
                    <input
                        type="number"
                        value={minGap}
                        onChange={(e) => setMinGap(Number(e.target.value))}
                        className="toolbox-input"
                    />
                </div>
                <div className="input-group">
                    <label className="toolbox-label">Max Gap (mm):</label>
                    <input
                        type="number"
                        value={maxGap}
                        onChange={(e) => setMaxGap(Number(e.target.value))}
                        className="toolbox-input"
                    />
                </div>
            </div>

            {/* Preset buttons and dynamic brick size editing */}
            <div className="preset-button-row">
                <button className="preset-button" onClick={applyPreset145}>145 Preset</button>
                <button className="preset-button"onClick={applyPreset142}>142 Preset</button>
            </div>

            <div className="brick-sizes-editor">

                <div className="brick-size-element">
                    {brickSizes.map((size, idx) => (
                        <div className="brick-size" key={idx}>
                            <div>
                            {size} 
                            {/* Optionally you can add a remove button for dynamic adjustment */}
                            <button className="brick-size-remove-button" onClick={() => setBrickSizes(brickSizes.filter((_, i) => i !== idx))}>Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="add-brick-size-container">
            <input
                    type="number"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="Add new size"
                    className="toolbox-input"
                />
                <button className="preset-button" onClick={handleAddNewSize}>Add Brick Size</button>
            </div>

            <div className="hint-text">
                <ul>
                <li>Left click on toolbox to add bricks to the bench</li>
                <li>Right click on toolbox to fill remaining space with selected brick</li>
                <li>Left click on bench display to remove bricks from bench</li>
                <li>Drag the bricks on bench to move them around</li>                
                </ul>
            </div>


            <div className="toolbox-frame">
                {brickSizes.map((brick, index) => {
                    const possibleCount = Math.floor(remainingLength / brick);
                    const isDisabled = possibleCount <= 0;

                    return (
                        <div
                            className="toolbox-brick"
                            key={brick}
                            style={{
                                width: `${24 + ((scaleWithPixels / screenWidth) * brick)}px`,
                                backgroundColor: getBrickColor(index),
                                opacity: isDisabled ? 0.2 : 1,
                                cursor: isDisabled ? "not-allowed" : "pointer" 
                            }}
                            onClick={() => !isDisabled && useBrick(brick)}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                if (!isDisabled) {
                                    fillRemainingWithBrick(brick);
                                }
                            }}
                        >
                            {brick} {possibleCount > 0 ? `(${possibleCount})` : ""}
                        </div>
                    );
                })}
            </div>

            <div className="toolbox-label">
                Bench length is currently {benchLength}mm / Used length: {usedLength}mm
            </div>

            {/* Remaining Length Box with Progress Bar */}
            <div className="remaining-length-box">
                <div className="toolbox-label">Remaining length: {remainingLength}mm</div>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{
                            width: `${progressPercentage}%`,
                            background: `linear-gradient(to bottom, ${getProgressBarColor()}, rgba(0,0,0,0.2))`
                        }}
                    ></div>
                </div>
                <div className="toolbox-label">Gap size: {gaps.toFixed(2)}mm</div>
            </div>

            <div className="bench-wrapper">
                <div className="bench-container">
                    <div className="bench-centerline"></div> 

                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="bench" direction="horizontal">
                            {(provided) => (
                                <div className="bench-content" ref={provided.innerRef} {...provided.droppableProps}>
                                    {benchBricks.map((brick, index) => (
                                        <React.Fragment key={index}>
                                            {index !== 0 && ( 
                                                <div
                                                    className="bench-gap"
                                                    style={{
                                                        width: `${(gaps / benchLength) * 600}px`,
                                                        backgroundColor: gaps >= minGap && gaps <= maxGap ? "transparent" : "rgba(209, 48, 48, 0.59)"
                                                    }}
                                                ></div>
                                            )}
                                            <Draggable draggableId={`${index}`} index={index}>
                                                {(provided) => (
                                                    <div
                                                        className="bench-brick"
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                            width: `${(brick / benchLength) * 600}px`,
                                                            backgroundColor: getBrickColor(brickSizes.indexOf(brick)),
                                                            ...provided.draggableProps.style
                                                        }}
                                                        onClick={() => removeBrick(index)}
                                                    >
                                                        {brick}
                                                    </div>
                                                )}
                                            </Draggable>
                                        </React.Fragment>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </div>

            <div className="toolbox-label">Summary: {getBrickSummary()}</div>
        </>
    );
};

export default ToolBox;
