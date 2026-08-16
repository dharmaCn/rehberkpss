import { AGS_TOPIC_META, AgsCategory } from '../constants/agsTopicMeta';

export function getAgsTopicLabel(cat: AgsCategory): string {
  return AGS_TOPIC_META[cat].label;
}

export function getAgsTopicColor(cat: AgsCategory): string {
  return AGS_TOPIC_META[cat].color;
}
