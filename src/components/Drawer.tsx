import {
  Drawer,
  Box,
  Typography,
  Divider,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ColoredBadge from "./ColoredBadge";
import ComposedColorBar from "./ComposedColorBadge";


const ElementDrawer = ({ open, onClose, elementData, analyticAspect }) => {

  if (!elementData) return null;

  const isEdge = !!elementData.source && !!elementData.target;


  const renderPropertyList = (props: Record<string, any>) => (
    <Box className="space-y-3 text-sm text-stone-700">
      {Object.entries(props).map(([key, val]) => (
        (key != "composedDimension" && key != 'dimension' && key != 'metric' && key!='bundle') &&
        <Box key={key}>
          <Typography
            variant="subtitle2"
            className="mb-1"
          >
            {key}
          </Typography>
  
          {Array.isArray(val) && val.every(item => typeof item === 'object' && item !== null) ? (
            <Box className="space-y-2">
              {val.map((item, idx) => (
                <Paper
                  key={idx}
                  elevation={0}
                  sx={{
                    px: 1,
                    py:0.5,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1,
                  }}
                >
                  {Object.entries(item).map(([subKey, subVal]) => (
                    <Box key={subKey}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, color: 'text.secondary' }}
                      >
                        {subKey}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="break-words px-2 py-1 rounded  text-stone-700"
                        sx={{
                          wordBreak: "break-word",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {String(subVal)}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography
              variant="body2"
              className="break-words bg-stone-100 px-2 py-1 rounded"
              sx={{
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              {Array.isArray(val)
                ? val.map(String).join(', ')
                : String(val)}
            </Typography>

          )}
        </Box>
      ))}
    </Box>
  );
  
  

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 320 },
          display: "flex",
          flexDirection: "column",
        },
      }}
      variant="persistent"
    >
      <Box
        p={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          backgroundColor: "background.paper",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6">{isEdge ? "Edge Detail" : "Node Detail"}</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />

      <Box p={2} sx={{ overflowY: "auto", overflowX: "hidden", flex: 1 }}>
        <Box className="space-y-3 text-sm text-stone-700">
          {!isEdge && (
            <Box>
              <Typography variant="subtitle2">Name:</Typography>
              <Typography variant="body2" className="bg-stone-100 px-2 py-1 rounded break-words">
                {elementData?.label}
              </Typography>
            </Box>
          )}

          <Box>
            <Typography variant="subtitle2">ID:</Typography>
            <Typography variant="body2" className="break-words bg-stone-100 px-2 py-1 rounded">
              {elementData.id}
            </Typography>
          </Box>

          {!isEdge && (
            <Box>
              <Typography variant="subtitle2">Labels:</Typography>
              <Typography variant="body2" className="break-words bg-stone-100 px-2 py-1 rounded">{elementData.labels.join(", ")}</Typography>
            </Box>
          )}

          {isEdge && (
            <Box>
              <Typography variant="subtitle2">Edge Label:</Typography>
              <Typography variant="body2" className="break-words bg-stone-100 px-2 py-1 rounded">{elementData.label}</Typography>
            </Box>
          )}

          {isEdge && (
            <Box>
              <Typography variant="subtitle2">Source:</Typography>
              <Typography variant="body2" className="break-words bg-stone-100 px-2 py-1 rounded">{elementData.source}</Typography>
            </Box>
          )}

          {isEdge && (
            <Box>
              <Typography variant="subtitle2">Target:</Typography>
              <Typography variant="body2" className="break-words bg-stone-100 px-2 py-1 rounded">{elementData.target}</Typography>
            </Box>
          )}

          {elementData.properties && (
            <Accordion
              defaultExpanded={false}
              disableGutters
              sx={{
                boxShadow: "none",
                bgcolor: "transparent",
                "&::before": { display: "none" },
                mt: 1,
              }}
            >
              <AccordionSummary
                expandIcon={null}
                sx={{
                  minHeight: 0,
                  px: 0,
                  '& .MuiAccordionSummary-content': {
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <ExpandMoreIcon
                    fontSize="small"
                    sx={{
                      transform: 'rotate(-90deg)',
                      transition: 'transform 0.2s',
                      '.Mui-expanded &': {
                        transform: 'rotate(0deg)',
                      },
                    }}
                  />
                  <Typography variant="subtitle2">Properties:</Typography>
                </Box>
              </AccordionSummary>    
              <AccordionDetails sx={{ px: 0, pt: 1 , pb:0 }}>
                {renderPropertyList(elementData.properties)}
              </AccordionDetails>
            </Accordion>
          )}

          {!isEdge && elementData?.properties?.dimension && (
            <Accordion
              defaultExpanded={false}
              disableGutters
              sx={{
                boxShadow: "none",
                bgcolor: "transparent",
                "&::before": { display: "none" },
                // mt: 1,
              }}
            >
              <AccordionSummary
                expandIcon={null}
                sx={{
                  minHeight: 0,
                  px: 0,
                  '& .MuiAccordionSummary-content': {
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <ExpandMoreIcon
                    fontSize="small"
                    sx={{
                      transform: 'rotate(-90deg)',
                      transition: 'transform 0.2s',
                      '.Mui-expanded &': {
                        transform: 'rotate(0deg)',
                      },
                    }}
                  />
                  <Typography variant="subtitle2">Dimension:</Typography>
                </Box>
              </AccordionSummary>    
              <AccordionDetails sx={{ px: 0, pt: 1, pb:0 }}>
                <Box>
                  {Object.entries(elementData?.properties?.dimension).map(([dimKey, dimVals]) => (
                    <Box key={dimKey} sx={{ mt: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{dimKey.split(":")[1]}</Typography>
                      <Box sx={{ display: "flex",flexDirection: "column", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
                        {(dimVals as any).map((val: string, i: number) => (
                          <ColoredBadge
                            key={`${dimKey}-${val}-${i}`}
                            label={val == "-"? "---" : val.split(":")[1]}
                            color={val =="-"? "": analyticAspect?.colorMap?.[dimKey]?.[val]}
                          />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {!isEdge && elementData?.properties?.metric && (
            <Accordion
              defaultExpanded={false}
              disableGutters
              sx={{
                boxShadow: "none",
                bgcolor: "transparent",
                "&::before": { display: "none" },
                mt: 1,
              }}
            >
              <AccordionSummary
                expandIcon={null}
                sx={{
                  minHeight: 0,
                  px: 0,
                  '& .MuiAccordionSummary-content': {
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <ExpandMoreIcon
                    fontSize="small"
                    sx={{
                      transform: 'rotate(-90deg)',
                      transition: 'transform 0.2s',
                      '.Mui-expanded &': {
                        transform: 'rotate(0deg)',
                      },
                    }}
                  />
                  <Typography variant="subtitle2">Metrics:</Typography>
                </Box>
              </AccordionSummary>    
              <AccordionDetails sx={{ px: 0, pt: 1 }}>
                <Box mt={1}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", mt: 0.5 }}>
                    {Object.entries(elementData?.properties?.metric).map(([metricKey, metricValue]: any) => (
                      <ColoredBadge
                        key={metricKey.split(":")[1]}
                        label={`${metricKey.split(":")[1]}:     ${metricValue}`}
                        color=""
                      />
                    ))}
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {!isEdge && elementData?.properties?.composedDimension && (
            <Accordion
              defaultExpanded={false}
              disableGutters
              sx={{
                boxShadow: "none",
                bgcolor: "transparent",
                "&::before": { display: "none" },
                mt: 1,
              }}
            >
              <AccordionSummary
                expandIcon={null}
                sx={{
                  minHeight: 0,
                  px: 0,
                  '& .MuiAccordionSummary-content': {
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <ExpandMoreIcon
                    fontSize="small"
                    sx={{
                      transform: 'rotate(-90deg)',
                      transition: 'transform 0.2s',
                      '.Mui-expanded &': {
                        transform: 'rotate(0deg)',
                      },
                    }}
                  />
                  <Typography variant="subtitle2">Composed Dimension:</Typography>
                </Box>
              </AccordionSummary>    
              <AccordionDetails sx={{ px: 0, pt: 1 , pb:0 }}>
    <Box mt={1}>
      {Object.entries(elementData.properties.composedDimension).map(([dimKey, dimVals]: any) => {
        const colorMap = analyticAspect?.colorMap?.[dimKey] || {};
        const categoryOrder =
          analyticAspect?.dimension.find((dim) => dim.id === dimKey)?.categories || [];

        const sortedEntries = categoryOrder.length
          ? Object.entries(dimVals).sort(
              ([a], [b]) =>
                categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
            )
          : Object.entries(dimVals);

        return (
          <Box key={dimKey} sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{dimKey.split(":")[1]}</Typography>

            <ComposedColorBar
              distribution={dimVals}
              colorMap={colorMap}
              categoryOrder={categoryOrder}
            />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3, mt: 0.5 }}>
              {sortedEntries.map(([val, count]: any) => (
                <ColoredBadge
                  key={`${dimKey}-${val}`}
                  label={val != "-"? `${val.split(":")[1]} (${count})`: "---"}
                  color={colorMap[val]}
                />
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
              </AccordionDetails>
            </Accordion>
          )}

        </Box>
      </Box>
    </Drawer>
  );
};

export default ElementDrawer;
