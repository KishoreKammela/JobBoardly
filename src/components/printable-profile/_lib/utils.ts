export const truncateText = (
  text: string | undefined,
  maxLength: number
): string => {
  if (!text) return 'N/A';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
