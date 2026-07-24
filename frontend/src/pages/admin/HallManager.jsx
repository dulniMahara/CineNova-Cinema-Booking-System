import React, { useEffect, useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import { getHalls, createHall, deleteHall, updateHall } from "../../services/hallService"; 

import "./HallManager.css"; 

const HallManager = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState(null);

  // Initialize with safe defaults (10 and 12)
  const [name, setName] = useState("");
  const [rows, setRows] = useState(10); 
  const [cols, setCols] = useState(12);
  const [grid, setGrid] = useState([]); 

  useEffect(() => {
    fetchHalls();
  }, []);

  // Initialize Grid Logic
  useEffect(() => {
    // Only auto-generate grid if we are NOT in edit mode
    // (In edit mode, we load the grid from the DB explicitly)
    if (!editId) {
        generateGrid(rows, cols);
    }
  }, [rows, cols, editId]);

  const fetchHalls = async () => {
    try {
      const response = await getHalls();
      setHalls(response.data || []); // Ensure we always set an array
      setLoading(false);
    } catch (err) {
      console.error("Error fetching halls", err);
      setLoading(false);
    }
  };

  const generateGrid = (r, c) => {
    // --- SAFETY GUARD ---
    // If r or c is undefined/null/0, default to 10x12 to prevent crash
    const safeRows = Number(r) > 0 ? Number(r) : 10;
    const safeCols = Number(c) > 0 ? Number(c) : 12;

    const newGrid = Array(safeRows).fill().map(() => Array(safeCols).fill(1));
    setGrid(newGrid);
  };

  const toggleSeat = (rowIndex, colIndex) => {
    if (!grid || !grid[rowIndex]) return; // Extra safety check
    const newGrid = [...grid];
    newGrid[rowIndex][colIndex] = newGrid[rowIndex][colIndex] === 1 ? 0 : 1;
    setGrid(newGrid);
  };

  const calculateCapacity = () => {
    if (!grid || !Array.isArray(grid) || grid.length === 0) return 0;
    return grid.flat().filter(val => val === 1).length;
  };

  const handleEdit = (hall) => {
    setEditId(hall._id);
    setName(hall.name);
    
    // --- SAFETY GUARD FOR OLD DATA ---
    // If hall.totalRows is missing (old data), use 10.
    const safeRows = hall.totalRows || 10;
    const safeCols = hall.totalCols || 12;

    setRows(safeRows);
    setCols(safeCols);

    // Load existing layout if it exists, otherwise generate new one
    if (hall.seatLayout && hall.seatLayout.length > 0) {
        setGrid(hall.seatLayout);
    } else {
        generateGrid(safeRows, safeCols);
    }

    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name) return alert("Please enter a Hall Name");

    const payload = {
      name,
      totalRows: Number(rows),
      totalCols: Number(cols),
      seatLayout: grid,
      seatCapacity: calculateCapacity()
    };

    try {
      if (editId) {
         await updateHall(editId, payload);
         alert("Hall Updated!");
      } else {
         await createHall(payload);
         alert("Hall Created!");
      }
      
      resetForm();
      fetchHalls(); 
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error saving hall");
    }
  };

  const resetForm = () => {
    setName("");
    setRows(10);
    setCols(12);
    setEditId(null);
    setShowAddForm(false);
    generateGrid(10, 12);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this hall?")) return;
    try {
      await deleteHall(id);
      setHalls(halls.filter(hall => hall._id !== id)); 
    } catch (err) {
      console.error(err);
      alert("Failed to delete. Make sure Backend Routes are set up!");
    }
  };

  if (loading) return <div style={{padding:"40px", color:"white"}}>Loading...</div>;

  return (
    <>
      <div className="hallmanager-page">
        <div className="hallmanager-header">
          <h1 className="hallmanager-title">Cinema Hall Manager</h1>
          <button 
            className="hallmanager-add-btn" 
            onClick={() => {
                if (showAddForm) resetForm();
                else setShowAddForm(true);
            }}
          >
            {showAddForm ? "Close Form" : "Add New Hall"}
          </button>
        </div>

        {showAddForm && (
          <div className="hallmanager-controls slide-down">
              <div className="hall-form-header">
                  <h3>{editId ? "Edit Hall Layout" : "Create Seat Layout"}</h3>
                  <div className="capacity-badge">
                      Capacity: <strong>{calculateCapacity()}</strong> Seats
                  </div>
              </div>

              <div className="hall-inputs-row">
                  <div className="input-group">
                      <label>Hall Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. IMAX Hall" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="hallmanager-input"
                      />
                  </div>
                  <div className="input-group">
                      <label>Rows</label>
                      <input 
                        type="number" 
                        min="1" max="20"
                        value={rows}
                        onChange={(e) => setRows(e.target.value)}
                        className="hallmanager-input small"
                      />
                  </div>
                  <div className="input-group">
                      <label>Columns</label>
                      <input 
                        type="number" 
                        min="1" max="20"
                        value={cols}
                        onChange={(e) => setCols(e.target.value)}
                        className="hallmanager-input small"
                      />
                  </div>
              </div>

              <div className="seat-grid-container">
                  <p className="instruction-text">Click on boxes to create empty aisles.</p>
                  <div style={{overflowX: 'auto', width: '100%', display:'flex', justifyContent:'center'}}>
                    {grid && grid.length > 0 && (
                        <div 
                            className="visual-grid"
                            style={{
                                gridTemplateColumns: `repeat(${cols}, 1fr)`
                            }}
                        >
                            {grid.map((row, rIndex) => (
                                row.map((cell, cIndex) => (
                                    <div 
                                        key={`${rIndex}-${cIndex}`}
                                        className={`grid-cell ${cell === 1 ? "seat" : "aisle"}`}
                                        onClick={() => toggleSeat(rIndex, cIndex)}
                                        title={`Row ${rIndex+1}, Col ${cIndex+1}`}
                                    >
                                        {cell === 1 && <span className="seat-icon">💺</span>}
                                    </div>
                                ))
                            ))}
                        </div>
                    )}
                  </div>
              </div>

              <button onClick={handleSave} className="hallmanager-save-btn full-width">
                  {editId ? "Update Hall & Layout" : "Save Hall & Layout"}
              </button>
          </div>
        )}

        <div className="hallmanager-table-wrapper">
          {halls.length === 0 ? <div style={{padding:"20px", textAlign:"center"}}>No halls found.</div> : (
            <table className="hallmanager-table">
              <thead>
                <tr>
                  <th>HALL NAME</th>
                  <th>DIMENSIONS</th>
                  <th>CAPACITY</th>
                  <th className="text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {halls.map((hall) => (
                  <tr key={hall._id}>
                    <td style={{fontWeight:'bold'}}>{hall.name}</td>
                    <td>{hall.totalRows || "?"} x {hall.totalCols || "?"} Grid</td>
                    <td>{hall.seatCapacity} Seats</td>
                    <td className="text-right">
                      <button className="hallmanager-delete" onClick={() => handleEdit(hall)} style={{marginRight: '15px', color:'white'}}>
                          <MdEdit />
                      </button>
                      <button className="hallmanager-delete" onClick={() => handleDelete(hall._id)}>
                          <MdDelete />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Footer is handled by layout */}
    </>
  );
};

export default HallManager;