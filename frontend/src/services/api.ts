import { ApiData } from '../types';

export const fetchDataForSlug = (slug: string): Promise<ApiData> => {
  console.log(`Fetching data for slug: ${slug}`);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (slug === '404-example') {
        reject(new Error(`Data for slug '${slug}' not found.`));
      } else {
        const mockData: ApiData = {
          id: slug,
          title: `Data for ${slug.replace(/-/g, ' ')}`,
          content: `This is the dynamic content fetched from a mock API for the slug '${slug}'. It was loaded on the client-side by React after the initial page load from Flask.`,
        };
        resolve(mockData);
      }
    }, 1000); // Simulate a 1-second network delay
  });
};