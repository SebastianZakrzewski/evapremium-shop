"use client";

import React, { useState, useRef, useEffect, TouchEvent } from "react";
import Image from "next/image";

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
}

export function ImageZoom({ 
  src, 
  alt, 
  className = "", 
  priority = false,
  fill = false,
  sizes 
}: ImageZoomProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const lastTouchRef = useRef<{ distance: number; center: { x: number; y: number } } | null>(null);
  const lastTapRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const MIN_SCALE = 1;
  const MAX_SCALE = 3;
  const DOUBLE_TAP_DELAY = 300;

  // Reset zoom
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsZoomed(false);
  };

  // Calculate distance between two touches
  const getDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate center point between two touches
  const getCenter = (touch1: Touch, touch2: Touch): { x: number; y: number } => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

  // Handle touch start
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      // Single touch - prepare for drag or double tap
      const touch = e.touches[0];
      dragStartRef.current = { x: touch.clientX, y: touch.clientY };
      
      // Double tap detection
      const now = Date.now();
      const timeDiff = now - lastTapRef.current;
      
      if (timeDiff < DOUBLE_TAP_DELAY && isZoomed) {
        // Double tap when zoomed - reset zoom
        e.preventDefault();
        resetZoom();
        return;
      } else if (timeDiff < DOUBLE_TAP_DELAY && !isZoomed) {
        // Double tap when not zoomed - zoom in
        e.preventDefault();
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          setScale(MAX_SCALE);
          setPosition({ x: 0, y: 0 });
          setIsZoomed(true);
        }
        lastTapRef.current = 0;
        return;
      }
      
      lastTapRef.current = now;
      isDraggingRef.current = isZoomed;
    } else if (e.touches.length === 2) {
      // Two touches - pinch zoom
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = getDistance(touch1, touch2);
      const center = getCenter(touch1, touch2);
      
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        lastTouchRef.current = {
          distance,
          center: {
            x: center.x - rect.left,
            y: center.y - rect.top,
          },
        };
      }
    }
  };

  // Handle touch move
  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && isDraggingRef.current && isZoomed) {
      // Single touch drag when zoomed
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartRef.current.x;
      const deltaY = touch.clientY - dragStartRef.current.y;
      
      if (containerRef.current && imageRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const imageRect = imageRef.current.getBoundingClientRect();
        
        const maxX = (imageRect.width - containerRect.width) / 2;
        const maxY = (imageRect.height - containerRect.height) / 2;
        
        setPosition(prev => ({
          x: Math.max(-maxX, Math.min(maxX, prev.x + deltaX)),
          y: Math.max(-maxY, Math.min(maxY, prev.y + deltaY)),
        }));
      }
      
      dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    } else if (e.touches.length === 2) {
      // Pinch zoom
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = getDistance(touch1, touch2);
      
      if (lastTouchRef.current && containerRef.current) {
        const scaleChange = distance / lastTouchRef.current.distance;
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * scaleChange));
        
        const rect = containerRef.current.getBoundingClientRect();
        const currentCenter = getCenter(touch1, touch2);
        const centerX = currentCenter.x - rect.left;
        const centerY = currentCenter.y - rect.top;
        
        if (newScale !== scale) {
          setScale(newScale);
          setIsZoomed(newScale > MIN_SCALE);
          
          // Adjust position to keep pinch center point fixed
          const scaleDiff = newScale - scale;
          setPosition(prev => ({
            x: prev.x - (centerX - rect.width / 2) * scaleDiff * 0.5,
            y: prev.y - (centerY - rect.height / 2) * scaleDiff * 0.5,
          }));
        }
        
        // Update touch reference
        lastTouchRef.current = {
          distance,
          center: {
            x: centerX,
            y: centerY,
          },
        };
      }
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    lastTouchRef.current = null;
    
    // Snap back if zoomed out too much
    if (scale < MIN_SCALE) {
      resetZoom();
    }
  };

  // Reset zoom when image changes
  useEffect(() => {
    resetZoom();
  }, [src]);

  // Extract object-* classes from className to pass to Image
  const imageClasses = className.split(' ').filter(c => c.startsWith('object-') || c.startsWith('p-')).join(' ');
  const containerClasses = className.split(' ').filter(c => !c.startsWith('object-') && !c.startsWith('p-')).join(' ');

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden touch-none ${containerClasses}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        touchAction: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        ...(fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%' } : {}),
      }}
    >
      <div
        ref={imageRef}
        className={`relative transition-transform duration-200 ease-out will-change-transform ${
          fill ? 'w-full h-full' : 'w-full h-full'
        }`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {fill ? (
          <Image
            src={src}
            alt={alt}
            fill
            className={imageClasses || 'object-contain'}
            priority={priority}
            sizes={sizes}
            draggable={false}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={800}
            height={800}
            className={`w-full h-full ${imageClasses || 'object-contain'}`}
            priority={priority}
            sizes={sizes}
            draggable={false}
          />
        )}
      </div>
      
      {/* Zoom indicator */}
      {isZoomed && (
        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20 text-xs text-white z-10 animate-in fade-in duration-200">
          {Math.round(scale * 100)}%
        </div>
      )}
      
      {/* Reset button */}
      {isZoomed && (
        <button
          onClick={resetZoom}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 text-sm text-white z-10 hover:bg-black/90 active:scale-95 transition-all min-h-[44px] animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          Resetuj zoom
        </button>
      )}
    </div>
  );
}

