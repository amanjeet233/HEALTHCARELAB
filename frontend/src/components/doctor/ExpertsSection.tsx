import { Beaker, Brain, Clock, Users } from 'lucide-react';
import AsymmetricCard from '../common/AsymmetricCard';
import MagneticButton from '../ui/MagneticButton';

const ExpertsSection: React.FC = () => {
    const experts = [
        {
            name: "Dr. Sarah Chen",
            spec: "Pathology Expert",
            exp: "12+ Years",
            // Optimized with facearea for perfect centering
            img: "https://images.unsplash.com/photo-1559839734-2b71f153678c?auto=format&fit=facearea&facepad=2&w=400&h=400&q=80",
            icon: <Beaker className="w-3.5 h-3.5" />,
            color: "#08555F"
        },
        {
            name: "Dr. James Wilson",
            spec: "Genetics Specialist",
            exp: "15+ Years",
            img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=facearea&facepad=2&w=400&h=400&q=80",
            icon: <Brain className="w-3.5 h-3.5" />,
            color: "#10B981"
        }
    ];

    return (
        <section className="py-4 md:py-6 relative overflow-hidden bg-transparent">
            <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-[1000px]">
                <div className="flex flex-col items-center gap-3 md:gap-4 text-center">  
                    {/* Simplified Header Block */}
                    <div className="w-full space-y-3 max-w-xl">
                        <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">Intelligence Network</span>
                            <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase leading-none tracking-tighter">
                                MEET THE <span className="text-primary italic">MINDS</span>
                            </h2>
                            <p className="text-slate-500 font-bold text-[10px] md:text-[11px] max-w-xs mx-auto opacity-80 pt-1">
                                Expert validation from our global network of specialized medical intelligence offices.
                            </p>
                        </div>

                        {/* Network Stats - Clean Row */}
                        <div className="flex flex-wrap items-center justify-center gap-3 py-1 font-black uppercase tracking-widest text-[7px]">
                            <div className="flex items-center gap-1 text-slate-600">
                                <Clock className="w-2.5 h-2.5 text-primary" />
                                <span>24/7 Neural Link</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-600">
                                <Users className="w-2.5 h-2.5 text-primary" />
                                <span>50+ Bio-Nodes</span>
                            </div>
                        </div>
                    </div>

                    {/* Cards Section */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto items-stretch">
                        {experts.map((dr, i) => (
                            <AsymmetricCard
                                key={i}
                                delay={i * 0.1}
                                className="h-full bg-white"
                            >
                                <div className="space-y-3 flex flex-col h-full items-center text-center p-2 mt-2 mb-2">
                                    {/* Proportional Circular Avatar */}        
                                    <div className="relative">
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border border-primary/10 shadow-sm group-hover:scale-105 transition-all duration-500 bg-primary/5">
                                            <img
                                                src={dr.img}
                                                alt={dr.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {/* Balanced Icon Badge */}
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-white shadow-md flex items-center justify-center text-primary-teal border border-primary/10 rotate-12 group-hover:rotate-0 transition-transform">
                                            <div className="scale-75">{dr.icon}</div>
                                        </div>
                                    </div>

                                    {/* Text Content */}
                                    <div className="space-y-1 flex-1 mt-1">
                                        <h4 className="text-base md:text-lg font-black text-slate-800 uppercase italic tracking-tighter leading-none group-hover:text-primary transition-colors">{dr.name}</h4>    
                                        <p className="text-primary font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em]">{dr.spec}</p>
                                        <div className="inline-flex items-center justify-center gap-1.5 mt-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                            <span className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />        
                                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{dr.exp}</span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button className="w-full max-w-[160px] py-1.5 md:py-2 border border-primary/20 rounded-lg text-[8px] md:text-[9px] font-black uppercase text-primary hover:bg-primary hover:border-primary hover:text-white transition-all tracking-widest group-hover:shadow-md mt-2">
                                        SCHEDULE CONSULT
                                    </button>
                                </div>
                            </AsymmetricCard>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ExpertsSection;
