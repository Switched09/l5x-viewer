import { useState } from 'react';
import axios from 'axios';
import { ControllerNode } from '../types/L5XTypes';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface Props {
  onParsed: (data: ControllerNode, file: File) => void;
}

export function FileUploader({ onParsed }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post<ControllerNode>(
        `${API_URL}/swagger/l5x/parse`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      onParsed(response.data, file);
    } catch (err: any) {
      setError(err.response?.data || 'Upload failed. Check the file and try again.');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <label style={{
        padding: '0.35rem 0.9rem',
        background: '#fff',
        color: '#1e3a5f',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: 600,
        border: '1px solid #cbd5e1',
      }}>
        {loading ? 'Parsing…' : '📂 Open .L5X File'}
        <input
          type="file"
          accept=".L5X,.l5x"
          onChange={handleFile}
          style={{ display: 'none' }}
        />
      </label>
      {error && (
        <span style={{ color: '#fca5a5', fontSize: '0.82rem' }}>{error}</span>
      )}
    </div>
  );
}