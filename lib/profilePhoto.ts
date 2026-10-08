import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

// Photos are cropped square and shrunk hard: the result is stored inline on
// the member row and sent to everyone in the group, so it has to stay small.
const PHOTO_SIZE = 128;
const PHOTO_QUALITY = 0.7;

// Opens the photo library and returns the chosen picture as a small JPEG data
// URL, or null if nothing was picked. `onPicked` fires once a picture is
// chosen and the shrinking starts; some browsers never report a closed
// picker, so callers shouldn't show a busy state before that.
export async function pickProfilePhoto(onPicked?: () => void): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });
  if (result.canceled || !result.assets?.[0]) return null;

  onPicked?.();
  const asset = result.assets[0];
  let { width, height } = asset;
  let source = ImageManipulator.manipulate(asset.uri);
  if (!width || !height) {
    // The picker doesn't always know the size; render once to find out.
    const original = await source.renderAsync();
    width = original.width;
    height = original.height;
    source = ImageManipulator.manipulate(original);
  }

  const side = Math.min(width, height);
  const rendered = await source
    .crop({
      originX: Math.floor((width - side) / 2),
      originY: Math.floor((height - side) / 2),
      width: side,
      height: side,
    })
    .resize({ width: PHOTO_SIZE, height: PHOTO_SIZE })
    .renderAsync();
  const saved = await rendered.saveAsync({
    format: SaveFormat.JPEG,
    compress: PHOTO_QUALITY,
    base64: true,
  });
  return saved.base64 ? `data:image/jpeg;base64,${saved.base64}` : null;
}
