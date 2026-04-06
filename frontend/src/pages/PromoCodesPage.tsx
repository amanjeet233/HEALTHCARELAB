import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaTag, FaFire, FaClock, FaTag as FaFilter, FaSpinner, FaCopy, FaExternalLinkAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { promoCodeService } from '../services/PromoCodeService';
import type { PromoCode } from '../types/promo';
import './PromoCodesPage.css';

interface FilterOptions {
  type: 'all' | 'percentage' | 'flat';
  sortBy: 'newest' | 'discount' | 'expiry';
  searchQuery: string;
}

const PromoCodesPage: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    sortBy: 'newest',
    searchQuery: ''
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedPromo, setExpandedPromo] = useState<string | null>(null);

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, promoCodes]);

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const codes = await promoCodeService.getAvailablePromoCodes();
      setPromoCodes(codes);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast.error('Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...promoCodes];

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(
        (code) => code.discount_type.toLowerCase() === filters.type
      );
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (code) =>
          code.code.toLowerCase().includes(query) ||
          code.description.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'discount':
        filtered.sort((a, b) => b.discount_value - a.discount_value);
        break;
      case 'expiry':
        filtered.sort(
          (a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
        );
        break;
      case 'newest':
      default:
        filtered.sort(
          (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
        break;
    }

    setFilteredCodes(filtered);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getDiscountText = (promo: PromoCode) => {
    if (promo.discount_type === 'PERCENTAGE') {
      return `${promo.discount_value}% OFF`;
    } else {
      return `₹${promo.discount_value} OFF`;
    }
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="promo-codes-page">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="promo-hero"
      >
        <div className="hero-content">
          <h1>Exclusive Promo Codes</h1>
          <p>Save big on your laboratory tests and wellness packages</p>
          <div className="hero-stats">
            <div className="stat">
              <FaTag className="stat-icon" />
              <span>{promoCodes.length} Active Offers</span>
            </div>
            <div className="stat">
              <FaFire className="stat-icon" />
              <span>Up to {Math.max(...promoCodes.map((p) => p.discount_value))}% OFF</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="filters-section"
      >
        {/* Search */}
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by code or description..."
            value={filters.searchQuery}
            onChange={(e) =>
              setFilters({ ...filters, searchQuery: e.target.value })
            }
            className="search-input"
          />
        </div>

        {/* Filter Options */}
        <div className="filter-options">
          <div className="filter-group">
            <label>Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="percentage">Percentage Discount</option>
              <option value="flat">Flat Amount</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="discount">Highest Discount</option>
              <option value="expiry">Expiring Soon</option>
            </select>
          </div>

          {(filters.searchQuery || filters.type !== 'all' || filters.sortBy !== 'newest') && (
            <button
              onClick={() =>
                setFilters({
                  type: 'all',
                  sortBy: 'newest',
                  searchQuery: ''
                })
              }
              className="reset-filters-btn"
            >
              Reset Filters
            </button>
          )}
        </div>
      </motion.div>

      {/* Promo Codes Grid */}
      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading promo codes...</p>
        </div>
      ) : filteredCodes.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
          <FaTag className="empty-icon" />
          <h3>No promo codes found</h3>
          <p>Try adjusting your filters or search query</p>
        </motion.div>
      ) : (
        <motion.div
          className="promo-codes-grid"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredCodes.map((promo) => (
            <motion.div
              key={promo.id}
              className={`promo-card ${isExpired(promo.expiry_date) ? 'expired' : ''}`}
              variants={item}
              whileHover={{ y: -4 }}
              onClick={() =>
                setExpandedPromo(expandedPromo === promo.id ? null : promo.id)
              }
            >
              {/* Card Header */}
              <div className="card-header">
                <div className="discount-tag">
                  {getDiscountText(promo)}
                </div>
                {isExpired(promo.expiry_date) && (
                  <div className="expired-badge">EXPIRED</div>
                )}
              </div>

              {/* Card Body */}
              <div className="card-body">
                <h3 className="promo-code">{promo.code}</h3>
                <p className="promo-description">{promo.description}</p>

                {/* Quick Info */}
                <div className="quick-info">
                  {promo.min_cart_value && (
                    <div className="info-item">
                      <span className="label">Min Order:</span>
                      <span className="value">₹{promo.min_cart_value}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <FaClock className="icon" />
                    <span className="value">
                      Expires: {new Date(promo.expiry_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyCode(promo.code);
                  }}
                  className={`copy-btn ${copiedCode === promo.code ? 'copied' : ''}`}
                >
                  {copiedCode === promo.code ? '✓ Copied!' : (
                    <>
                      <FaCopy /> Copy Code
                    </>
                  )}
                </button>
              </div>

              {/* Expandable Details */}
              <motion.div
                initial={false}
                animate={{
                  height: expandedPromo === promo.id ? 'auto' : 0,
                  opacity: expandedPromo === promo.id ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="card-details"
              >
                <div className="details-content">
                  <h4>Terms & Conditions</h4>
                  <ul className="terms-list">
                    <li>
                      <strong>Type:</strong> {promo.discount_type === 'PERCENTAGE' ? 'Percentage' : 'Flat Amount'}
                    </li>
                    {promo.max_discount && (
                      <li>
                        <strong>Max Discount:</strong> ₹{promo.max_discount}
                      </li>
                    )}
                    {promo.usage_limit && (
                      <li>
                        <strong>Usage Limit:</strong> {promo.usage_limit} times
                      </li>
                    )}
                    {promo.used_count && promo.usage_limit && (
                      <li>
                        <strong>Used:</strong> {promo.used_count} / {promo.usage_limit} times
                      </li>
                    )}
                    <li>
                      <strong>Status:</strong> {promo.is_active ? '✓ Active' : '✗ Inactive'}
                    </li>
                  </ul>

                  {promo.applicable_tests && promo.applicable_tests.length > 0 && (
                    <>
                      <h4>Applicable Tests</h4>
                      <div className="applicable-tests">
                        {promo.applicable_tests.slice(0, 5).map((test, idx) => (
                          <span key={idx} className="test-tag">
                            {test}
                          </span>
                        ))}
                        {promo.applicable_tests.length > 5 && (
                          <span className="test-tag more">
                            +{promo.applicable_tests.length - 5} more
                          </span>
                        )}
                      </div>
                    </>
                  )}

                  {promo.is_applicable_to_all && (
                    <p className="applicable-message">
                      ✓ This code works on ALL tests and packages
                    </p>
                  )}

                  <a href={`/cart?promo=${promo.code}`} className="use-promo-link">
                    Use This Promo <FaExternalLinkAlt />
                  </a>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="promo-footer"
      >
        <div className="footer-content">
          <h3>How to Use Promo Codes?</h3>
          <ol className="steps-list">
            <li>Select your desired tests and add them to the cart</li>
            <li>Go to checkout and enter your promo code</li>
            <li>Click "Apply" to see the discount</li>
            <li>Complete your payment to enjoy instant savings</li>
          </ol>
        </div>
      </motion.div>
    </div>
  );
};

export default PromoCodesPage;
