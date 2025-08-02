import React from 'react';
import { Svg, Rect, Text as SvgText } from 'react-native-svg';

interface Detection {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    confidence: number;
}

export default function DetectionOverlay({
    detections,
    width,
    height
}: {
    detections: Detection[];
    width: number;
    height: number;
}) {
    return (
        <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
            {detections.map((det, i) => (
                <React.Fragment key={i}>
                    <Rect
                        x={det.x}
                        y={det.y}
                        width={det.width}
                        height={det.height}
                        stroke="red"
                        strokeWidth="2"
                        fill="transparent"
                    />
                    <SvgText
                        x={det.x}
                        y={det.y > 10 ? det.y - 5 : det.y + 15}
                        fill="red"
                        fontSize="14"
                        fontWeight="bold"
                    >
                        {`${det.label} (${Math.round(det.confidence * 100)}%)`}
                    </SvgText>
                </React.Fragment>
            ))}
        </Svg>
    );
}
