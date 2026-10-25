// YouTube's IFrame API, loaded once on first use. Returns a function that resolves with `YT`.
export const createYouTubeApi = (): (() => Promise<typeof YT>) => {
  let ready: Promise<typeof YT> | null = null;

  return () => {
    ready ??= new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve(window.YT);
      };

      const script = document.createElement('script');

      script.src = 'https://www.youtube.com/iframe_api';
      document.head.append(script);
    });

    return ready;
  };
};
