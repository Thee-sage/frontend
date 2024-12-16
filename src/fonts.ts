// src/fonts.ts
export const loadNunito = () => {
    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&display=swap';
      link.rel = 'stylesheet';
      link.onload = () => resolve(true);
      document.head.appendChild(link);
    });
  };