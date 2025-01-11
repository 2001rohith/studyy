import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';
import { useApiClient } from "../../utils/apiClient";
import { useUser } from "../../UserContext";
import debounce from 'lodash/debounce';

function StudentAllCourses() {
  const apiClient = useApiClient();
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modulesFilter, setModulesFilter] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const itemsPerPage = 4;

  // Debounced search function
  const debouncedSearch = debounce((searchTerm) => {
    setSearch(searchTerm);
    setCurrentPage(1);
  }, 500);

  useEffect(() => {
    fetchCourses();
  }, [currentPage, search, modulesFilter]);

  const fetchCourses = async () => {
    try {
      if (!user?.id) {
        setError('User information not found');
        navigate("/", { replace: true });
        return;
      }

      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: search,
        modulesFilter: modulesFilter
      });

      const response = await apiClient.get(
        `/course/home-get-courses/${user.id}?${queryParams}`
      );

      if (response.status === 200) {
        const { courses, totalPages, totalCourses } = response.data;
        setCourses(courses || []);
        setTotalPages(totalPages);
        setTotalCourses(totalCourses);
      }
    } catch (error) {
      console.error("Error in fetching courses:", error);
      setError(error.response?.data?.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const clearSearch = () => {
    setSearch('');
    setCurrentPage(1);
  };

  const handleModulesFilter = (value) => {
    setModulesFilter(value);
    setCurrentPage(1);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="pagination-controls text-center mt-3">
        <button 
          className="btn btn-outline-primary mx-1"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        
        {[...Array(totalPages).keys()].map((num) => {
          const pageNum = num + 1;
          // Show first page, last page, current page, and pages around current page
          if (
            pageNum === 1 ||
            pageNum === totalPages ||
            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
          ) {
            return (
              <button
                key={pageNum}
                className={`btn ${currentPage === pageNum ? 'btn-primary' : 'btn-outline-primary'} mx-1`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          } else if (
            pageNum === currentPage - 2 ||
            pageNum === currentPage + 2
          ) {
            return <span key={pageNum} className="mx-1">...</span>;
          }
          return null;
        })}
        
        <button 
          className="btn btn-outline-primary mx-1"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  if (loading && !courses.length) {
    return (
      <div className="spinner-border text-primary spinner2" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col text-light side-bar">
        <StudentSidebar />
      </div>
      <div className="col text-dark">
        <div className="row headers">
          <h4>Courses</h4>
        </div>
        <div className="row table-content">
          <div className="search-bar ms-1 border-bottom pb-3">
            <input
              type="text"
              placeholder="Search course..."
              defaultValue={search}
              onChange={handleSearchChange}
              className="form-control d-inline-block w-auto"
            />
            <button
              className="btn search-bar-button ms-2"
              onClick={clearSearch}
              disabled={!search}
            >
              Clear
            </button>
            <div className="dropdown ms-2 d-inline-block">
              <button
                className="btn filter-button dropdown-toggle"
                type="button"
                id="dropdownMenuButton"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {modulesFilter || "Modules"}
              </button>
              <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <li>
                  <button className="dropdown-item" onClick={() => handleModulesFilter('')}>
                    Default
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => handleModulesFilter('Less')}>
                    1-2 Modules
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => handleModulesFilter('Medium')}>
                    3-4 Modules
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => handleModulesFilter('More')}>
                    4+ Modules
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              {error}
            </div>
          )}

          <div className="row mt-3 text-dark">
            <h5 className="mb-3">Our courses! ({totalCourses} total)</h5>
            <div className="scroll-container">
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : courses.length === 0 ? (
                <div className="alert alert-info" role="alert">
                  No courses match your search criteria.
                </div>
              ) : (
                <div className="row row-cols-1 row-cols-md-2 g-4">
                  {courses.map((course) => (
                    <div className="col" key={course._id}>
                      <div className="card course-card h-100">
                        <img
                          src="/course-card1.jpg"
                          className="card-img-top"
                          alt="Course thumbnail"
                          style={{ height: '200px', objectFit: 'cover', borderRadius: "15px" }}
                        />
                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title">{course.title}</h5>
                          <p className="card-text flex-grow-1">{course.description}</p>
                          <div className="text-center mt-auto">
                            <button
                              className="btn button"
                              onClick={() => navigate("/student-check-course", { state: { courseId: course._id } })}
                            >
                              More
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {renderPagination()}
        </div>
      </div>
    </div>
  );
}

export default StudentAllCourses;