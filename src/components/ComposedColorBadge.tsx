import {
  Box,
} from "@mui/material";

const ComposedColorBar = ({
  distribution,
  colorMap,
  categoryOrder = []
}: {
  distribution: Record<string, number>;
  colorMap: Record<string, string>;
  categoryOrder?: string[];
}) => {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);

  const entries = Object.entries(distribution);

  const sortedEntries = categoryOrder.length
    ? [...entries].sort(
        ([a], [b]) =>
          categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
      )
    : entries;

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: 12,
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid #ddd',
        mt: 0.5,
        mb: 1
      }}
    >
      {sortedEntries.map(([key, value]) => {
        const widthPercent = (value / total) * 100;
        const color = colorMap?.[key] || '#ccc';
        return (
          <Box
            key={key}
            title={`${key} (${value})`}
            sx={{
              backgroundColor: color,
              width: `${widthPercent}%`,
              height: '100%',
              transition: 'width 0.3s',
            }}
          />
        );
      })}
    </Box>
  );
};

export default ComposedColorBar;