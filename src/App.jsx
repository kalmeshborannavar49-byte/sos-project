import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import {
  AlertTriangle, Bell, CheckCircle2, Clock3, Crosshair,
  History, Home as HomeIcon, LogIn, LogOut, MapPin, Menu,
  Phone, Plus, Shield, Siren, Trash2, User, Users, X, LocateFixed
} from "lucide-react";

const STORAGE = {
  user: "silent_sos_user",
  contacts: "silent_sos_contacts",
  alerts: "silent_sos_alerts"
};

const demoContacts = [
  { id: "C-1001", name: "Amit Patil", relation: "Brother", phone: "+91 98765 43210", email: "amit@example.com" },
  { id: "C-1002", name: "Priya Shah", relation: "Friend", phone: "+91 97654 32109", email: "priya@example.com" }
];

const demoAlerts = [
  {
    id: "SOS-1001",
    triggerTime: "2026-09-30T14:10:00",
    status: "Resolved",
    location: { lat: 18.5204, lng: 73.8567, source: "Demo location" },
    responseTime: "4 min",
    acknowledgedAt: "2026-09-30T14:14:00",
    resolvedAt: "2026-09-30T14:20:00",
    notified: 2,
    log: [
      { time: "2026-09-30T14:10:00", text: "SOS alert triggered" },
      { time: "2026-09-30T14:10:01", text: "Emergency contacts notified" },
      { time: "2026-09-30T14:14:00", text: "Alert acknowledged" },
      { time: "2026-09-30T14:20:00", text: "Alert resolved" }
    ]
  }
];

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatDate(value) {
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function statusClass(status) {
  return status.toLowerCase().replaceAll(" ", "-");
}

function App() {
  const [user, setUser] = useState(() => read(STORAGE.user, null));
  const [contacts, setContacts] = useState(() => read(STORAGE.contacts, demoContacts));
  const [alerts, setAlerts] = useState(() => read(STORAGE.alerts, demoAlerts));

  useEffect(() => write(STORAGE.contacts, contacts), [contacts]);
  useEffect(() => write(STORAGE.alerts, alerts), [alerts]);

  const login = (userData) => {
    setUser(userData);
    write(STORAGE.user, userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE.user);
  };

  const addContact = (contact) => {
    const newContact = { ...contact, id: `C-${Date.now().toString().slice(-6)}` };
    setContacts((prev) => [...prev, newContact]);
  };

  const removeContact = (id) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const triggerSOS = async () => {
    const location = await getLocation();
    const now = new Date().toISOString();
    const alert = {
      id: `SOS-${Date.now().toString().slice(-6)}`,
      triggerTime: now,
      status: "Sent",
      location,
      responseTime: "Pending",
      notified: contacts.length,
      log: [
        { time: now, text: "SOS alert triggered" },
        { time: new Date().toISOString(), text: `${contacts.length} emergency contact(s) notified` }
      ]
    };
    setAlerts((prev) => [alert, ...prev]);
    return alert.id;
  };

  const acknowledge = (id) => {
    setAlerts((prev) => prev.map((a) => {
      if (a.id !== id || a.status === "Resolved") return a;
      const now = new Date().toISOString();
      const minutes = Math.max(1, Math.round((Date.now() - new Date(a.triggerTime).getTime()) / 60000));
      return {
        ...a,
        status: "Acknowledged",
        responseTime: `${minutes} min`,
        acknowledgedAt: now,
        log: [...a.log, { time: now, text: "Alert acknowledged by responder" }]
      };
    }));
  };

  const resolve = (id) => {
    setAlerts((prev) => prev.map((a) => {
      if (a.id !== id || a.status === "Resolved") return a;
      const now = new Date().toISOString();
      return {
        ...a,
        status: "Resolved",
        resolvedAt: now,
        log: [...a.log, { time: now, text: "Alert resolved" }]
      };
    }));
  };

  return (
    <>
      <Navbar user={user} logout={logout} />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={login} />} />
          <Route path="/register" element={<Register onRegister={login} />} />
          <Route
            path="/sos"
            element={
              <Protected user={user}>
                <SOS triggerSOS={triggerSOS} contacts={contacts} alerts={alerts} />
              </Protected>
            }
          />
          <Route
            path="/contacts"
            element={
              <Protected user={user}>
                <Contacts contacts={contacts} addContact={addContact} removeContact={removeContact} />
              </Protected>
            }
          />
          <Route
            path="/alerts"
            element={
              <Protected user={user}>
                <Alerts alerts={alerts} acknowledge={acknowledge} resolve={resolve} />
              </Protected>
            }
          />
          <Route
            path="/admin"
            element={
              <Protected user={user}>
                <Admin alerts={alerts} acknowledge={acknowledge} resolve={resolve} />
              </Protected>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function Protected({ user, children }) {
  if (!user) {
    return (
      <div className="center-page">
        <div className="card narrow">
          <Shield size={42} />
          <h2>Login required</h2>
          <p>Please log in to access the emergency safety dashboard.</p>
          <Link className="btn primary" to="/login">Go to Login</Link>
        </div>
      </div>
    );
  }
  return children;
}

function Navbar({ user, logout }) {
  const [open, setOpen] = useState(false);
  const links = user
    ? [
        ["/", "Home", HomeIcon],
        ["/sos", "SOS", Siren],
        ["/contacts", "Contacts", Users],
        ["/alerts", "My Alerts", History],
        ["/admin", "Monitoring", Bell]
      ]
    : [
        ["/", "Home", HomeIcon],
        ["/login", "Login", LogIn],
        ["/register", "Register", User]
      ];

  return (
    <header className="nav">
      <Link to="/" className="brand" onClick={() => setOpen(false)}>
        <Shield size={26} />
        <span>Silent SOS</span>
      </Link>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Menu">
        {open ? <X /> : <Menu />}
      </button>
      <nav className={open ? "nav-links open" : "nav-links"}>
        {links.map(([path, label, Icon]) => (
          <NavLink key={path} to={path} onClick={() => setOpen(false)}>
            <Icon size={17} /> {label}
          </NavLink>
        ))}
        {user && (
          <button className="nav-logout" onClick={logout}>
            <LogOut size={17} /> Logout
          </button>
        )}
      </nav>
    </header>
  );
}

function Home() {
  return (
    <section className="home">
      <div className="hero">
        <div>
          <span className="eyebrow"><Shield size={15} /> Emergency safety platform</span>
          <h1>Silent SOS when speaking is not possible.</h1>
          <p>
            Trigger an emergency alert with one action, share your location,
            and notify your trusted contacts discreetly.
          </p>
          <div className="hero-actions">
            <Link className="btn danger" to="/login"><Siren size={18} /> Trigger SOS</Link>
            <Link className="btn secondary" to="/register">Create account</Link>
          </div>
        </div>
        <div className="hero-sos">
          <Siren size={68} />
          <strong>SILENT SOS</strong>
          <span>No sound • No call</span>
        </div>
      </div>

      <div className="section">
        <SectionTitle title="How it works" subtitle="The essential emergency flow." />
        <div className="steps">
          <Step n="1" title="Register" text="Create your account and add trusted emergency contacts." />
          <Step n="2" title="Trigger SOS" text="Use the single SOS action when you need help." />
          <Step n="3" title="Share location" text="The browser location is attached to the alert when permission is available." />
          <Step n="4" title="Track response" text="Follow sent, acknowledged, and resolved alert states." />
        </div>
      </div>

      <div className="section">
        <SectionTitle title="Phase 1 features" subtitle="Only the features required by the project scope." />
        <div className="feature-grid">
          <Feature icon={<Siren />} title="One-click SOS" text="A clear emergency action with no audio alert." />
          <Feature icon={<MapPin />} title="Location sharing" text="Uses the browser Geolocation API when available." />
          <Feature icon={<Users />} title="Trusted contacts" text="Add and manage pre-configured emergency contacts." />
          <Feature icon={<History />} title="Alert tracking" text="View status and time-stamped activity logs." />
        </div>
      </div>
    </section>
  );
}

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@sos.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }
    onLogin({ name: "Demo User", email });
    navigate("/sos");
  };

  return (
    <AuthLayout title="Login" subtitle="Access your Silent SOS dashboard.">
      <form onSubmit={submit} className="form">
        {error && <Alert text={error} />}
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••" />
        <button className="btn primary full">Login</button>
        <p className="form-note">Demo mode: any non-empty email and password work.</p>
      </form>
    </AuthLayout>
  );
}

function Register({ onRegister }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError("Please fill all fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    onRegister({ name: form.name, email: form.email, phone: form.phone });
    navigate("/contacts");
  };

  return (
    <AuthLayout title="Create account" subtitle="Set up your emergency safety profile.">
      <form onSubmit={submit} className="form">
        {error && <Alert text={error} />}
        <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Your name" />
        <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@example.com" />
        <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+91 98765 43210" />
        <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="Minimum 6 characters" />
        <button className="btn primary full">Create account</button>
      </form>
    </AuthLayout>
  );
}

function SOS({ triggerSOS, contacts, alerts }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const active = alerts.find((a) => a.status !== "Resolved");

  const send = async () => {
    if (busy) return;
    if (!contacts.length) {
      setMessage("Add at least one emergency contact before sending an SOS.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const id = await triggerSOS();
      setMessage(`SOS ${id} sent. Your emergency contacts have been notified in demo mode.`);
    } catch {
      setMessage("Unable to create the alert. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="page">
      <PageHeader title="Emergency SOS" subtitle="Use only when you need emergency assistance." />
      <div className="sos-layout">
        <div className="sos-card card">
          <button className="sos-button" onClick={send} disabled={busy} aria-label="Send Silent SOS">
            <Siren size={58} />
            <strong>{busy ? "SENDING..." : "SILENT SOS"}</strong>
            <span>Tap once to send</span>
          </button>
          <p className="sos-note">No sound is played and no phone call is made by this demo.</p>
          {message && <div className="success-box"><CheckCircle2 size={19} /> {message}</div>}
        </div>

        <div className="card">
          <h3>Emergency information</h3>
          <div className="info-row"><Users size={19} /><span><b>{contacts.length}</b> trusted contact(s)</span></div>
          <div className="info-row"><MapPin size={19} /><span>Location sharing is attempted at SOS time</span></div>
          <div className="info-row"><Clock3 size={19} /><span>Alert status can be tracked below</span></div>
          {active && (
            <div className="active-alert">
              <b>Active alert:</b> {active.id}
              <StatusBadge status={active.status} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Contacts({ contacts, addContact, removeContact }) {
  const [form, setForm] = useState({ name: "", relation: "", phone: "", email: "" });
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.relation || !form.phone) {
      setError("Name, relationship, and phone are required.");
      return;
    }
    addContact(form);
    setForm({ name: "", relation: "", phone: "", email: "" });
    setError("");
  };

  return (
    <section className="page">
      <PageHeader title="Emergency Contacts" subtitle="Pre-configure the people who should receive your alert." />
      <div className="two-column">
        <div className="card">
          <h3><Plus size={19} /> Add trusted contact</h3>
          <form className="form" onSubmit={submit}>
            {error && <Alert text={error} />}
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="Relationship" value={form.relation} onChange={(v) => setForm({ ...form, relation: v })} placeholder="Parent, friend, sibling..." />
            <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="Email (optional)" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <button className="btn primary full">Add contact</button>
          </form>
        </div>

        <div className="card">
          <h3><Users size={19} /> Saved contacts</h3>
          {!contacts.length ? <p className="muted">No emergency contacts added.</p> : (
            <div className="contact-list">
              {contacts.map((c) => (
                <div className="contact" key={c.id}>
                  <div className="contact-icon"><User size={19} /></div>
                  <div className="contact-main">
                    <b>{c.name}</b>
                    <span>{c.relation}</span>
                    <small>{c.phone}{c.email ? ` • ${c.email}` : ""}</small>
                  </div>
                  <button className="icon-btn danger-text" onClick={() => removeContact(c.id)} title="Remove">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Alerts({ alerts, acknowledge, resolve }) {
  return (
    <section className="page">
      <PageHeader title="My Alerts" subtitle="Track your emergency alerts and activity." />
      <div className="alert-list">
        {alerts.length ? alerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} acknowledge={acknowledge} resolve={resolve} />
        )) : <Empty text="No alerts yet." />}
      </div>
    </section>
  );
}

function AlertCard({ alert, acknowledge, resolve }) {
  return (
    <article className="card alert-card">
      <div className="alert-top">
        <div>
          <span className="eyebrow">Alert ID</span>
          <h3>{alert.id}</h3>
        </div>
        <StatusBadge status={alert.status} />
      </div>

      <div className="alert-grid">
        <div><Clock3 size={17} /><span><b>Triggered</b>{formatDate(alert.triggerTime)}</span></div>
        <div><MapPin size={17} /><span><b>Location</b>{alert.location.lat.toFixed(5)}, {alert.location.lng.toFixed(5)}</span></div>
        <div><Users size={17} /><span><b>Contacts notified</b>{alert.notified}</span></div>
        <div><Crosshair size={17} /><span><b>Response time</b>{alert.responseTime}</span></div>
      </div>

      <div className="timeline">
        <b>Activity log</b>
        {alert.log.map((entry, index) => (
          <div className="timeline-item" key={index}>
            <span className="dot" />
            <div><span>{entry.text}</span><small>{formatDate(entry.time)}</small></div>
          </div>
        ))}
      </div>

      <div className="alert-actions">
        {alert.status === "Sent" && <button className="btn secondary" onClick={() => acknowledge(alert.id)}>Acknowledge</button>}
        {alert.status !== "Resolved" && <button className="btn primary" onClick={() => resolve(alert.id)}>Mark resolved</button>}
      </div>
    </article>
  );
}

function Admin({ alerts, acknowledge, resolve }) {
  const active = alerts.filter((a) => a.status !== "Resolved").length;
  const acknowledged = alerts.filter((a) => a.status === "Acknowledged").length;
  const resolved = alerts.filter((a) => a.status === "Resolved").length;

  return (
    <section className="page">
      <PageHeader title="Emergency Monitoring" subtitle="Basic alert monitoring for the Phase-1 admin view." />
      <div className="stats">
        <Stat icon={<AlertTriangle />} label="Active alerts" value={active} />
        <Stat icon={<Bell />} label="Acknowledged" value={acknowledged} />
        <Stat icon={<CheckCircle2 />} label="Resolved" value={resolved} />
        <Stat icon={<History />} label="Total alerts" value={alerts.length} />
      </div>

      <div className="card">
        <div className="table-head"><h3>Alert records</h3><span className="muted">Demo monitoring</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Alert ID</th><th>Time</th><th>Status</th><th>Location</th><th>Action</th></tr></thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id}>
                  <td><b>{a.id}</b></td>
                  <td>{formatDate(a.triggerTime)}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>{a.location.lat.toFixed(4)}, {a.location.lng.toFixed(4)}</td>
                  <td>
                    <div className="table-actions">
                      {a.status === "Sent" && <button className="small-btn" onClick={() => acknowledge(a.id)}>Acknowledge</button>}
                      {a.status !== "Resolved" && <button className="small-btn" onClick={() => resolve(a.id)}>Resolve</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function getLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: 18.5204, lng: 73.8567, source: "Demo fallback location" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: Math.round(position.coords.accuracy),
        source: "Browser GPS"
      }),
      () => resolve({ lat: 18.5204, lng: 73.8567, source: "Demo fallback location" }),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
    );
  });
}

function AuthLayout({ title, subtitle, children }) {
  return (
    <section className="auth-page">
      <div className="auth-card card">
        <div className="auth-icon"><Shield /></div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </div>
    </section>
  );
}

function Field({ label, type = "text", value, onChange, placeholder }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

function Alert({ text }) {
  return <div className="error-box"><AlertTriangle size={18} /> {text}</div>;
}

function StatusBadge({ status }) {
  return <span className={`status ${statusClass(status)}`}>{status}</span>;
}

function PageHeader({ title, subtitle }) {
  return (
    <div className="page-header">
      <div>
        <span className="eyebrow"><Shield size={14} /> Silent SOS</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle }) {
  return <div className="section-title"><h2>{title}</h2><p>{subtitle}</p></div>;
}

function Step({ n, title, text }) {
  return <div className="step"><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div></div>;
}

function Feature({ icon, title, text }) {
  return <div className="feature card"><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p></div>;
}

function Stat({ icon, label, value }) {
  return <div className="stat card"><div className="stat-icon">{icon}</div><div><strong>{value}</strong><span>{label}</span></div></div>;
}

function Empty({ text }) {
  return <div className="card empty">{text}</div>;
}

function NotFound() {
  return <div className="center-page"><div className="card narrow"><h2>Page not found</h2><Link className="btn primary" to="/">Back home</Link></div></div>;
}

function Footer() {
  return <footer><span>Silent SOS Emergency</span><span>Phase 1 Web Application • Demo frontend</span></footer>;
}

export default App;