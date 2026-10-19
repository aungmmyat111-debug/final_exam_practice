'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('admin123');

  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [borrows, setBorrows] = useState([]);

  // Book form state
  const [form, setForm] = useState({ title: '', author: '', quantity: 1, location: '' });
  const [targetDate, setTargetDate] = useState('');

  // 1. Auth Functions
  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      loadBooks();
      loadBorrows();
    } else {
      alert(data.error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/user/logout', { method: 'POST' });
    setUser(null);
    setBooks([]);
    setBorrows([]);
  };

  // 2. Book CRUD Functions
  const loadBooks = async () => {
    const res = await fetch(`/api/books?search=${search}`);
    if (res.ok) setBooks(await res.json());
  };

  const createBook = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setForm({ title: '', author: '', quantity: 1, location: '' });
      loadBooks();
    }
  };

  const deleteBook = async (id) => {
    const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
    if (res.ok) loadBooks();
  };

  // 3. Borrow Requests Functions
  const loadBorrows = async () => {
    const res = await fetch('/api/borrow');
    if (res.ok) setBorrows(await res.json());
  };

  const createBorrow = async (bookId) => {
    if (!targetDate) return alert('Please specify pick up date!');
    const res = await fetch('/api/borrow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, targetDate })
    });
    if (res.ok) {
      alert('Request submitted successfully');
      loadBorrows();
    }
  };

  const updateBorrowStatus = async (id, status) => {
    const res = await fetch(`/api/borrow/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestStatus: status })
    });
    if (res.ok) loadBorrows();
  };

  useEffect(() => {
    if (user) loadBooks();
  }, [search]);

  // Restore the login session from the token cookie on page load / refresh
  useEffect(() => {
    const restoreSession = async () => {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        loadBooks();
        loadBorrows();
      }
    };
    restoreSession();
  }, []);

  if (!user) {
    return (
      <div style={{ maxWidth: '400px', margin: '60px auto', padding: '24px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Library Management - Login</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '12px' }}>
            <label>Email: </label>
            <input style={{ width: '100%' }} value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label>Password: </label>
            <input type="password" style={{ width: '100%' }} value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" style={{ width: '100%', padding: '8px', cursor: 'pointer' }}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '12px' }}>
        <div>
          <h2>Library Dashboard</h2>
          <p>Logged in as: <b>{user.email}</b> ({user.role})</p>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Logout
        </button>
      </div>

      {/* Admin Book Create Form */}
      {user.role === 'ADMIN' && (
        <div style={{ margin: '20px 0', padding: '16px', border: '1px solid #ccc', borderRadius: '6px' }}>
          <h3>Add New Book</h3>
          <form onSubmit={createBook} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <input placeholder="Author" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} required />
            <input placeholder="Quantity" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} required />
            <input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
            <button type="submit">Create</button>
          </form>
        </div>
      )}

      {/* Book Search & List */}
      <div style={{ margin: '24px 0' }}>
        <h3>Book Catalog</h3>
        <input 
          placeholder="Filter by title or author..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          style={{ width: '300px', padding: '8px', marginBottom: '12px' }} 
        />
        <div style={{ marginBottom: '12px' }}>
          <label>Target Pick up Date for Borrow: </label>
          <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
        </div>

        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Quantity</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map(b => (
              <tr key={b._id} style={{ opacity: b.status === 'DELETED' ? 0.5 : 1 }}>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>{b.quantity}</td>
                <td>{b.location}</td>
                <td>{b.status}</td>
                <td>
                  {user.role === 'ADMIN' && b.status !== 'DELETED' && (
                    <button onClick={() => deleteBook(b._id)}>Soft Delete</button>
                  )}
                  {user.role === 'USER' && (
                    <button onClick={() => createBorrow(b._id)}>Request Borrow</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Borrow Requests View */}
      <div style={{ margin: '30px 0' }}>
        <h3>Borrowing Requests</h3>
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Book</th>
              <th>User</th>
              <th>Target Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {borrows.map(req => (
              <tr key={req._id}>
                <td>{req.bookTitle}</td>
                <td>{req.userEmail}</td>
                <td>{new Date(req.targetDate).toLocaleDateString()}</td>
                <td><b>{req.requestStatus}</b></td>
                <td>
                  {user.role === 'ADMIN' && (
                    <select value={req.requestStatus} onChange={e => updateBorrowStatus(req._id, e.target.value)}>
                      <option value="INIT">INIT</option>
                      <option value="ACCEPTED">ACCEPTED</option>
                      <option value="CLOSE-NO-AVAILABLE-BOOK">CLOSE-NO-AVAILABLE-BOOK</option>
                      <option value="CANCEL-ADMIN">CANCEL-ADMIN</option>
                    </select>
                  )}
                  {user.role === 'USER' && req.requestStatus === 'INIT' && (
                    <button onClick={() => updateBorrowStatus(req._id, 'CANCEL-USER')}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}