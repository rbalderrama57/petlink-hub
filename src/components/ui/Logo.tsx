import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-xl' },
    md: { icon: 'w-10 h-10', text: 'text-2xl' },
    lg: { icon: 'w-14 h-14', text: 'text-4xl' },
  };

  return (
    <motion.div 
      className="flex items-center gap-3"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`${sizes[size].icon} relative`}>
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-glow"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative flex items-center justify-center h-full">
          <svg 
            viewBox="0 0 24 24" 
            className="w-2/3 h-2/3 text-primary-foreground"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${sizes[size].text} font-bold gradient-text leading-none`}>
            Ampet
          </span>
          <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
            Pet Health Hub
          </span>
        </div>
      )}
    </motion.div>
  );
}
