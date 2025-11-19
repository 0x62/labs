import React, { useState, useEffect, useMemo } from 'react';
import katex from 'katex';

interface MathDisplayProps {
  latex: string;
  block?: boolean;
  className?: string;
}

const MathDisplay: React.FC<MathDisplayProps> = ({ latex, block = false, className = "" }) => {
  const [isClient, setIsClient] = useState(false);

  // Ensure CSS is loaded
  useEffect(() => {
    setIsClient(true);
    if (!document.getElementById('katex-css-dynamic')) {
      const link = document.createElement('link');
      link.id = 'katex-css-dynamic';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  }, []);

  const content = useMemo(() => {
    if (!isClient) return latex;

    const renderMath = (math: string, isBlock: boolean) => {
      try {
        return katex.renderToString(math, {
          throwOnError: false,
          displayMode: isBlock,
          output: 'html',
          strict: false,
          trust: true
        });
      } catch (e) {
        console.error("KaTeX render error:", e);
        return math;
      }
    };

    // If it's a block-level element passed as pure latex, render immediately
    if (block) {
      return (
        <div 
          className={`katex-block overflow-x-auto ${className}`}
          dangerouslySetInnerHTML={{ __html: renderMath(latex, true) }} 
        />
      );
    }

    // For inline/mixed content, parse by '$' delimiters
    // Even indices are text, Odd indices are math
    // Handles cases like "Solve for $x$ using..."
    const parts = latex.split('$');
    
    return (
      <span className={className}>
        {parts.map((part, index) => {
          if (index % 2 === 0) {
            // Text part
            return <span key={index}>{part}</span>;
          } else {
            // Math part (inside $$)
            return (
              <span 
                key={index} 
                dangerouslySetInnerHTML={{ __html: renderMath(part, false) }}
              />
            );
          }
        })}
      </span>
    );

  }, [latex, block, isClient, className]);

  return <>{content}</>;
};

export default MathDisplay;