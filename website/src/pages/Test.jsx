// import {useEffect, useRef} from "react";
// import {gsap} from "gsap";
// import {ScrollTrigger} from "gsap/ScrollTrigger";
//
// const noticeBoardRef = useRef(null);
// const noticeListRef = useRef(null);
// const heroThemeRef = useRef(null);
//
// const counterStatsRef = useRef(null);
// const aboutStatsRef = useRef(null);
//
// // Register GSAP plugins
// useEffect(() => {
//     // Register ScrollTrigger
//     gsap.registerPlugin(ScrollTrigger);
//
//     // Notice Board Animation
//     gsap.fromTo(
//         noticeBoardRef.current,
//         { y: '30%', opacity: 0 },
//         {
//             y: '0%',
//             opacity: 1,
//             duration: 1,
//             scrollTrigger: {
//                 trigger: noticeBoardRef.current,
//                 start: 'top 80%',
//                 end: 'top 50%',
//                 toggleActions: 'play none none none',
//             },
//         }
//     );
//
//     // Hero Theme Animation
//     gsap.fromTo(
//         heroThemeRef.current,
//         { x: '-30%', opacity: 0 },
//         {
//             x: '0%',
//             opacity: 1,
//             duration: 1,
//             scrollTrigger: {
//                 trigger: heroThemeRef.current,
//                 start: 'top 80%',
//                 end: 'top 50%',
//                 toggleActions: 'play none none none',
//             },
//         }
//     );
//
//     // Vertical Notice Board Scrolling
//     const noticeItem = noticeListRef.current;
//     const noticeItems = noticeItem?.querySelectorAll('li');
//     if (noticeItems?.length > 0) {
//         const tickerHeight = noticeItems[0].offsetHeight;
//         noticeItem.style.marginTop = `-${tickerHeight}px`;
//
//         const moveTop = () => {
//             noticeItem.style.transition = 'top 600ms ease';
//             noticeItem.style.top = `-${tickerHeight}px`;
//
//             setTimeout(() => {
//                 const firstItem = noticeItem.querySelector('li:first-child');
//                 noticeItem.appendChild(firstItem);
//                 noticeItem.style.transition = 'none';
//                 noticeItem.style.top = '0';
//                 void noticeItem.offsetHeight; // Trigger reflow
//             }, 600);
//         };
//
//         const interval = setInterval(moveTop, 2000);
//
//         const parent = noticeItem.parentElement;
//         parent.addEventListener('mouseenter', () => clearInterval(interval));
//         parent.addEventListener('mouseleave', () => {
//             moveTop();
//             setInterval(moveTop, 2000);
//         });
//
//         return () => {
//             clearInterval(interval);
//             parent.removeEventListener('mouseenter', () => {});
//             parent.removeEventListener('mouseleave', () => {});
//         };
//     }
// }, []);
//
// useEffect(() => {
//     gsap.registerPlugin(ScrollTrigger);
//
//     let triggers = []; // Store ScrollTrigger instances for cleanup
//
//     // CounterWrapper Section Animation
//     const counterNumbers = counterStatsRef.current?.querySelectorAll('.numbers');
//     if (counterNumbers && counterNumbers.length > 0) {
//         counterNumbers.forEach((counter) => {
//             const trigger = ScrollTrigger.create({
//                 trigger: counterStatsRef.current,
//                 start: 'top 80%',
//                 toggleActions: 'play none none none',
//                 onEnter: () => {
//                     gsap.fromTo(
//                         counter,
//                         { innerText: 0 },
//                         {
//                             innerText: counter.getAttribute('data-target'),
//                             duration: 2,
//                             ease: 'power1.out',
//                             snap: { innerText: 1 },
//                             onUpdate: function () {
//                                 counter.textContent = Math.floor(this.targets()[0].innerText);
//                             },
//                         }
//                     );
//                 },
//             });
//             triggers.push(trigger);
//         });
//     }
//
//     // About Section Animation
//     const aboutCounters = aboutStatsRef.current?.querySelectorAll('.counters');
//     if (aboutCounters && aboutCounters.length > 0) {
//         aboutCounters.forEach((counter) => {
//             const trigger = ScrollTrigger.create({
//                 trigger: aboutStatsRef.current,
//                 start: 'top 80%',
//                 toggleActions: 'play none none none',
//                 onEnter: () => {
//                     gsap.fromTo(
//                         counter,
//                         { innerText: 0 },
//                         {
//                             innerText: counter.getAttribute('data-target'),
//                             duration: 2,
//                             ease: 'power1.out',
//                             snap: { innerText: 1 },
//                             onUpdate: function () {
//                                 counter.textContent = Math.floor(this.targets()[0].innerText);
//                             },
//                         }
//                     );
//                 },
//             });
//             triggers.push(trigger);
//         });
//     }
//
//     // Cleanup specific ScrollTriggers
//     return () => {
//         triggers.forEach((trigger) => trigger.kill());
//     };
// }, []);