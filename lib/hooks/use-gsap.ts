import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Hook for Top Bar Notice Board Marquee - Vanilla JS for smoothest loop
export const useMarquee = (speed = 50, items: any[] = []) => {
    const marqueeRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number | null>(null);
    const posRef = useRef(0);
    const isPaused = useRef(false);

    useEffect(() => {
        const container = marqueeRef.current;
        if (!container || !items.length) return;

        // Cleanup existing clones
        const clones = container.querySelectorAll('.js_clone');
        clones.forEach(clone => clone.remove());

        const originalItems = Array.from(container.querySelectorAll('.js_text'));
        if (!originalItems.length) return;

        let totalWidth = 0;
        originalItems.forEach((item: any) => {
            totalWidth += item.offsetWidth + (parseInt(window.getComputedStyle(item).marginRight) || 0);
        });

        // Clone items to ensure seamless loop
        originalItems.forEach((item: any) => {
            const clone = item.cloneNode(true) as HTMLElement;
            clone.classList.add('js_clone');
            clone.setAttribute('aria-hidden', 'true');
            container.appendChild(clone);
        });

        let lastTime = performance.now();

        const animate = (time: number) => {
            if (!isPaused.current) {
                const deltaTime = (time - lastTime) / 1000;
                posRef.current -= speed * deltaTime;

                if (Math.abs(posRef.current) >= totalWidth) {
                    posRef.current += totalWidth;
                }

                container.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
            }
            lastTime = time;
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [items, speed]);

    const handleMouseEnter = () => { isPaused.current = true; };
    const handleMouseLeave = () => { isPaused.current = false; };

    return { marqueeRef, handleMouseEnter, handleMouseLeave };
};

// Hook for Client Infinity Slide
export const useClientScroller = () => {
    const scrollerRefs = useRef<(HTMLDivElement | null)[]>([]);
    const animations = useRef<Record<number, { play: () => void; pause: () => void }>>({});

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        scrollerRefs.current.forEach((scroller, index) => {
            if (!scroller) return;

            scroller.setAttribute('data-animated', 'true');
            const inner = scroller.querySelector('.scroller__inner, .scroller__inner2') as HTMLElement;
            if (!inner) return;

            // Clone content for seamless looping
            const content = Array.from(inner.children) as HTMLElement[];
            content.forEach(item => {
                const duplicate = item.cloneNode(true) as HTMLElement;
                duplicate.setAttribute('aria-hidden', 'true');
                inner.appendChild(duplicate);
            });

            // Calculate total width
            let totalWidth = 0;
            content.forEach(item => {
                totalWidth += item.offsetWidth + (parseInt(window.getComputedStyle(item).marginRight) || 0);
            });

            const direction = scroller.dataset.direction === 'right' ? 1 : -1;
            const speed = scroller.dataset.speed === 'fast' ? 2 : 1;

            let position = 0;
            let animationId: number;

            const animate = () => {
                position += speed * direction;
                if (direction === -1 && -position >= totalWidth) {
                    position = 0;
                } else if (direction === 1 && position >= 0) {
                    position = -totalWidth;
                }
                inner.style.transform = `translateX(${position}px)`;
                animationId = requestAnimationFrame(animate);
            };

            const startAnimation = () => {
                if (!animationId) animate();
            };

            const stopAnimation = () => {
                cancelAnimationFrame(animationId);
                // @ts-ignore
                animationId = null;
            };

            animations.current[index] = { play: startAnimation, pause: stopAnimation };
            startAnimation();
        });

        return () => {
            Object.values(animations.current).forEach(anim => anim.pause());
        };
    }, []);

    const handleMouseEnter = (index: number) => animations.current[index]?.pause();
    const handleMouseLeave = (index: number) => animations.current[index]?.play();

    return { scrollerRefs, handleMouseEnter, handleMouseLeave };
};

// Hook for Vertical Notice Board Scrolling
export const useVerticalNotice = (items: any[] = []) => {
    const noticeRef = useRef<HTMLUListElement>(null);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);

    useEffect(() => {
        if (!noticeRef.current || !items.length) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const notice = noticeRef.current;
        const listItems = Array.from(notice.querySelectorAll('li')) as HTMLElement[];
        if (!listItems.length) return;

        // Reset
        if (timelineRef.current) timelineRef.current.kill();
        notice.style.transform = 'translateY(0)';
        
        // Remove clones if any
        const existingClones = notice.querySelectorAll('[aria-hidden="true"]');
        existingClones.forEach(clone => clone.remove());

        let totalHeight = 0;
        listItems.forEach(item => {
            totalHeight += item.offsetHeight;
        });

        // Clone items
        listItems.forEach(item => {
            const clone = item.cloneNode(true) as HTMLElement;
            clone.setAttribute('aria-hidden', 'true');
            notice.appendChild(clone);
        });

        const tl = gsap.timeline({ repeat: -1 });
        tl.to(notice, {
            y: -totalHeight,
            duration: totalHeight / 50,
            ease: 'none',
            onRepeat: () => {
                gsap.set(notice, { y: 0 });
            },
        });

        timelineRef.current = tl;

        return () => {
            tl.kill();
        };
    }, [items]);

    const handleMouseEnter = () => timelineRef.current?.pause();
    const handleMouseLeave = () => timelineRef.current?.play();

    return { noticeRef, handleMouseEnter, handleMouseLeave };
};

// Hook for Counter Animations
export const useCounter = (counters: { id: string; target: number }[], triggerRef: React.RefObject<HTMLElement>) => {
    const counterRefs = useRef<Record<string, HTMLElement>>({});

    useEffect(() => {
        if (!triggerRef.current) return;

        const ctx = gsap.context(() => {
            counters.forEach((counter) => {
                const element = counterRefs.current[counter.id];
                if (!element) return;

                gsap.fromTo(element, 
                    { innerText: 0 }, 
                    { 
                        innerText: counter.target, 
                        duration: 2, 
                        ease: 'power1.out',
                        snap: { innerText: 1 },
                        scrollTrigger: {
                            trigger: triggerRef.current,
                            start: 'top 80%',
                            toggleActions: 'play none none none'
                        },
                        onUpdate: function() {
                            const current = Math.floor(Number(this.targets()[0].innerText));
                            if (counter.target >= 1000) {
                                element.textContent = (current / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
                            } else {
                                element.textContent = current.toString();
                            }
                        }
                    }
                );
            });
        }, triggerRef);

        return () => ctx.revert();
    }, [counters, triggerRef]);

    return { counterRefs };
};
