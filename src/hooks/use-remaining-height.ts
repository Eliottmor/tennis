import { useEffect, useState } from 'react';

const getContainerElement = () => {
  return window.document.getElementById('tennis-main');
};

export const useRemainingHeight = (componentRef: React.RefObject<HTMLElement>) => {
  const [remainingHeight, setRemainingHeight] = useState(0);

  useEffect(() => {
    const calculateHeights = () => {
      if (!componentRef.current) return;
      
      const container = getContainerElement();
      if (!container) return;

      const componentTop = componentRef.current.getBoundingClientRect().top;
      const adjustedTop = componentTop - container.getBoundingClientRect().y || 0
      
      // Calculate remaining height from component to bottom of window
      const windowHeight = window.innerHeight;
      const remainingSpace = windowHeight - adjustedTop
      
      setRemainingHeight(Math.max(0, remainingSpace));
    };

    calculateHeights();
    window.addEventListener('resize', calculateHeights);
    
    return () => {
      window.removeEventListener('resize', calculateHeights);
    };
  }, [componentRef]);

  return {
    remainingHeight,
  };
};
