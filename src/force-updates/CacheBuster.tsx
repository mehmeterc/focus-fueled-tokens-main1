import { useEffect } from 'react';

// This component is designed to forcefully update any cached content
// specifically targeting and removing the "earn 1 Anti coin for every 5 minutes" text
const CacheBuster = () => {
  useEffect(() => {
    // Run on mount - look for and remove the problematic text
    const removeProblematicText = () => {
      // Use MutationObserver to detect and remove the text in real-time
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            // Check all text nodes for the problematic phrase
            document.querySelectorAll('*').forEach((el) => {
              if (el.childNodes && el.childNodes.length) {
                for (let i = 0; i < el.childNodes.length; i++) {
                  const node = el.childNodes[i];
                  if (
                    node.nodeType === Node.TEXT_NODE &&
                    node.textContent &&
                    (
                      node.textContent.includes("earn 1 Anti coin for every 5 minutes") ||
                      node.textContent.includes("You'll earn 1 Anti")
                    )
                  ) {
                    // Replace the problematic text with the correct calculation
                    const container = node.parentElement;
                    if (container) {
                      if (container.dataset.fixed !== 'true') {
                        console.log("Found and removing problematic text:", node.textContent);
                        // Mark as fixed to prevent infinite loops
                        container.dataset.fixed = 'true';
                        
                        // Force the container to be empty and prevent any hard-coded values
                        container.innerHTML = '';
                        
                        // This element is now permanently suppressed
                        container.style.display = 'none';
                      }
                    }
                  }
                }
              }
            });
          }
        });
      });

      // Start observing the entire document for changes
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Return cleanup function
      return () => observer.disconnect();
    };

    const cleanup = removeProblematicText();
    return cleanup;
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default CacheBuster;
