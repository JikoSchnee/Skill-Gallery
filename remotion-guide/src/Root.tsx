import { Composition } from "remotion";
import { Guide } from "./Composition";
export const RemotionRoot = () => (
  <Composition
    id="RemotionGuide"
    component={Guide}
    width={1280}
    height={720}
    fps={30}
    durationInFrames={1320}
  />
);
