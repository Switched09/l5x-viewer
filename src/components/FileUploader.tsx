import { useState } from 'react';
import axios from 'axios';
import { ControllerNode } from '../types/L5XTypes';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5193';

interface Props {
  onParsed: (data: ControllerNode) => void;
}

export function FileUploader({ onParsed }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post<ControllerNode>(
        `${API_URL}/api/l5x/parse`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      onParsed(response.data);
    } catch (err: any) {
      setError(err.response?.data || 'Upload failed. Check the file and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept=".L5X,.l5x" onChange={handleFile} />
      {loading && <p>Parsing file...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}