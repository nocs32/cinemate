// YouTube's IFrame API calls this once it has loaded (services/players/youtube-api.ts).
interface Window {
  onYouTubeIframeAPIReady?: () => void;
}
