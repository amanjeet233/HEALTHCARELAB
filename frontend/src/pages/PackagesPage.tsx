import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaSortAmountDown, FaFlask, FaPercentage, FaBoxes } from 'react-icons/fa';
import { packageService, type TestPackageResponse } from '../services/packageService';
import PackageCard from '../components/packages/PackageCard';
import PackageDetailsModal from '../components/packages/PackageDetailsModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { notify } from '../utils/toast';
import './PackagesPage.css';

type SortOption = 'name' | 'price_asc' | 'price_desc' | 'savings' | 'tests';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' },
    { value: 'savings', label: 'Best Savings' },
    { value: 'tests', label: 'Most Tests' }
];

const PackagesPage: React.FC = () => {
    const navigate = useNavigate();
    const [packages, setPackages] = useState<TestPackageResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('savings');
    const [selectedPackage, setSelectedPackage] = useState<TestPackageResponse | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        const fetchPackages = async () => {
            setIsLoading(true);
            try {
                const data = await packageService.getAllPackages();
                setPackages(data);
            } catch (error) {
                console.error(error);
                notify.error('Failed to load packages.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPackages();
    }, []);

    const filteredAndSorted = useMemo(() => {
        let result = [...packages];

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(pkg =>
                pkg.packageName.toLowerCase().includes(q) ||
                pkg.description?.toLowerCase().includes(q) ||
                pkg.packageCode?.toLowerCase().includes(q) ||
                pkg.tests?.some(t => t.name.toLowerCase().includes(q))
            );
        }

        // Sort
        switch (sortBy) {
            case 'name':
                result.sort((a, b) => a.packageName.localeCompare(b.packageName));
                break;
            case 'price_asc':
                result.sort((a, b) => a.discountedPrice - b.discountedPrice);
                break;
            case 'price_desc':
                result.sort((a, b) => b.discountedPrice - a.discountedPrice);
                break;
            case 'savings':
                result.sort((a, b) => b.savings - a.savings);
                break;
            case 'tests':
                result.sort((a, b) => b.totalTests - a.totalTests);
                break;
        }

        return result;
    }, [packages, searchQuery, sortBy]);

    const handleViewDetails = (pkg: TestPackageResponse) => {
        setSelectedPackage(pkg);
        setShowDetailsModal(true);
    };

    const handleBookPackage = (pkg: TestPackageResponse) => {
        // Navigate to booking with the first test in package or a package booking flow
        if (pkg.tests && pkg.tests.length > 0) {
            navigate(`/book/${pkg.tests[0].id}`, { state: { packageId: pkg.id, packageName: pkg.packageName } });
        } else {
            notify.error('No tests available in this package.');
        }
    };

    const avgDiscount = packages.length > 0
        ? Math.round(packages.reduce((sum, p) => sum + (p.discountPercentage || 0), 0) / packages.length)
        : 0;

    return (
        <div className="packages-page">
            {/* PAGE HEADER */}
            <header className="packages-header">
                <div className="packages-header-section">
                    <span className="packages-header-label">💊 Health Intelligence</span>
                    <h1>
                        Health <span>Packages</span>
                    </h1>
                    <p className="packages-header-description">
                        Comprehensive diagnostic bundles designed for preventive care. Each package combines essential tests at significant savings.
                    </p>
                </div>

                {/* STATISTICS CARDS */}
                <div className="packages-stats">
                    {[
                        { icon: FaBoxes, label: 'Total Packages', value: packages.length.toString(), color: 'primary' },
                        { icon: FaFlask, label: 'Total Tests', value: packages.reduce((s, p) => s + p.totalTests, 0).toString(), color: 'tests' },
                        { icon: FaPercentage, label: 'Avg Discount', value: `${avgDiscount}%`, color: 'savings' },
                        { icon: FaSortAmountDown, label: 'Max Savings', value: `₹${Math.max(0, ...packages.map(p => p.savings || 0)).toFixed(0)}`, color: 'primary' }
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="package-stat-card"
                        >
                            <stat.icon className={`package-stat-icon ${stat.color}`} />
                            <p className="package-stat-value">{stat.value}</p>
                            <p className="package-stat-label">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </header>

            {/* SEARCH & SORT */}
            <div className="packages-controls">
                {/* Search */}
                <div className="packages-search">
                    <FaSearch className="packages-search-icon" />
                    <input
                        type="text"
                        placeholder="Search packages or tests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Sort */}
                <div className="packages-sort-group">
                    <FaSortAmountDown className="packages-sort-icon" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="packages-sort-select"
                    >
                        {SORT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* RESULTS */}
            {isLoading ? (
                <div className="packages-loading">
                    <LoadingSpinner size="lg" />
                </div>
            ) : filteredAndSorted.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="empty-packages"
                >
                    <FaBoxes className="empty-icon" />
                    <h3>No Packages Found</h3>
                    <p>
                        {searchQuery ? 'Try adjusting your search query.' : 'Health packages will appear here once available.'}
                    </p>
                </motion.div>
            ) : (
                <>
                    <div className="packages-count">
                        <span>
                            {filteredAndSorted.length} package{filteredAndSorted.length !== 1 ? 's' : ''} found
                        </span>
                    </div>

                    <div className="packages-grid">
                        {filteredAndSorted.map((pkg, idx) => (
                            <PackageCard
                                key={pkg.id}
                                pkg={pkg}
                                index={idx}
                                onViewDetails={handleViewDetails}
                                onBookNow={handleBookPackage}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Details Modal */}
            <PackageDetailsModal
                isOpen={showDetailsModal}
                pkg={selectedPackage}
                onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedPackage(null);
                }}
                onBookPackage={(pkg) => {
                    setShowDetailsModal(false);
                    handleBookPackage(pkg);
                }}
            />
        </div>
    );
};

export default PackagesPage;
