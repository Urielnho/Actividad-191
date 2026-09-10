import { useVideoPlayer, VideoView } from "expo-video";
export function VideoPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri);
  return (
    <VideoView
      player={player}
      style={{ width: "100%", height: 260, borderRadius: 18 }}
      nativeControls
      allowsPictureInPicture={false}
    />
  );
}
