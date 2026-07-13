"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.2;

export function useImageZoomPan({ enabled = true, resetDeps = [] } = {}) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [containerEl, setContainerEl] = useState(null);
  const dragState = useRef({ startX: 0, startY: 0, originX: 0, originY: 0 });
  const scaleRef = useRef(1);
  const positionRef = useRef({ x: 0, y: 0 });

  const containerRef = useCallback((node) => {
    setContainerEl(node);
  }, []);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  const resetTransform = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    resetTransform();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  useEffect(() => {
    if (!enabled || !containerEl) return undefined;

    const onWheel = (event) => {
      event.preventDefault();
      event.stopPropagation();

      const direction = event.deltaY > 0 ? -1 : 1;
      const currentScale = scaleRef.current;
      const nextScale = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, currentScale + direction * ZOOM_STEP)
      );

      if (nextScale === currentScale) return;

      const rect = containerEl.getBoundingClientRect();
      const offsetX = event.clientX - rect.left - rect.width / 2;
      const offsetY = event.clientY - rect.top - rect.height / 2;
      const ratio = nextScale / currentScale;
      const currentPosition = positionRef.current;

      setPosition({
        x: currentPosition.x - offsetX * (ratio - 1),
        y: currentPosition.y - offsetY * (ratio - 1),
      });
      setScale(nextScale);
    };

    containerEl.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => containerEl.removeEventListener("wheel", onWheel, { capture: true });
  }, [enabled, containerEl]);

  useEffect(() => {
    if (!isDragging) return undefined;

    const onMouseMove = (event) => {
      const { startX, startY, originX, originY } = dragState.current;
      setPosition({
        x: originX + (event.clientX - startX),
        y: originY + (event.clientY - startY),
      });
    };

    const onMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = useCallback(
    (event) => {
      if (!enabled || event.button !== 0) return;
      setIsDragging(true);
      dragState.current = {
        startX: event.clientX,
        startY: event.clientY,
        originX: positionRef.current.x,
        originY: positionRef.current.y,
      };
    },
    [enabled]
  );

  const zoomIn = useCallback(() => {
    setScale((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP));
  }, []);

  const cursorClass = !enabled
    ? ""
    : isDragging
      ? "cursor-grabbing"
      : scale > 1
        ? "cursor-grab"
        : "cursor-default";

  return {
    scale,
    position,
    isDragging,
    containerRef,
    resetTransform,
    handleMouseDown,
    zoomIn,
    zoomOut,
    cursorClass,
    MIN_ZOOM,
    MAX_ZOOM,
    ZOOM_STEP,
  };
}
