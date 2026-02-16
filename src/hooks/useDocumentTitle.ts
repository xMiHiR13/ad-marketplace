import { useEffect } from "react";

const BASE_TITLE = "TG Ads Marketplace";

/**
 * Sets the document title for SEO and tab identification.
 * Appends the base app name as a suffix.
 */
export const useDocumentTitle = (title?: string) => {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
};
