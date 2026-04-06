import React from 'react';
import PropTypes from 'prop-types';
import { FaHourglassHalf, FaCheckCircle, FaTimesCircle, FaCheckDouble, FaSyringe } from 'react-icons/fa';
import { motion } from 'framer-motion';

export type BadgeStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'SAMPLE_COLLECTED';

/**
 * Props for the StatusBadge component.
 */
export interface StatusBadgeProps {
    /** The status to be displayed by the badge */
    status: BadgeStatus;
    /** Extra class names for styling overrides */
    className?: string;
}

/**
 * A reusable badge component for displaying system statuses with matching icons and colors.
 *
 * @param {StatusBadgeProps} props - The component props.
 * @returns {React.ReactElement} The rendered StatusBadge component.
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
    const config = {
        PENDING: {
            colors: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            icon: <FaHourglassHalf className="mr-1.5 h-3 w-3" />,
            label: 'Pending',
        },
        CONFIRMED: {
            colors: 'bg-green-100 text-green-800 border-green-200',
            icon: <FaCheckCircle className="mr-1.5 h-3 w-3" />,
            label: 'Confirmed',
        },
        CANCELLED: {
            colors: 'bg-red-100 text-red-800 border-red-200',
            icon: <FaTimesCircle className="mr-1.5 h-3 w-3" />,
            label: 'Cancelled',
        },
        COMPLETED: {
            colors: 'bg-blue-100 text-blue-800 border-blue-200',
            icon: <FaCheckDouble className="mr-1.5 h-3 w-3" />,
            label: 'Completed',
        },
        SAMPLE_COLLECTED: {
            colors: 'bg-purple-100 text-purple-800 border-purple-200',
            icon: <FaSyringe className="mr-1.5 h-3 w-3" />,
            label: 'Sample Collected',
        },
    };

    const currentConfig = config[status] || config.PENDING;

    return (
        <motion.span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentConfig.colors} ${className}`}
            animate={status === 'PENDING' ? { opacity: [1, 0.6, 1] } : undefined}
            transition={status === 'PENDING' ? { repeat: Infinity, duration: 1.5 } : undefined}
        >
            {currentConfig.icon}
            {currentConfig.label}
        </motion.span>
    );
};

StatusBadge.propTypes = {
    status: PropTypes.oneOf(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'SAMPLE_COLLECTED']).isRequired,
    className: PropTypes.string,
};

export default React.memo(StatusBadge);
