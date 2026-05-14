"use client";

import React, { useRef } from 'react';
import { useCounter } from '@/lib/hooks/use-gsap';

const StatsSection: React.FC = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    
    const counters = [
        { id: 'tenders', target: 1000 },
        { id: 'design-clients', target: 700 },
        { id: 'projects', target: 200 },
        { id: 'success', target: 86 }
    ];

    const { counterRefs } = useCounter(counters, sectionRef);

    return (
        <section className="counter-wrapper py-20 bg-shade-1" ref={sectionRef}>
            <div className="custom-container mx-auto px-4">
                <div className="flex flex-wrap -mx-4">
                    {/* Item 1 */}
                    <div className="w-full sm:w-1/2 lg:w-1/4 px-4 mb-10 lg:mb-0">
                        <div className="counter-item text-center">
                            <div className="flex justify-center items-center">
                                <h1 className="text-[52px] font-bold text-text-1 font-primary mb-0 leading-none" ref={(el) => { if (el) counterRefs.current['tenders'] = el; }}>0</h1>
                                <h1 className="text-[52px] font-bold text-primary font-primary mb-0 leading-none">+</h1>
                            </div>
                            <p className="text-base font-medium text-text-1 font-secondary mb-0 uppercase tracking-widest mt-2">Total Tenders</p>
                        </div>
                    </div>

                    {/* Item 2 */}
                    <div className="w-full sm:w-1/2 lg:w-1/4 px-4 mb-10 lg:mb-0">
                        <div className="counter-item text-center">
                            <div className="flex justify-center items-center">
                                <h1 className="text-[52px] font-bold text-text-1 font-primary mb-0 leading-none" ref={(el) => { if (el) counterRefs.current['design-clients'] = el; }}>0</h1>
                                <h1 className="text-[52px] font-bold text-primary font-primary mb-0 leading-none">+</h1>
                            </div>
                            <p className="text-base font-medium text-text-1 font-secondary mb-0 uppercase tracking-widest mt-2">Design Clients</p>
                        </div>
                    </div>

                    {/* Item 3 */}
                    <div className="w-full sm:w-1/2 lg:w-1/4 px-4 mb-10 sm:mb-0">
                        <div className="counter-item text-center">
                            <div className="flex justify-center items-center">
                                <h1 className="text-[52px] font-bold text-text-1 font-primary mb-0 leading-none" ref={(el) => { if (el) counterRefs.current['projects'] = el; }}>0</h1>
                                <h1 className="text-[52px] font-bold text-primary font-primary mb-0 leading-none">+</h1>
                            </div>
                            <p className="text-base font-medium text-text-1 font-secondary mb-0 uppercase tracking-widest mt-2">Projects</p>
                        </div>
                    </div>

                    {/* Item 4 */}
                    <div className="w-full sm:w-1/2 lg:w-1/4 px-4">
                        <div className="counter-item text-center">
                            <div className="flex justify-center items-center">
                                <h1 className="text-[52px] font-bold text-text-1 font-primary mb-0 leading-none" ref={(el) => { if (el) counterRefs.current['success'] = el; }}>0</h1>
                                <h1 className="text-[34px] font-bold text-primary font-primary mb-0 leading-none">%</h1>
                            </div>
                            <p className="text-base font-medium text-text-1 font-secondary mb-0 uppercase tracking-widest mt-2">Success Rate</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
