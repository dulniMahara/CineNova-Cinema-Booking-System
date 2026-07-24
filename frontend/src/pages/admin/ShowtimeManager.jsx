import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete } from "react-icons/md";
import { getShowtimes, deleteShowtime } from "../../services/showtimeService"; 
import "./ShowtimeManager.css";

const ShowtimeManager = () => {
  const navigate = useNavigate();
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        const params = {
          date: filterDate || undefined
        };
        
        const response = await getShowtimes(params);
        const data = response.data ? response.data : response; 
        setShowtimes(data);
      } catch (error) {
        console.error("Error fetching showtimes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, [filterDate]);

  const handleEdit = (id) => {
    navigate(`/admin/showtimes/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this showtime?")) return;

    try {
      await deleteShowtime(id);
      setShowtimes(showtimes.filter((st) => st._id !== id));
    } catch (error) {
      console.error("Error deleting showtime:", error);
    }
  };

  const handleAdd = () => {
    navigate("/admin/showtimes/add");
  };

  if (loading) return <div className="showtimemanager-page__loading">Loading showtimes...</div>;

  return (
    <div className="showtimemanager-page">
      <div className="showtimemanager-header">
        <h1 className="showtimemanager-title">Showtime Manager</h1>
        <button className="showtimemanager-add-btn" onClick={handleAdd}>
          Add New Showtime
        </button>
      </div>

      <div className="showtimemanager-filters">
        <input 
          type="date" 
          value={filterDate} 
          onChange={(e) => setFilterDate(e.target.value)} 
          placeholder="Filter by Date"
        />
      </div>

      <div className="showtimemanager-table-wrapper">
        <table className="showtimemanager-table">
          <thead>
            <tr>
              <th>Movie</th>
              <th>Hall</th>
              <th>Date</th>
              <th>Time</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {showtimes.length > 0 ? (
              showtimes.map((st) => (
                <tr key={st._id}>
                  <td>{st.movie?.title || "Unknown Movie"}</td>
                  <td>{st.hall?.name || "Unknown Hall"}</td>
                  <td>{new Date(st.date).toLocaleDateString()}</td>
                  <td>{st.startTime}</td>
                  <td>Rs. {st.price}</td>
                  <td className="showtimemanager-actions">
                    <MdEdit
                      className="showtimemanager-edit"
                      onClick={() => handleEdit(st._id)}
                    />
                    <MdDelete
                      className="showtimemanager-delete"
                      onClick={() => handleDelete(st._id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{textAlign: "center"}}>No showtimes found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShowtimeManager;