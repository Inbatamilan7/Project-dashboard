import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import './App.css';

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/board" element={<TaskBoard />} />
            <Route path="/task/:id" element={<TaskDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Navbar() {
  return (
    <nav className="navbar">
      <h2> c:\Users\thirumalaivasan\Downloads\5ba46ee8d4038c8c8d80ae830a879ac2.png ProTask Dashboard</h2>
      <div className="nav-links">
        <Link to="/">Overview</Link>
        <Link to="/board">Task Board</Link>
      </div> 
    </nav>
  );
}

function useTasks() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('dashboard_tasks');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Design Landing Page', description: 'Create wireframes and UI components', status: 'pending', priority: 'High', assignee: 'Alice' },
      { id: '2', title: 'API Integration', description: 'Connect frontend to backend endpoints', status: 'In Progress', priority: 'Medium', assignee: 'Bob' },
      { id: '3', title: 'Security Audit', description: 'Check for vulnerabilities and fix bugs', status: 'Review', priority: 'High', assignee: 'Maria' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('dashboard_tasks', JSON.stringify(tasks));
  }, [tasks]);

  return [tasks, setTasks];
}

function Dashboard() {
  const [tasks] = useTasks();
  const total = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const reviewCount = tasks.filter(t => t.status === 'Review').length;
  const doneCount = tasks.filter(t => t.status === 'Done').length;

  return (
    <div className="dashboard-page">
      <h2>Project Overview & Analytics</h2>
      <div className="stats-grid">
        <div className="stat-card"><h3>Total Tasks</h3><p>{total}</p></div>
        <div className="stat-card"><h3>pending</h3><p>{pendingCount}</p></div>
        <div className="stat-card"><h3>In Progress</h3><p>{inProgressCount}</p></div>
        <div className="stat-card"><h3>Review</h3><p>{reviewCount}</p></div>
        <div className="stat-card"><h3>Done</h3><p>{doneCount}</p></div>
      </div>
      <div className="quick-actions" style={{marginTop: '30px'}}>
        <Link to="/board" className="btn-primary">Open Task Board →</Link>
      </div>
    </div>
  );
}

function TaskBoard() {
  const [tasks, setTasks] = useTasks();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('Medium');
  const [assignee, setAssignee] = useState('');

  const openCreateModal = () => {
    setCurrentTask(null);
    setTitle('');
    setDescription('');
    setStatus('Tod o');
    setPriority('Medium');
    setAssignee('');
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setCurrentTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setPriority(task.priority);
    setAssignee(task.assignee);
    setIsModalOpen(true);
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (currentTask) {
      setTasks(tasks.map(t => t.id === currentTask.id ? { ...t, title, description, status, priority, assignee } : t));
    } else {
      const newTask = {
        id: Date.now().toString(),
        title,
        description,
        status,
        priority,
        assignee: assignee || 'Unassigned'
      };
      setTasks([...tasks, newTask]);
    }
    setIsModalOpen(false);
  };

  const handleStatusChange = (id, newStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || task.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const columns = ['pending', 'In Progress', 'Review', 'Done'];

  return (
    <div className="task-board-page">
      <div className="board-header">
        <h2>Interactive Task Board</h2>
        <button className="btn-primary" onClick={openCreateModal}>+ Add New Task</button>
      </div>

      <div className="controls-bar">
        <input 
          type="text" 
          placeholder=" Search tasks..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="pending">pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Review">Review</option>
          <option value="Done">Done</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="board-columns">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col);
          return (
            <div key={col} className={`column col-${col.toLowerCase().replace(/\s+/g, '')}`}>
              <h3>{col} <span className="count-badge">({colTasks.length})</span></h3>
              <div className="task-list">
                {colTasks.length === 0 ? (
                  <p className="empty-state">No tasks here</p>
                ) : (
                  colTasks.map(task => (
                    <div key={task.id} className="task-card">
                      <div className="card-top">
                        <span className={`priority-badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
                        <select 
                          className="status-dropdown"
                          value={task.status} 
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        >
                          <option value="pending">pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Review">Review</option>
                          <option value="Done">Done</option>
                        </select>
                      </div>
                      <h4>{task.title}</h4>
                      <p>{task.description}</p>
                      <div className="assignee-box">👤 {task.assignee}</div>
                      <div className="card-actions">
                        <Link to={`/task/${task.id}`} className="btn-sm">View</Link>
                        <button className="btn-sm" onClick={() => openEditModal(task)}>Edit</button>
                        <button className="btn-sm delete" onClick={() => handleDelete(task.id)}>Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{currentTask ? 'Edit Task' : 'Create New Task'}</h3>
            <form onSubmit={handleSaveTask}>
              <label>Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Task title..." />
              
              <label>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Task details..." rows="3" />
              
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="pending">pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>

              <label>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <label>Assignee</label>
              <input type="text" value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="e.g. Maria" />

              <div className="modal-actions">
                <button type="submit" className="btn-primary">Save Task</button>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskDetails() {
  const { id } = useParams();
  const [tasks] = useTasks();
  const navigate = useNavigate();
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return (
      <div className="not-found">
        <h2>Task not found!</h2>
        <button onClick={() => navigate('/board')} className="btn-primary">Back to Board</button>
      </div>
    );
  }

  return (
    <div className="task-details-page">
      <button onClick={() => navigate('/board')} className="btn-secondary">← Back to Board</button>
      <div className="details-card">
        <h2>{task.title}</h2>
        <div className="meta-tags">
          <span className={`priority-badge ${task.priority.toLowerCase()}`}>{task.priority} Priority</span>
          <span className="status-pill">Status: {task.status}</span>
        </div>
        <p className="assignee-detail">Assigned to: <strong>{task.assignee}</strong></p>
        <div className="description-box">
          <h4>Description</h4>
          <p>{task.description || 'No description provided.'}</p>
        </div>
      </div>
    </div>
  );
}