import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import SplitType from 'split-type';
import { Pane } from 'tweakpane';

import { LandingPageEvent } from '@/types';
import { eventsData, imageUrls } from '@/data/events';

gsap.registerPlugin(CustomEase);
CustomEase.create("hop", "0.9, 0, 0.1, 1");

interface ActiveItem extends LandingPageEvent {
  rect: DOMRect;
}

const LandingPage: React.FC = () => {
  const [visibleItems, setVisibleItems] = useState<LandingPageEvent[]>([]);
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const projectTitleRef = useRef<HTMLParagraphElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const paneInstanceRef = useRef<Pane | null>(null);
  const titleSplitRef = useRef<SplitType | null>(null);

  const settingsRef = useRef({
    baseWidth: 400, smallHeight: 330, largeHeight: 500, itemGap: 65,
    hoverScale: 1.05, expandedScale: 0.4, dragEase: 0.075, momentumFactor: 200,
    bufferZone: 3, borderRadius: 12, vignetteSize: 5, vignetteStrength: 1,
    pageVignetteSize: 250, overlayOpacity: 0.9, overlayEaseDuration: 1, zoomDuration: 0.5,
  });

  const animationState = useRef({
    isDragging: false, startX: 0, startY: 0, targetX: 0, targetY: 0,
    currentX: 0, currentY: 0, dragVelocityX: 0, dragVelocityY: 0,
    lastDragTime: 0, mouseHasMoved: false, lastUpdateTime: 0, lastX: 0, lastY: 0,
    canDrag: true, animationFrameId: 0,
  });

  const updateCSSVariable = (name: string, value: string) => {
    document.documentElement.style.setProperty(name, value);
  };

  const updateAllStyles = useCallback(() => {
    const settings = settingsRef.current;
    updateCSSVariable('--border-radius', `${settings.borderRadius}px`);
    updateCSSVariable('--vignette-size', `${settings.vignetteSize}px`);
    updateCSSVariable('--hover-scale', `${settings.hoverScale}`);

    const strength = settings.vignetteStrength;
    const size = settings.pageVignetteSize;
    updateCSSVariable('--page-vignette-size', `${size * 1.5}px`);
    updateCSSVariable('--page-vignette-color', `rgba(0,0,0,${strength * 0.7})`);
    updateCSSVariable('--page-vignette-strong-size', `${size * 0.75}px`);
    updateCSSVariable('--page-vignette-strong-color', `rgba(0,0,0,${strength * 0.85})`);
    updateCSSVariable('--page-vignette-extreme-size', `${size * 0.4}px`);
    updateCSSVariable('--page-vignette-extreme-color', `rgba(0,0,0,${strength})`);
  }, []);

  const updateVisibleItems = useCallback(() => {
    const { currentX, currentY } = animationState.current;
    const settings = settingsRef.current;
    const buffer = settings.bufferZone;
    const viewWidth = window.innerWidth * (1 + buffer);
    const viewHeight = window.innerHeight * (1 + buffer);

    const itemSizes = [{ width: settings.baseWidth, height: settings.smallHeight }, { width: settings.baseWidth, height: settings.largeHeight }];
    const cellWidth = settings.baseWidth + settings.itemGap;
    const cellHeight = Math.max(settings.smallHeight, settings.largeHeight) + settings.itemGap;
    const columns = 4;

    const startCol = Math.floor((-currentX - viewWidth / 2) / cellWidth);
    const endCol = Math.ceil((-currentX + viewWidth * 1.5) / cellWidth);
    const startRow = Math.floor((-currentY - viewHeight / 2) / cellHeight);
    const endRow = Math.ceil((-currentY + viewHeight * 1.5) / cellHeight);

    const newVisibleItems: LandingPageEvent[] = [];
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const id = `${col},${row}`;
        const sizeIndex = Math.abs((row * columns + col) % itemSizes.length);
        const itemSize = itemSizes[sizeIndex];
        const position = { x: col * cellWidth, y: row * cellHeight };
        const itemNum = Math.abs((row * columns + col) % eventsData.length);

        newVisibleItems.push({
          id, col, row, ...position, ...itemSize,
          imgSrc: imageUrls[itemNum % imageUrls.length],
          title: eventsData[itemNum],
          itemNum,
        });
      }
    }
    setVisibleItems(newVisibleItems);
  }, []);

  const animateTitle = useCallback((direction: 'in' | 'out') => {
    if (!titleSplitRef.current?.words) return;
    const y = direction === 'in' ? '0%' : '-100%';
    const fromY = direction === 'in' ? '100%' : '0%';
    gsap.fromTo(titleSplitRef.current.words,
      { y: fromY, opacity: 0 },
      { y, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out' }
    );
  }, []);

  const handleItemClick = useCallback((item: LandingPageEvent, e: React.MouseEvent) => {
    if (animationState.current.mouseHasMoved || isExpanded) return;
    
    const target = e.currentTarget as HTMLDivElement;
    const rect = target.getBoundingClientRect();
    
    setIsExpanded(true);
    animationState.current.canDrag = false;
    if (containerRef.current) containerRef.current.style.cursor = 'auto';
    
    setActiveItem({ ...item, rect });
    
    setIsOverlayVisible(true);
    gsap.to(overlayRef.current, { opacity: settingsRef.current.overlayOpacity, duration: settingsRef.current.overlayEaseDuration, ease: 'power2.inOut' });
    gsap.to('.grid-item', { opacity: (_: number, el: Element) => (el === target ? 1 : 0), duration: settingsRef.current.overlayEaseDuration, ease: 'power2.inOut' });

    const caption = target.querySelector('.item-caption');
    if (caption) gsap.to(caption, { opacity: 0, duration: 0.3 });

    if (projectTitleRef.current) {
        if (titleSplitRef.current) titleSplitRef.current.revert();
        projectTitleRef.current.textContent = item.title;
        titleSplitRef.current = new SplitType(projectTitleRef.current, { types: 'words' });
        gsap.set(titleSplitRef.current.words, { y: '100%' });
        gsap.delayedCall(0.5, () => animateTitle('in'));
    }
  }, [isExpanded, animateTitle]);

  const closeExpandedItem = useCallback(() => {
    if (!activeItem) return;

    animateTitle('out');
    gsap.to(overlayRef.current, { opacity: 0, duration: settingsRef.current.overlayEaseDuration, ease: 'power2.inOut', onComplete: () => setIsOverlayVisible(false) });
    
    const expandedEl = document.getElementById('expanded-item-clone');
    if (expandedEl) {
        gsap.to(expandedEl, {
            width: activeItem.width,
            height: activeItem.height,
            x: activeItem.rect.left + activeItem.width / 2 - window.innerWidth / 2,
            y: activeItem.rect.top + activeItem.height / 2 - window.innerHeight / 2,
            duration: settingsRef.current.zoomDuration,
            ease: 'hop',
            onComplete: () => {
                setActiveItem(null);
                setIsExpanded(false);
                animationState.current.canDrag = true;
                if (containerRef.current) containerRef.current.style.cursor = 'grab';
                
                gsap.to('.grid-item', { opacity: 1, duration: settingsRef.current.overlayEaseDuration, delay: 0.2, ease: 'power2.inOut' });
                
                const originalItemEl = document.getElementById(activeItem.id);
                if (originalItemEl) {
                    const caption = originalItemEl.querySelector('.item-caption');
                    if (caption) gsap.to(caption, { opacity: 1, duration: 0.5, delay: 0.3 });
                }
            }
        });
    }
  }, [activeItem, animateTitle]);

  const initialize = useCallback(() => {
    updateAllStyles();
    updateVisibleItems();

    const state = animationState.current;
    const animate = () => {
      if (state.canDrag) {
        const ease = settingsRef.current.dragEase;
        state.currentX += (state.targetX - state.currentX) * ease;
        state.currentY += (state.targetY - state.currentY) * ease;
        if (canvasRef.current) {
          canvasRef.current.style.transform = `translate(${state.currentX}px, ${state.currentY}px)`;
        }

        const now = Date.now();
        const distMoved = Math.sqrt(Math.pow(state.currentX - state.lastX, 2) + Math.pow(state.currentY - state.lastY, 2));
        if (distMoved > 100 || now - state.lastUpdateTime > 120) {
          updateVisibleItems();
          state.lastX = state.currentX;
          state.lastY = state.currentY;
          state.lastUpdateTime = now;
        }
      }
      state.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }, [updateAllStyles, updateVisibleItems]);

  useEffect(() => {
    initialize();
    
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.key === 'h' || e.key === 'H') && paneInstanceRef.current) {
            const paneEl = paneInstanceRef.current.element;
            paneEl.style.display = paneEl.style.display === 'none' ? '' : 'none';
        }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animationState.current.animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      if (paneInstanceRef.current) {
        paneInstanceRef.current.dispose();
        paneInstanceRef.current = null;
      }
    };
  }, [initialize]);

  useEffect(() => {
    const state = animationState.current;
    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      if (!state.canDrag) return;
      state.isDragging = true;
      state.mouseHasMoved = false;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      state.startX = clientX;
      state.startY = clientY;
      if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!state.isDragging || !state.canDrag) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const dx = clientX - state.startX;
      const dy = clientY - state.startY;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        state.mouseHasMoved = true;
      }

      const now = Date.now();
      const dt = Math.max(10, now - state.lastDragTime);
      state.lastDragTime = now;
      state.dragVelocityX = dx / dt;
      state.dragVelocityY = dy / dt;

      state.targetX += dx;
      state.targetY += dy;
      state.startX = clientX;
      state.startY = clientY;
    };

    const handleMouseUp = () => {
      if (!state.isDragging) return;
      state.isDragging = false;
      if (state.canDrag) {
        if (containerRef.current) containerRef.current.style.cursor = 'grab';
        if (Math.abs(state.dragVelocityX) > 0.1 || Math.abs(state.dragVelocityY) > 0.1) {
          state.targetX += state.dragVelocityX * settingsRef.current.momentumFactor;
          state.targetY += state.dragVelocityY * settingsRef.current.momentumFactor;
        }
      }
    };

    const cont = containerRef.current;
    cont?.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    cont?.addEventListener('touchstart', handleMouseDown, { passive: true });
    window.addEventListener('touchmove', handleMouseMove, { passive: true });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      cont?.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      cont?.removeEventListener('touchstart', handleMouseDown);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (isExpanded && activeItem) {
        const expandedEl = document.createElement('div');
        expandedEl.id = 'expanded-item-clone';
        expandedEl.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black overflow-hidden cursor-pointer z-[10000]';
        expandedEl.style.borderRadius = `var(--border-radius)`;
        
        const img = document.createElement('img');
        img.src = activeItem.imgSrc;
        img.className = 'w-full h-full object-cover pointer-events-none';
        expandedEl.appendChild(img);
        document.body.appendChild(expandedEl);

        expandedEl.addEventListener('click', closeExpandedItem);

        const viewportWidth = window.innerWidth;
        const targetWidth = viewportWidth * settingsRef.current.expandedScale;
        const aspectRatio = activeItem.height / activeItem.width;
        const targetHeight = targetWidth * aspectRatio;

        gsap.fromTo(expandedEl,
            {
                width: activeItem.width,
                height: activeItem.height,
                x: activeItem.rect.left + activeItem.width / 2 - window.innerWidth / 2,
                y: activeItem.rect.top + activeItem.height / 2 - window.innerHeight / 2,
            },
            {
                width: targetWidth,
                height: targetHeight,
                x: 0,
                y: 0,
                duration: settingsRef.current.zoomDuration,
                ease: 'hop',
            }
        );
    } else {
        const el = document.getElementById('expanded-item-clone');
        if (el) {
            el.removeEventListener('click', closeExpandedItem);
            el.remove();
        }
    }
  }, [isExpanded, activeItem, closeExpandedItem]);

  return (
    <div className="min-h-screen bg-black text-white select-none">
      <a href="https://ioit.acm.org/" target='_blank'>
        <img src="https://ioit.acm.org/static/img/assets/acm.png" alt="IOIT ACM LOGO" className='fixed h-12 w-12 top-5 left-5 z-[999999999999]' />
      </a>
      <div ref={containerRef} className="relative w-screen h-screen overflow-hidden cursor-grab">
        <div ref={canvasRef} id="canvas" className="absolute will-change-transform">
          {visibleItems.map(item => (
            <div
              key={item.id}
              id={item.id}
              className="grid-item group absolute bg-black overflow-hidden cursor-pointer"
              style={{
                left: `${item.x}px`,
                top: `${item.y}px`,
                width: `${item.width}px`,
                height: `${item.height}px`,
                borderRadius: `var(--border-radius)`,
                visibility: activeItem && activeItem.id === item.id ? 'hidden' : 'visible',
              }}
              onClick={(e) => handleItemClick(item, e)}
            >
              <div className="w-full h-full overflow-hidden relative after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:z-[1]" style={{ boxShadow: `inset 0 0 var(--vignette-size) rgba(0,0,0,0.5)` }}>
                <img
                  src={item.imgSrc}
                  alt={item.title}
                  className="w-full h-full object-cover pointer-events-none transition-transform duration-300 ease-in-out group-hover:scale-[var(--hover-scale)]"
                />
              </div>
              <div className="item-caption absolute bottom-0 left-0 w-full p-2.5 z-[2] transition-opacity duration-300">
                <div className="text-xs font-medium uppercase tracking-[-0.03em] mb-0.5 relative overflow-hidden h-4">{item.title}</div>
                <div className="font-mono text-[#888] text-[10px] font-normal relative overflow-hidden h-3.5">#{String(item.itemNum + 1).padStart(5, '0')}</div>
              </div>
            </div>
          ))}
        </div>
        <div ref={overlayRef} id="overlay" className={`fixed inset-0 bg-black z-[9999] transition-opacity duration-500 ${isOverlayVisible ? 'opacity-90' : 'opacity-0 pointer-events-none'}`} onClick={closeExpandedItem}></div>
      </div>

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-[10002]">
        <p ref={projectTitleRef} className="relative h-[42px] text-white overflow-hidden text-[36px] tracking-[-0.03em] uppercase"></p>
      </div>

      <div className="fixed inset-0 pointer-events-none z-[9998]">
        <div className="absolute inset-0" style={{ boxShadow: `inset 0 0 var(--page-vignette-size) var(--page-vignette-color)` }}></div>
        <div className="absolute inset-0" style={{ boxShadow: `inset 0 0 var(--page-vignette-strong-size) var(--page-vignette-strong-color)` }}></div>
        <div className="absolute inset-0" style={{ boxShadow: `inset 0 0 var(--page-vignette-extreme-size) var(--page-vignette-extreme-color)` }}></div>
      </div>

      <footer className="fixed bottom-0 left-0 w-full p-6 z-[1000] grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="font-mono md:text-sm text-xs">
          <p>18.52043° N, 73.856744° E</p>
        </div>
        <div className="text-right font-mono md:text-sm text-xs">
          <p>Est. 2019 • AISSMS IOIT ACM Student Chapter</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;