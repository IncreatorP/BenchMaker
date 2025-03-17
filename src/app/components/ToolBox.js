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

    const widths = [145, 120, 95, 70, 45];
    const screenWidth = Math.max(...widths);
    const scaleWithPixels = 32;

    // HSV-based color generation
    const getBrickColor = (index) => `hsl(${(index * (360 / widths.length)) % 360}, 40%, 60%)`;

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

    const removeBrick = (index) => {
        setBenchBricks((prev) => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        let used = benchBricks.reduce((sum, el) => sum + el, 0);
        setRemainingLength(benchLength - used);
        setGaps(benchBricks.length > 1 ? (benchLength - used) / (benchBricks.length - 1) : 0);
    }, [benchBricks, benchLength]);

    const getBrickSummary = () => {
        const count = {};
        benchBricks.forEach(brick => count[brick] = (count[brick] || 0) + 1);
    
        return (
            <ul className="summary-list">
                {Object.entries(count).map(([size, num]) => (
                    <li key={size}>{num} brick{num > 1 ? "s" : ""} of {size}mm</li>
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

    // Determine progress bar color based on gap admittance
    const getProgressBarColor = () => {
        if (gaps < minGap) return "red";
        if (gaps >= minGap && gaps <= maxGap) return "green";
        return "yellow";
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

            <div className="toolbox-label">Toolbox</div>
                <div className="toolbox-frame">
                    {widths.map((el, index) => {
                        const possibleCount = Math.floor(remainingLength / el);
                        const isDisabled = possibleCount <= 0;

                        return (
                            <div
                                className="toolbox-brick"
                                key={el}
                                style={{
                                    width: `${24 + ((scaleWithPixels / screenWidth) * el)}px`,
                                    backgroundColor: getBrickColor(index),
                                    opacity: isDisabled ? 0.2 : 1,
                                    cursor: isDisabled ? "not-allowed" : "pointer" 
                                }}
                                onClick={() => !isDisabled && useBrick(el)}
                            >
                                {el} {possibleCount > 0 ? `(${possibleCount})` : ""}
                            </div>
                        );
                    })}
                </div>

            <div className="toolbox-label">Bench length is currently {benchLength}mm / Used length: {usedLength}mm</div>

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
                                    {benchBricks.map((el, index) => (
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
                                                            width: `${(el / benchLength) * 600}px`,
                                                            backgroundColor: getBrickColor(widths.indexOf(el)),
                                                            ...provided.draggableProps.style
                                                        }}
                                                        onClick={() => removeBrick(index)}
                                                    >
                                                        {el}
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
