import { useRef, useState } from 'react';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const FileUpload = ({ setGraph }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        setGraph(jsonData);
      } catch (error) {
        alert('Error parsing JSON file');
        setFileName(null);
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <Box 
      className="mb-3" 
      width="100%" 
      display="flex" 
      flexDirection="column"
    >
      <Typography variant="subtitle1">Upload Graph</Typography>

      <Paper
        variant="outlined"
        className="flex items-center w-full cursor-pointer bg-stone-200"
        onClick={() => fileInputRef.current?.click()}
        sx={{
          bgcolor: 'secondary.main',
        }}
      >
        <Typography
          variant="body2"
          className="text-gray-600 truncate flex-1 px-2"
        >
          {fileName || "Upload File"}
        </Typography>

        <Box className="border-l px-2 flex items-center border-gray-300">
          <IconButton size="small" edge="end" className="flex items-center justify-center w-full">
            <UploadFileIcon color="primary" />
          </IconButton>
        </Box>
      </Paper>

      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />
    </Box>
  );
};

export default FileUpload;
