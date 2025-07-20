import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { saveAs } from 'file-saver';

const DownloadGraph = ({ cyInstance }) => {
    const downloadGraphAsPng = () => {
    if (!cyInstance) return;
      const pngData = cyInstance.png({ full: true });
      const byteString = atob(pngData.split(',')[1]);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uint8Array = new Uint8Array(arrayBuffer);

      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([uint8Array], { type: 'image/png' });
      saveAs(blob, 'graph.png');
    };

  return (
    <Button
      fullWidth
      variant="contained"
      color="primary"
      onClick={downloadGraphAsPng}
      startIcon={<DownloadIcon />}
    >
      Download Graph as PNG
    </Button>
  );
};

export default DownloadGraph;