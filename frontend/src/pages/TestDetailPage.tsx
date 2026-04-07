import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, ChevronDown, ChevronUp, Droplet, AlertCircle, Wallet, CalendarCheck } from 'lucide-react';
import { labTestService } from '../services/labTest';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useModal } from '../context/ModalContext';
import { notify } from '../utils/toast';
import { getEnhancedTestDetails } from '../utils/testDetailsContent';
import type { LabTestResponse, TestFAQ, LifestyleTip, CityPrice } from '../types/labTest';

import { TestDetailPageSkeleton } from '../components/ui/PageSkeleton';

const TestDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();
    const { isAuthenticated } = useAuth();
    const { openAuthModal } = useModal();
    const { addTest } = useCart();

    // State
    const [test, setTest] = useState<LabTestResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [knownMoreExpanded, setKnownMoreExpanded] = useState(false);

    // Load test details
    useEffect(() => {
        const loadTest = async () => {
            try {
                setLoading(true);
                if (slug) {
                    // Fetch by slug using the new service method
                    const response = await labTestService.getLabTestBySlug(slug);
                    if (!response) throw new Error('Test not found');
                    
                    // Enhance with content (passing numeric ID to utility)
                    const enhancedTest = getEnhancedTestDetails(response.id, response);
                    setTest(enhancedTest);
                } else {
                    throw new Error('No test slug provided');
                }
            } catch (error: unknown) {
                console.error('Error loading test:', error);
                notify.error('Failed to load test details');
                navigate('/lab-tests');
            } finally {
                setLoading(false);
            }
        };
        if (slug) loadTest();
    }, [slug, navigate]);

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            openAuthModal('login');
            return;
        }

        if (!test) return;

        setIsAddingToCart(true);
        try {
            // Updated signature: testId, name, price, quantity
            await addTest(test.id, test.testName || test.name || 'Test', test.price, 1);
            notify.success(`✓ ${test.testName || test.name} added to cart!`);
        } catch (error: unknown) {
            const apiError = error as { response?: { status: number }; message?: string };
            if (apiError?.response?.status === 401) {
                notify.error('Please log in to add items to cart');
            } else {
                notify.error(apiError?.message || 'Failed to add to cart');
            }
        } finally {
            setIsAddingToCart(false);
        }
    };

    if (loading) {
        return <TestDetailPageSkeleton />;
    }

    if (!test) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Test not found</h2>
                    <button onClick={() => navigate('/tests')} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Back to Tests</button>
                </div>
            </div>
        );
    }

    return (
        <div className="test-detail-page">
            {/* Breadcrumbs */}
            <div className="bg-transparent border-b border-gray-100">
                <div className="test-detail-container py-3">
                    <nav className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-500">
                        <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button>
                        <span>/</span>
                        <button onClick={() => navigate('/lab-tests')} className="hover:text-primary transition-colors">Lab Tests</button>
                        <span>/</span>
                        <button 
                            onClick={() => navigate(`/lab-tests-category/${(test.category || 'General').toLowerCase().replace(/\s+/g, '-')}`)} 
                            className="hover:text-primary transition-colors"
                        >
                            {test.category || 'General'}
                        </button>
                        <span className="hidden sm:inline">/</span>
                        <span className="text-primary truncate hidden sm:inline max-w-[150px]">{test.testName}</span>
                    </nav>
                </div>
            </div>

            {/* Main Content - 60/40 Layout */}
            <div className="test-detail-container py-3">
                <div className="test-detail-layout">
                    {/* LEFT COLUMN - 60% */}
                    <div className="test-detail-left">
                        {/* Section 1: Header & Key Stats */}
                        <Section1Header test={test} />

                        {/* Section 2: Know More Box */}
                        <Section2KnowMore test={test} expanded={knownMoreExpanded} setExpanded={setKnownMoreExpanded} />

                        {/* Section 3: Details Grid */}
                        <Section3DetailsGrid test={test} />

                        {/* Section 4: Sample Collection */}
                        <Section4SampleCollection test={test} />

                        {/* Section 5: Understanding the Test */}
                        <Section5Understanding test={test} />

                        {/* Section 7: Similar Tests */}
                        <Section7SimilarTests category={test.categoryName || test.category || 'General'} currentTestId={test.id} />

                        {/* Section 10: City Prices */}
                        {test.cityPrices && test.cityPrices.length > 0 && (
                            <Section10CityPrices prices={test.cityPrices} />
                        )}

                        {/* Section 12: References */}
                        {test.references && test.references.length > 0 && (
                            <Section12References references={test.references} />
                        )}
                    </div>

                    {/* RIGHT COLUMN - 40% (STICKY) */}
                    <div className="test-detail-right">
                        {/* Price Card */}
                        <PriceCard test={test} onAddToCart={handleAddToCart} onBooking={() => navigate(`/booking/${test.id}`)} isAddingToCart={isAddingToCart} />

                        {/* Doctor Recommended Card */}
                        <DoctorRecommendedCard test={test} />

                        {/* Lab Information Card */}
                        <LabInfoCard test={test} />

                        {/* Sample Collection Card */}
                        <CollectionCard test={test} />

                        {/* Need Help Card */}
                        <NeedHelpCard />
                    </div>
                </div>

                {/* Full width centered sections */}
                <div className="w-full max-w-6xl mx-auto mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                    {/* Section 8: FAQs */}
                    {test.faqs && test.faqs.length > 0 && (
                        <div className="h-full">
                            <Section8FAQs faqs={test.faqs} expandedFAQ={expandedFAQ} setExpandedFAQ={setExpandedFAQ} />
                        </div>
                    )}

                    {/* Section 9: Lifestyle Tips */}
                    {test.lifestyleTips && test.lifestyleTips.length > 0 && (
                        <div className="h-full">
                            <Section9LifestyleTips tips={test.lifestyleTips} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ✅ PRICE CARD - Right Column Top
const PriceCard: React.FC<{ test: LabTestResponse; onAddToCart: () => void; onBooking: () => void; isAddingToCart: boolean }> = ({ test, onAddToCart, onBooking, isAddingToCart }) => {
    const discPercentage = test.originalPrice ? Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100) : 0;

    return (
        <div className="test-section space-y-2.5">
            <div className="flex items-center gap-2 text-[#0D7C7C]">
                <Wallet className="w-5 h-5" />
                <h3 className="text-xl font-bold leading-tight">Pricing</h3>
            </div>
            
            {/* Price Display */}
            <div className="space-y-1">
                <p className="text-xs text-gray-600 font-medium">Test Price</p>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-[#0D7C7C]">₹{test.price}</span>
                    {test.originalPrice && (
                        <>
                            <span className="text-xs text-gray-400 line-through">₹{test.originalPrice}</span>
                            <span className="px-1.5 py-0 bg-green-100 text-green-700 rounded-full text-xs font-bold">{discPercentage}% off</span>
                        </>
                    )}
                </div>
                <p className="text-xs text-gray-600 pt-1">Get additional up to 15% off with code <span className="font-bold text-[#0D7C7C]">BOOK50</span></p>
            </div>

            {/* Buttons */}
            <div className="space-y-1.5 pt-2 flex flex-col items-center w-full">
                <button
                    onClick={onBooking}
                    className="max-w-xs py-1.5 px-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-md text-xs transition-all duration-300 flex items-center justify-center gap-1 shadow-xs hover:shadow-sm"
                >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    BOOK NOW
                </button>
                <button
                    onClick={onAddToCart}
                    disabled={isAddingToCart}
                    className="max-w-xs py-1.5 px-4 border border-[#0D7C7C]/40 text-[#0D7C7C] hover:bg-[#F5FCFC] font-bold rounded-md text-xs transition-all duration-300 flex items-center justify-center gap-1 disabled:bg-gray-100"
                >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
};

// ✅ DOCTOR RECOMMENDED CARD - Right Column
const DoctorRecommendedCard: React.FC<{ test: LabTestResponse }> = ({ test }) => (
    <div className="test-section space-y-3 bg-blue-50 border-blue-200">
        <div className="text-xs font-bold text-blue-600 tracking-wider">👨‍⚕️ RECOMMENDED BY:</div>
        <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900">Dr. Bhattacharya</h3>
            <p className="text-xs text-blue-700 font-semibold">Specialises in Blood Studies</p>
        </div>
        <div className="pt-2 border-t border-blue-200 text-xs text-gray-700">
            <p className="leading-relaxed">Trusted by healthcare professionals for accurate {test.testName} diagnosis</p>
        </div>
    </div>
);

// ✅ LAB INFO CARD - Right Column
const LabInfoCard: React.FC<{ test: LabTestResponse }> = ({ test }) => (
    <div className="test-section space-y-3 bg-gradient-to-br from-[#F0FFFE] to-white">
        <div className="test-section-header text-base">🏥 Lab Information</div>
        <div className="space-y-2 text-xs">
            <p className="font-semibold text-gray-900 text-sm">{test.category || 'Tata 1mg Labs'}</p>
            <div className="space-y-1.5 text-gray-700">
                <p className="flex items-center gap-1.5"><span className="text-green-600 font-bold">✓</span> Accredited laboratories</p>
                <p className="flex items-center gap-1.5"><span className="text-green-600 font-bold">✓</span> Highly skilled phlebotomists</p>
                <p className="flex items-center gap-1.5"><span className="text-green-600 font-bold">✓</span> Verified & authenticated reports</p>
                <p className="flex items-center gap-1.5"><span className="text-green-600 font-bold">✓</span> Home collection available</p>
            </div>
        </div>

        {/* Rating */}
        {test.averageRating && (
            <div className="border-t border-gray-200 pt-2">
                <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-yellow-500 text-sm">⭐</span>
                    <span className="font-bold text-gray-900">{test.averageRating}</span>
                    <span className="text-gray-600">({test.totalReviews} reviews)</span>
                </div>
            </div>
        )}
    </div>
);

// ✅ COLLECTION CARD - Right Column
const CollectionCard: React.FC<{ test: LabTestResponse }> = ({ test }) => (
    <div className="test-section space-y-3 bg-gradient-to-br from-blue-50 to-white border-blue-100">
        <div className="test-section-header text-base">👤 Sample Collection</div>
        <div className="space-y-2 text-xs">
            <div>
                <p className="font-semibold text-gray-900 mb-1 text-xs">Who Collects?</p>
                <p className="text-gray-700">{test.phlebotomistInfo || 'Certified professional phlebotomists'}</p>
            </div>
            <div>
                <p className="font-semibold text-gray-900 mb-1 text-xs">Sample Type</p>
                <p className="text-gray-700">{test.sampleType || 'Blood'}</p>
            </div>
            <div>
                <p className="font-semibold text-gray-900 mb-1 text-xs">Report Time</p>
                <p className="text-gray-700">{test.reportTimeHours || 24} hours</p>
            </div>
        </div>
    </div>
);

// ✅ NEED HELP CARD - Right Column Bottom
const NeedHelpCard: React.FC = () => (
    <div className="test-section space-y-2 bg-gradient-to-br from-[#FEF3C7] to-[#FEE8C3] border-amber-200">
        <div className="test-section-header text-base">📞 Need Help?</div>
        <div className="space-y-1.5 text-xs">
            <p className="text-gray-700">Have questions about this test?</p>
            <button className="w-full py-1.5 px-3 bg-[#0D7C7C] text-white rounded-md text-xs font-semibold hover:bg-[#004B87] transition-colors duration-300">
                Contact Us
            </button>
            <p className="text-xs text-gray-600 text-center">Available 24/7 for support</p>
        </div>
    </div>
);

// Section 1: Header & Key Stats
const Section1Header: React.FC<{ test: LabTestResponse }> = ({ test }) => (
    <div className="test-section">
        <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1.5">🩺 {test.testName}</h1>
            {test.alternateNames && test.alternateNames.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    <span className="text-gray-600 text-xs font-semibold">Also referred as:</span>
                    {test.alternateNames.map((name, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-[#F0F9F9] text-[#0D7C7C] rounded-full text-xs font-semibold">{name}</span>
                    ))}
                </div>
            )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-y border-gray-200">
            {test.recentlyBooked && (
                <div className="sm:w-[140px] text-center sm:text-left">
                    <p className="text-xl font-bold text-green-600">{test.recentlyBooked.toLocaleString()}+</p>
                    <p className="text-xs font-semibold text-gray-800">booked recently</p>
                </div>
            )}
            <div className="flex-1 min-w-[220px] flex items-center justify-center gap-4 sm:gap-5">
                <div className="text-center">
                    <p className="text-xs font-semibold text-gray-800">For men & women</p>
                </div>
                <div className="text-center">
                    <p className="text-xs font-semibold text-gray-800">📋 {test.category || 'General Health'}</p>
                </div>
            </div>
            {test.recentlyBooked && <div className="hidden sm:block sm:w-[140px]" aria-hidden="true" />}
        </div>

        <div className="flex flex-wrap gap-3 mt-3">
            {test.reportTimeHours && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-semibold">
                    ⏱️ Earliest reports in: {test.reportTimeHours} hours
                </span>
            )}
            {test.containsTests && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold">
                    🔬 Contains: {test.containsTests} tests
                </span>
            )}
        </div>
    </div>
);

// Section 2: Know More Box
const Section2KnowMore: React.FC<{ test: LabTestResponse; expanded: boolean; setExpanded: (v: boolean) => void }> = ({ test, expanded, setExpanded }) => (
    <div className="bg-pink-50 border-1.5 border-pink-200 rounded-lg p-4">
        <h2 className="text-base font-bold text-gray-900 mb-2">Know more about this test</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
            {expanded ? test.knownAbout : test.knownAbout?.substring(0, 300) + '...'}
        </p>
        <button
            onClick={() => setExpanded(!expanded)}
            className="text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-2"
        >
            {expanded ? 'see less' : 'see more'} {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
    </div>
);

// Section 3: Details Grid
const Section3DetailsGrid: React.FC<{ test: LabTestResponse }> = ({ test }) => (
    <div className="grid md:grid-cols-2 gap-3 items-stretch">
        <DetailBox
            icon={Droplet}
            iconClassName="text-pink-500"
            title="Samples required"
            content={test.sampleType || 'Blood'}
            asBadge
            badgeClassName="text-violet-600 bg-violet-50"
        />
        <DetailBox
            icon={AlertCircle}
            iconClassName="text-red-500"
            title="Preparations"
            content={test.fastingRequired ? `Fasting: ${test.fastingHours || 12} hours required` : 'No fasting required'}
            asBadge
            badgeClassName="text-red-600 bg-red-50"
        />
    </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DetailBox: React.FC<{
    icon: any;
    title: string;
    content: string;
    iconClassName?: string;
    asBadge?: boolean;
    badgeClassName?: string;
}> = ({ icon: Icon, title, content, iconClassName, asBadge = false, badgeClassName }) => (
    <div className="bg-white rounded-lg p-3 shadow-sm h-full flex flex-col justify-start">
        <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-4 h-4 ${iconClassName || 'text-blue-600'}`} />
            <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        </div>
        {asBadge ? (
            <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClassName || 'text-blue-600 bg-blue-50'}`}>
                {content}
            </span>
        ) : (
            <p className="text-gray-700 text-xs leading-5">{content}</p>
        )}
    </div>
);

// Section 4: Sample Collection
const Section4SampleCollection: React.FC<{ test: LabTestResponse }> = ({ test }) => (
    <div className="bg-purple-50 border-1.5 border-purple-200 rounded-lg p-4">
        <h2 className="text-base font-bold text-gray-900 mb-2">Who will collect your samples?</h2>
        <p className="text-xs text-gray-700 flex items-center gap-2">
            👤 {test.phlebotomistInfo || 'Certified phlebotomists'}
        </p>
    </div>
);

// Section 5: Understanding the Test
const Section5Understanding: React.FC<{ test: LabTestResponse }> = ({ test }) => (
    <div className="test-section space-y-2">
        <h2 className="test-section-header text-sm">📚 Understanding {test.testName}</h2>
        <div className="space-y-2 text-gray-700 text-xs leading-relaxed">
            <p>{test.detailedUnderstanding}</p>
            <p>This test also helps doctors track overall blood health trends over time.</p>
            {test.benefits && (
                <>
                    <h3 className="text-xs font-bold text-gray-900 mt-2">Benefits</h3>
                    <ul className="list-disc list-inside space-y-0.5 ml-1">
                        {test.benefits.map((benefit, idx) => (
                            <li key={idx} className="text-gray-700 text-xs">{benefit}</li>
                        ))}
                    </ul>
                </>
            )}
            {test.conditions && (
                <>
                    <h3 className="text-xs font-bold text-gray-900 mt-2">Conditions Detected</h3>
                    <ul className="list-disc list-inside space-y-0.5 ml-1">
                        {test.conditions.map((condition, idx) => (
                            <li key={idx} className="text-gray-700 text-xs">{condition}</li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    </div>
);

// Section 7: Similar Tests (Dynamic fetching)
const Section7SimilarTests: React.FC<{ category: string; currentTestId: number }> = ({ category, currentTestId }) => {
    const [similar, setSimilar] = useState<LabTestResponse[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSimilar = async () => {
            try {
                const res = await fetch(`/api/tests?category=${encodeURIComponent(category)}&limit=5`);
                const data = await res.json();
                if (data.success && data.data?.tests) {
                    setSimilar(data.data.tests.filter((t: any) => t.id !== currentTestId).slice(0, 4));
                }
            } catch (e) {
                console.error('Failed to fetch similar tests', e);
            }
        };
        fetchSimilar();
    }, [category, currentTestId]);

    if (similar.length === 0) return null;

    return (
        <div className="test-section space-y-4">
            <h2 className="test-section-header text-sm">Frequently Booked Together</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {similar.map(item => (
                    <div 
                        key={item.id} 
                        onClick={() => navigate(`/test/${item.slug}`)}
                        className="p-3 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-gray-900 text-xs line-clamp-2 group-hover:text-primary transition-colors">{item.testName}</span>
                            <span className="text-xs font-black text-[#0D7C7C]">₹{item.price}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.categoryName}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Section 8: FAQs
const Section8FAQs: React.FC<{ faqs: TestFAQ[]; expandedFAQ: number | null; setExpandedFAQ: (v: number | null) => void }> = ({ faqs, expandedFAQ, setExpandedFAQ }) => {
    const additionalFaqs: TestFAQ[] = [
        {
            question: 'Can I take medicines before this test?',
            answer: 'Yes, in most cases you can continue regular medicines. If your doctor has advised specific restrictions, follow those instructions before sample collection.'
        },
        {
            question: 'Is home sample collection available?',
            answer: 'Yes, trained phlebotomists can collect your sample at home in most serviceable locations. You can choose your preferred slot while booking.'
        },
        {
            question: 'What should I do if I miss my slot?',
            answer: 'You can reschedule your booking from your account or contact support. Try to choose a new time as early as possible for faster report turnaround.'
        }
    ];

    const faqsToRender = [...faqs, ...additionalFaqs];

    return (
    <div className="bg-white rounded-2xl p-5 shadow-lg h-full">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2">
            {faqsToRender.map((faq, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                        onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors text-left font-semibold text-sm text-gray-900"
                    >
                        <span>{faq.question}</span>
                        {expandedFAQ === idx ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </button>
                    {expandedFAQ === idx && (
                        <div className="px-4 py-3 bg-blue-50 border-t border-gray-200 text-sm text-gray-700">
                            {faq.answer}
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
    );
};

// Section 9: Lifestyle Tips
const Section9LifestyleTips: React.FC<{ tips: LifestyleTip[] }> = ({ tips }) => {
    const tipsToRender = tips.filter((tip) => {
        const normalizedTitle = (tip.title || '').toLowerCase();
        return normalizedTitle !== 'healthy habits' && normalizedTitle !== 'daily activity goal';
    });

    return (
    <div className="bg-white rounded-2xl p-5 shadow-lg h-full">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Lifestyle Tips to Support Healthy Blood Cells</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tipsToRender.map((tip, idx) => (
                <div key={idx} className="text-left bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="text-2xl mb-1">{tip.icon}</div>
                    <h3 className="font-semibold text-sm text-gray-900 mb-1">{tip.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{tip.description}</p>
                </div>
            ))}
        </div>
    </div>
    );
};

// Section 10: City Prices
const Section10CityPrices: React.FC<{ prices: CityPrice[] }> = ({ prices }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{prices[0]?.city ? 'Test Price in Different Cities' : 'Pricing Information'}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {prices.slice(0, 6).map((cp, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 transition-colors">
                    <p className="text-gray-700 font-semibold mb-1">{cp.city}</p>
                    <p className="text-blue-600 font-bold text-lg">₹{cp.price}</p>
                </div>
            ))}
        </div>
        {prices.length > 6 && <button className="mt-6 text-blue-600 hover:text-blue-700 font-semibold">See more cities →</button>}
    </div>
);

// Section 12: References
const Section12References: React.FC<{ references: string[] }> = ({ references }) => (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">References & Sources</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
            {references.map((ref, idx) => (
                <li key={idx} className="text-sm">{ref}</li>
            ))}
        </ol>
    </div>
);

// Sticky Sidebar
const StickyPricingSidebar: React.FC<{ test: LabTestResponse; onAddToCart: () => void; onBooking: () => void; isAddingToCart: boolean }> = ({ test, onAddToCart, onBooking, isAddingToCart }) => {
    const discPercentage = test.originalPrice ? Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100) : 0;

    return (
        <div className="sticky top-24 h-fit">
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                {/* Price Section */}
                <div>
                    <p className="text-sm text-gray-600 mb-2">Test price</p>
                    <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold text-gray-900">₹{test.price}</span>
                        {test.originalPrice && (
                            <>
                                <span className="text-lg text-gray-400 line-through">₹{test.originalPrice}</span>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">{discPercentage}% off</span>
                            </>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 mt-3">Get additional upto 15% off</p>
                    <p className="text-sm font-semibold text-blue-600">Use code: BOOK50</p>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={onBooking}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        🔴 BOOK NOW
                    </button>
                    <button
                        onClick={onAddToCart}
                        disabled={isAddingToCart}
                        className="w-full py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-gray-100"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                    </button>
                </div>

                {/* Lab Info */}
                <div className="border-t border-gray-200 pt-6">
                    <p className="text-sm font-semibold text-gray-900 mb-4">Conducted by</p>
                    <div className="space-y-2 text-sm">
                        <p className="font-semibold text-gray-900">🏥 {test.category || 'Tata 1mg Labs'}</p>
                        <p className="text-gray-600">✓ Accredited labs</p>
                        <p className="text-gray-600">✓ Highly skilled Phlebotomists</p>
                        <p className="text-gray-600">✓ Verified reports</p>
                    </div>
                </div>

                {/* Collection Info */}
                <div className="border-t border-gray-200 pt-6">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Who will collect?</p>
                    <p className="text-sm text-gray-700 flex items-center gap-2">👤 {test.phlebotomistInfo || 'Certified phlebotomists'}</p>
                </div>

                {/* Rating */}
                {test.averageRating && (
                    <div className="border-t border-gray-200 pt-6">
                        <div className="flex items-center gap-2">
                            <span className="text-yellow-500">⭐</span>
                            <span className="font-bold text-gray-900">{test.averageRating}</span>
                            <span className="text-gray-600">({test.totalReviews} reviews)</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestDetailPage;
