import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  up:    { hidden: { opacity: 0, y: 40 },            visible: { opacity: 1, y: 0 } },
  down:  { hidden: { opacity: 0, y: -40 },           visible: { opacity: 1, y: 0 } },
  left:  { hidden: { opacity: 0, x: -60 },           visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 60 },            visible: { opacity: 1, x: 0 } },
  zoom:  { hidden: { opacity: 0, scale: 0.85 },      visible: { opacity: 1, scale: 1 } },
  flip:  { hidden: { opacity: 0, rotateX: 25, y: 30 }, visible: { opacity: 1, rotateX: 0, y: 0 } },
};

const AnimatedSection = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.7,
  once = true,
}) => {
  const v = variants[direction] || variants.up;
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-80px' }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      variants={v}
      style={{ perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
