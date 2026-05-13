import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import html2canvas from 'html2canvas';

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Hook for Top Bar Notice Board Marquee
export const useMarquee = (speed = 70, items = []) => {
    const marqueeRef = useRef(null);
    const [animation, setAnimation] = useState(null);

    useEffect(() => {
        const container = marqueeRef.current;
        if (!container) return;

        // Clear existing clones
        while (container.childNodes.length > items.length) {
            container.removeChild(container.lastChild);
        }

        const itemElements = container.querySelectorAll('.js_text');
        if (!itemElements.length) return;

        let totalWidth = 0;
        itemElements.forEach(item => {
            const itemWidth = item.offsetWidth;
            const itemMargin = parseInt(window.getComputedStyle(item).marginRight) || 0;
            totalWidth += itemWidth + itemMargin;
        });

        // Clone items for seamless scrolling
        const clones = [];
        itemElements.forEach(item => {
            const clone = item.cloneNode(true);
            clones.push(clone);
            container.appendChild(clone);
        });

        let position = 0;
        let animationId;

        const animate = () => {
            position -= 1;
            if (-position >= totalWidth) position = 0; // Reset when half the total width is scrolled
            container.style.transform = `translateX(${position}px)`;
            animationId = requestAnimationFrame(animate);
        };

        const startAnimation = () => {
            if (!animationId) animate();
        };

        const stopAnimation = () => {
            cancelAnimationFrame(animationId);
            animationId = null;
        };

        setAnimation({ play: startAnimation, pause: stopAnimation });
        startAnimation();

        return () => stopAnimation();
    }, [speed, items]); // Re-run when items change

    const handleMouseEnter = () => animation?.pause();
    const handleMouseLeave = () => animation?.play();

    return { marqueeRef, handleMouseEnter, handleMouseLeave };
};

// Hook for Client Infinity Slide
export const useClientScroller = () => {
    const scrollerRefs = useRef([]);
    const animations = useRef({});

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        scrollerRefs.current.forEach((scroller, index) => {
            if (!scroller) return;

            scroller.setAttribute('data-animated', 'true');
            const inner = scroller.querySelector('.scroller__inner, .scroller__inner2');
            if (!inner) return;

            // Clone content for seamless looping
            const content = Array.from(inner.children);
            content.forEach(item => {
                const duplicate = item.cloneNode(true);
                duplicate.setAttribute('aria-hidden', 'true');
                inner.appendChild(duplicate);
            });

            // Calculate total width
            let totalWidth = 0;
            content.forEach(item => {
                const itemWidth = item.offsetWidth;
                const itemMargin = parseInt(window.getComputedStyle(item).marginRight) || 0;
                totalWidth += itemWidth + itemMargin;
            });

            // Get direction and speed from data attributes
            const direction = scroller.dataset.direction === 'right' ? 1 : -1;
            const speed = scroller.dataset.speed === 'fast' ? 2 : 1;

            // Animation logic
            let position = 0;
            let animationId;

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
                animationId = null;
            };

            animations.current[index] = { play: startAnimation, pause: stopAnimation };
            startAnimation();
        });

        return () => {
            Object.values(animations.current).forEach(anim => anim.pause());
        };
    }, []);

    const handleMouseEnter = (index) => animations.current[index]?.pause();
    const handleMouseLeave = (index) => animations.current[index]?.play();

    return { scrollerRefs, handleMouseEnter, handleMouseLeave };
};

// Hook for Vertical Notice Board Scrolling
export const useVerticalNotice = () => {
    const noticeRef = useRef(null);
    const timelineRef = useRef(null);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const notice = noticeRef.current;
        if (!notice) return;

        const items = notice.querySelectorAll('li');
        if (!items.length) return;

        // Calculate total height
        let totalHeight = 0;
        items.forEach(item => {
            totalHeight += item.offsetHeight;
        });

        // Clone items for seamless looping
        const clones = [];
        items.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clones.push(clone);
            notice.appendChild(clone);
        });

        // GSAP animation
        const tl = gsap.timeline({ repeat: -1, paused: true });
        tl.to(notice, {
            y: -totalHeight,
            duration: totalHeight / 50, // Adjust speed: 50px per second
            ease: 'none', // Linear for continuous scrolling
            onRepeat: () => {
                gsap.set(notice, { y: 0 }); // Reset position instantly
            },
        });

        timelineRef.current = tl;
        tl.play();

        return () => {
            tl.kill();
        };
    }, []);

    const handleMouseEnter = () => {
        if (timelineRef.current) timelineRef.current.pause();
    };

    const handleMouseLeave = () => {
        if (timelineRef.current) timelineRef.current.play();
    };

    return { noticeRef, handleMouseEnter, handleMouseLeave };
};

// Hook for Home and About Page Counters
export const useCounter = (selector, isAboutPage = false) => {
    const statsRef = useRef(null);

    useEffect(() => {
        const stats = statsRef.current;
        if (!stats) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    const counters = stats.querySelectorAll(selector);
                    const duration = 4000;
                    const frameRate = 60;
                    const interval = duration / frameRate;

                    counters.forEach(counter => {
                        const target = parseInt(counter.getAttribute('data-target'), 10);
                        let current = 0;
                        const increment = target / (duration / interval);

                        const formatNumber = (number) => {
                            if (isAboutPage && number >= 1000) {
                                return (number / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
                            }
                            return Math.floor(number);
                        };

                        const updateCounter = () => {
                            current += increment;
                            if (current >= target) {
                                counter.textContent = formatNumber(target);
                            } else {
                                counter.textContent = formatNumber(current);
                                setTimeout(updateCounter, interval);
                            }
                        };

                        updateCounter();
                    });
                    observer.disconnect();
                }
            },
            { threshold: 1 }
        );

        observer.observe(stats);
        return () => observer.disconnect();
    }, [selector, isAboutPage]);

    return statsRef;
};

// Hook for Home About Section Counter
export const useAboutCounter = () => {
    const counterSectionRef = useRef(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const section = counterSectionRef.current;
            if (!section || hasAnimated) return;

            const sectionPosition = section.getBoundingClientRect().top;
            const screenHeight = window.innerHeight;

            if (sectionPosition < screenHeight) {
                setHasAnimated(true);
                const counters = section.querySelectorAll('.counters');
                const duration = 4000;
                const interval = 20;
                const steps = duration / interval;

                counters.forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    let current = 0;
                    const increment = target / steps;
                    const isKFormat = counter.id !== 'counter_box3';

                    const formatNumber = (num, format) => {
                        if (format && num >= 1000) {
                            return `${(num / 1000).toFixed(1)}K`.replace('.0', '');
                        }
                        return num;
                    };

                    const updateCounter = () => {
                        current += increment;
                        if (current >= target) {
                            counter.innerText = formatNumber(target, isKFormat);
                        } else {
                            counter.innerText = formatNumber(Math.ceil(current), isKFormat);
                            setTimeout(updateCounter, interval);
                        }
                    };

                    updateCounter();
                });
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasAnimated]);

    return counterSectionRef;
};

// Hook for GSAP Animations
export const useGsapAnimation = (animations) => {
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        animations.forEach(({ selector, from, to, scrollTrigger, timeline }) => {
            const elements = document.querySelectorAll(selector);
            if (!elements.length) return;

            if (timeline) {
                // Handle timeline-based animations (e.g., for .icon and .date dash effect)
                elements.forEach((element) => {
                    const tl = gsap.timeline({ repeat: -1 });
                    timeline(tl, element);
                });
            } else {
                // Handle scroll-based animations
                gsap.fromTo(
                    selector,
                    { ...from },
                    { ...to, scrollTrigger: scrollTrigger || { trigger: selector, start: 'top 80%', end: 'top 50%', toggleActions: 'play none none none' } }
                );
            }
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            gsap.killTweensOf('*');
        };
    }, [animations]);
};

// GSAP Animation Configurations
export const gsapAnimations = [
    // Home About Counters
    { selector: '.counter_box1', from: { x: '100%', opacity: 0 }, to: { x: '0%', opacity: 1, duration: 1 }, scrollTrigger: { trigger: '.counter_box1', start: 'top 80%', end: 'top 50%', toggleActions: 'play none none none' } },
    { selector: '.counter_box2', from: { x: '-100%', opacity: 0 }, to: { x: '0%', opacity: 1, duration: 1 }, scrollTrigger: { trigger: '.counter_box2', start: 'top 80%', end: 'top 50%', toggleActions: 'play none none none' } },
    { selector: '.counter_box3', from: { y: '-100%', opacity: 0 }, to: { y: '0%', opacity: 1, duration: 1 }, scrollTrigger: { trigger: '.counter_box3', start: 'top 80%', end: 'top 50%', toggleActions: 'play none none none' } },
    // Home Page
    { selector: '.notice_board', from: { y: '30%', opacity: 0 }, to: { y: '0%', opacity: 1, duration: 1 }, scrollTrigger: { trigger: '.notice_board', start: 'top 80%', end: 'top 50%', toggleActions: 'play none none none' } },
    { selector: '.hero .theame', from: { x: '-30%', opacity: 0 }, to: { x: '0%', opacity: 1, duration: 1 }, scrollTrigger: { trigger: '.hero .theame', start: 'top 80%', end: 'top 50%', toggleActions: 'play none none none' } },
    { selector: '.offer', from: { y: '20%', opacity: 0 }, to: { y: '0%', opacity: 1, duration: 1 }, scrollTrigger: { trigger: '.offer', start: 'top 100%', end: 'top 20%', toggleActions: 'play none none none' } },
    { selector: '.offer .icon', timeline: (tl, element) => {
            tl.to(element, {
                backgroundPosition: '100% 0%, 0% 100%, 0% 0%, 100% 100%',
                duration: 5,
                ease: 'linear',
                repeat: -1,
            });
        }
    },
    { selector: '.hero .notice .date', timeline: (tl, element) => {
            tl.to(element, {
                backgroundPosition: '100% 0%, 100% 100%, 0% 100%, 100% 0%',
                duration: 5,
                ease: 'linear',
                repeat: -1,
            });
        }
    },
    { selector: '.Our_project', from: { y: '20%', opacity: 0 }, to: { y: '0%', opacity: 1, duration: 1 }, scrollTrigger: { trigger: '.Our_project', start: 'top 100%', end: 'top 20%', toggleActions: 'play none none none' } },
    // Contact Us Page
    { selector: '.contact_us .breadcrumb', from: { x: '-30%', opacity: 0 }, to: { x: '0%', opacity: 1, duration: 1 }, scrollTrigger: { trigger: '.contact_us .breadcrumb', start: 'top 80%', end: 'top 50%', toggleActions: 'play none none none' } },
    { selector: '.contact_us .contact_theame', from: { x: '30%', opacity: 0 }, to: { x: '0%', opacity: 1, duration: 1 }, scrollTrigger: { trigger: '.contact_us .contact_theame', start: 'top 80%', end: 'top 50%', toggleActions: 'play none none none' } },
    { selector: '.cta_section .cta', from: { y: '30%', opacity: 0 }, to: { y: '0%', opacity: 1, duration: 1 }, scrollTrigger: { trigger: '.cta_section .cta', start: 'top 80%', end: 'top 50%', toggleActions: 'play none none none' } },
    { selector: '.about_us .wrapper', from: { x: '-30%', opacity: 0 }, to: { x: '0%', opacity: 1, duration: 1 }, scrollTrigger: { trigger: '.contact_us .breadcrumb', start: 'top 80%', end: 'top 50%', toggleActions: 'play none none none' } },
    { selector: '.about_us .contact_theame', from: { x: '30%', opacity: 0 }, to: { x: '0%', opacity: 1, duration: 1 }, scrollTrigger: { trigger: '.contact_us .contact_theame', start: 'top 80%', end: 'top 50%', toggleActions: 'play none none none' } },
    // Notice Single Page
    { selector: '.single_notice', from: { y: '30%', opacity: 0 }, to: { y: '0%', opacity: 1, duration: 1 }, scrollTrigger: { trigger: '.single_notice', start: 'top 80%', end: 'top 50%', toggleActions: 'play none none none' } },
    // About Page
    { selector: '.our_mission .images1 .small', from: { x: '30%', opacity: 0 }, to: { x: '0%', opacity: 1, duration: 1 }, scrollTrigger: { trigger: '.our_mission .images1 .small', start: 'top 80%', end: 'top 50%', toggleActions: 'play none none none' } },
    { selector: '.our_mission .images2 .small', from: { x: '-30%', opacity: 0 }, to: { x: '0%', opacity: 1, duration: 1 }, scrollTrigger: { trigger: '.our_mission .images2 .small', start: 'top 80%', end: 'top 50%', toggleActions: 'play none none none' } },
    { selector: '.our_mission .heading_wrap', from: { y: '30%', opacity: 0 }, to: { y: '0%', opacity: 1, duration: 1 }, scrollTrigger: { trigger: '.our_mission .heading_wrap', start: 'top 100%', end: 'top 50%', toggleActions: 'play none none none' } },
    { selector: '.our_mission .heading_wrap2', from: { y: '30%', opacity: 0 }, to: { y: '0%', opacity: 1, duration: 1 }, scrollTrigger: { trigger: '.our_mission .heading_wrap2', start: 'top 100%', end: 'top 50%', toggleActions: 'play none none none' } },
    { selector: '.team', from: { y: '30%', opacity: 0 }, to: { y: '0%', opacity: 1, duration: 1 }, scrollTrigger: { trigger: '.team', start: 'top 100%', end: 'top 50%', toggleActions: 'play none none none' } },
];

// Hook for Notice Single Page Functionality
export const useNoticeSingle = () => {
    const viewerRefs = useRef([]);
    const [menuOpen, setMenuOpen] = useState(null);

    const toggleMenu = (index) => {
        setMenuOpen(prev => prev === index ? null : index);
    };

    const handleClickOutside = (e) => {
        if (!e.target.closest('.relative')) {
            setMenuOpen(null);
        }
    };

    const downloadViewerImage = (viewerBox) => {
        if (viewerBox) {
            html2canvas(viewerBox).then(canvas => {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = 'viewer-content.png';
                link.click();
            });
        }
    };

    useEffect(() => {
        window.addEventListener('click', handleClickOutside);
        viewerRefs.current.forEach((viewer, index) => {
            if (!viewer) return;

            const zoomContainer = viewer.querySelector('.zoom-container');
            let scale = 1;
            let startX = 0;
            let startY = 0;
            let currentX = 0;
            let currentY = 0;
            let isDragging = false;
            let initialDistance = null;

            const applyTransform = () => {
                zoomContainer.style.transform = `scale(${scale}) translate(${currentX}px, ${currentY}px)`;
            };

            const getDistance = (t1, t2) => {
                const dx = t1.clientX - t2.clientX;
                const dy = t1.clientY - t2.clientY;
                return Math.sqrt(dx * dx + dy * dy);
            };

            const handleWheel = (e) => {
                e.preventDefault();
                scale += e.deltaY > 0 ? -0.1 : 0.1;
                scale = Math.min(Math.max(0.5, scale), 5);
                applyTransform();
            };

            const handleMouseDown = (e) => {
                isDragging = true;
                startX = e.clientX - currentX;
                startY = e.clientY - currentY;
                viewer.style.cursor = 'grabbing';
            };

            const handleMouseMove = (e) => {
                if (!isDragging) return;
                currentX = e.clientX - startX;
                currentY = e.clientY - startY;
                applyTransform();
            };

            const handleMouseUp = () => {
                isDragging = false;
                viewer.style.cursor = 'grab';
            };

            const handleTouchStart = (e) => {
                if (e.touches.length === 1) {
                    startX = e.touches[0].clientX - currentX;
                    startY = e.touches[0].clientY - currentY;
                    isDragging = true;
                } else if (e.touches.length === 2) {
                    initialDistance = getDistance(e.touches[0], e.touches[1]);
                }
            };

            const handleTouchMove = (e) => {
                if (e.touches.length === 1 && isDragging) {
                    currentX = e.touches[0].clientX - startX;
                    currentY = e.touches[0].clientY - startY;
                    applyTransform();
                } else if (e.touches.length === 2 && initialDistance !== null) {
                    const newDistance = getDistance(e.touches[0], e.touches[1]);
                    scale = Math.min(Math.max(scale * (newDistance / initialDistance), 0.5), 5);
                    initialDistance = newDistance;
                    applyTransform();
                }
            };

            const handleTouchEnd = () => {
                isDragging = false;
                initialDistance = null;
            };

            viewer.addEventListener('wheel', handleWheel, { passive: false });
            viewer.addEventListener('mousedown', handleMouseDown);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            viewer.addEventListener('touchstart', handleTouchStart, { passive: false });
            viewer.addEventListener('touchmove', handleTouchMove, { passive: false });
            viewer.addEventListener('touchend', handleTouchEnd);

            return () => {
                viewer.removeEventListener('wheel', handleWheel);
                viewer.removeEventListener('mousedown', handleMouseDown);
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
                viewer.removeEventListener('touchstart', handleTouchStart);
                viewer.removeEventListener('touchmove', handleTouchMove);
                viewer.removeEventListener('touchend', handleTouchEnd);
            };
        });

        return () => window.removeEventListener('click', handleClickOutside);
    }, [menuOpen]);

    return { viewerRefs, toggleMenu, downloadViewerImage };
};