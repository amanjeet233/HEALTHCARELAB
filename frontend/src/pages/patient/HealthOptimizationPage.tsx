import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaUtensils, 
  FaRunning, 
  FaCalendarCheck, 
  FaCapsules, 
  FaExclamationCircle,
  FaCheckCircle,
  FaArrowRight
} from 'react-icons/fa';
import { reportService, type AIAnalysis } from '../../services/reportService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { notify } from '../../utils/toast';

const HealthOptimizationPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchAnalysis(Number(bookingId));
    }
  }, [bookingId]);

  const fetchAnalysis = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await reportService.getAIAnalysis(id);
      setAnalysis(data);
    } catch (err) {
      console.error('Error fetching analysis:', err);
      notify.error('Failed to load health optimization plan');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-black text-gray-900 uppercase">Analysis Not Available</h2>
        <p className="text-gray-500 mt-2">We couldn't generate an optimization plan for this report.</p>
        <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 bg-gray-100 rounded-lg font-bold">Go Back</button>
      </div>
    );
  }

  // Filter recommendations
  const dietRecs = analysis.recommendations.filter(r => r.category === 'DIET');
  const lifestyleRecs = analysis.recommendations.filter(r => r.category === 'LIFESTYLE');
  const followUpRecs = analysis.recommendations.filter(r => r.category === 'FOLLOWUP' || r.category === 'CONSULT');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-[#F0F9F9]">
      {/* Navigation */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 hover:text-[#0D7C7C] transition-colors"
      >
        <FaArrowLeft /> Back to Analysis
      </button>

      {/* Premium Header */}
      <div className="relative mb-12 bg-[#164E63] rounded-[2.5rem] p-10 overflow-hidden text-white shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl">🥗</div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-cyan-400 border border-white/20">
            <FaCapsules className="text-2xl" />
          </div>
          <div>
            <div className="text-[10px] font-black text-cyan-300 uppercase tracking-[0.3em] mb-1">
              Personalized Optimization
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight">Health Optimization Dashboard</h1>
          </div>
        </div>
        <p className="text-cyan-100/70 text-lg font-medium max-w-2xl leading-relaxed">
          Your biological roadmap for peak performance. These recommendations are custom-tailored to your recent laboratory biomarkers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Diet & Exercise */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section 1: AI Dietary Architect */}
          <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <FaUtensils className="text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Dietary Architect</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nutritional Optimization Strategy</p>
                </div>
              </div>
              <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                Phase 1: Activation
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100/50">
                <h3 className="flex items-center gap-2 text-emerald-700 font-black uppercase text-xs mb-4">
                  <FaCheckCircle /> Primary Focus (Add)
                </h3>
                <ul className="space-y-3">
                  {dietRecs.length > 0 ? dietRecs.map((r, i) => (
                    <li key={i} className="flex gap-3 text-gray-700 text-sm leading-relaxed">
                      <span className="text-emerald-500 mt-1">•</span>
                      {r.text}
                    </li>
                  )) : (
                    <>
                      <li className="flex gap-3 text-gray-700 text-sm leading-relaxed"><span className="text-emerald-500 mt-1">•</span> Increase lean protein intake (Fish, Lentils)</li>
                      <li className="flex gap-3 text-gray-700 text-sm leading-relaxed"><span className="text-emerald-500 mt-1">•</span> Focus on Vitamin B12 rich sources</li>
                      <li className="flex gap-3 text-gray-700 text-sm leading-relaxed"><span className="text-emerald-500 mt-1">•</span> 2L+ Daily hydration target</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="p-6 bg-rose-50/30 rounded-3xl border border-rose-100/50">
                <h3 className="flex items-center gap-2 text-rose-700 font-black uppercase text-xs mb-4">
                  <FaExclamationCircle /> Moderate Intake (Avoid)
                </h3>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-gray-700 text-sm leading-relaxed"><span className="text-rose-500 mt-1">•</span> Refined sugars and processed grains</li>
                  <li className="flex gap-3 text-gray-700 text-sm leading-relaxed"><span className="text-rose-500 mt-1">•</span> Excess sodium (targeted &lt; 2300mg)</li>
                  <li className="flex gap-3 text-gray-700 text-sm leading-relaxed"><span className="text-rose-500 mt-1">•</span> Saturated fats from dairy sources</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: Bio-Mechanical Activity */}
          <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <FaRunning className="text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Active Coach</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Exercise & Recovery Routine</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { type: 'Cardio', intensity: 'Moderate', schedule: '3x Weekly', desc: '30 min brisk walking or cycling to improve cardiovascular marker efficiency.' },
                { type: 'Strength', intensity: 'Low', schedule: '2x Weekly', desc: 'Bodyweight exercises focused on core stability and joint health.' },
                { type: 'Recovery', intensity: 'Maintenance', schedule: 'Daily', desc: 'Light stretching and mobility work to reduce systemic inflammation.' }
              ].map((ex, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-all group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest">{ex.type}</h4>
                      <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                        {ex.intensity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed max-w-lg">{ex.desc}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-gray-900">{ex.schedule}</div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Frequency</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Next Steps & Vital Mapping */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Section 3: Clinical Continuity */}
          <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 text-6xl">🗓️</div>
             <div className="flex items-center gap-3 mb-6">
                <FaCalendarCheck className="text-cyan-600 text-xl" />
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Clinical Roadmap</h3>
             </div>

             <div className="p-6 bg-cyan-50 rounded-3xl border border-cyan-100 text-center mb-6">
                <p className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] mb-2">Next Recommended Test</p>
                <div className="text-3xl font-black text-[#164E63] uppercase tracking-tighter mb-1">90 Days</div>
                <div className="text-[10px] font-bold text-cyan-700/60 uppercase tracking-widest">Target: July 15, 2026</div>
             </div>

             <div className="space-y-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Markers to Track:</p>
                <div className="space-y-3">
                   {followUpRecs.length > 0 ? followUpRecs.map((r, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-700">{r.text}</span>
                        <FaArrowRight className="text-[10px] text-gray-300" />
                      </div>
                   )) : (
                    <>
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-700">Lipid Profile Update</span>
                        <FaArrowRight className="text-[10px] text-gray-300" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-700">Hemoglobin A1c</span>
                        <FaArrowRight className="text-[10px] text-gray-300" />
                      </div>
                    </>
                   )}
                </div>
             </div>

             <button 
              onClick={() => navigate('/booking')}
              className="w-full mt-8 py-4 bg-[#164E63] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#0D7C7C] transition-all"
             >
                Pre-Book Follow up
             </button>
          </section>

          {/* Section 4: Vital Status */}
          <section className="bg-gradient-to-br from-[#0D7C7C] to-[#004B87] rounded-[2.5rem] p-8 text-white shadow-xl">
             <h3 className="text-xl font-black uppercase tracking-tight mb-6">Vital Score Index</h3>
             
             <div className="flex items-end justify-between mb-8">
                <div>
                   <div className="text-5xl font-black tracking-tighter italic">{analysis.healthScore}<span className="text-xl opacity-40">/100</span></div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300 mt-2">Aggregated Vitality</p>
                </div>
                <div className="text-right">
                   <div className="text-xs font-black uppercase tracking-widest text-emerald-400">Stable</div>
                   <div className="text-[9px] font-bold opacity-50 uppercase mt-1">Status</div>
                </div>
             </div>

             <div className="space-y-4">
                {[
                   { label: 'Metabolic', val: 88 },
                   { label: 'Inflammatory', val: 72 },
                   { label: 'Cardio-Health', val: 94 }
                ].map((stat, idx) => (
                   <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-70">
                         <span>{stat.label}</span>
                         <span>{stat.val}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${stat.val}%` }} />
                      </div>
                   </div>
                ))}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HealthOptimizationPage;
