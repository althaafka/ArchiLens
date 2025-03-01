const FileUpload = ({ setGraph }) => {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result as string);
        setGraph(jsonData);
      } catch (error) {
        console.error('Error parsing JSON file:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <h2>Upload Graph</h2>
      <input type="file" accept=".json" onChange={handleFileUpload} />
    </div>
  );
};

export default FileUpload;