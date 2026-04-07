import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
    children: React.ReactNode;
    className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -5 }}
            transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
            className={`w-full min-h-screen ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
