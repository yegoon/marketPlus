// src/components/CsvViewer.jsx
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const CsvViewer = ({ fileId }) => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: csvData, error } = await supabase
          .from('market_data')
          .select('*')
          .eq('file_id', fileId);

        if (error) throw error;
        if (csvData.length > 0) {
          setHeaders(Object.keys(csvData[0]));
          setData(csvData);
        }
      } catch (error) {
        console.error('Error loading CSV data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fileId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="overflow-auto max-h-[70vh]">
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header} className="font-bold">
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {headers.map((header) => (
                  <TableCell key={`${rowIndex}-${header}`}>
                    {row[header] || '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default CsvViewer;