// src/components/ComponentShowcase.jsx – Live interactive demos with customizable props
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════
   PROPS CONTROL PANEL — renders editable controls for each prop
   ═══════════════════════════════════════════════════════════════════ */
function PropsPanel({ propDefs, values, onChange }) {
  return (
    <div className="props-panel">
      <div className="props-panel__header">
        <span className="props-panel__title">Props</span>
        <span className="props-panel__hint">Change values to see live updates</span>
      </div>
      <div className="props-panel__body">
        {propDefs.map((p) => (
          <div key={p.name} className="props-panel__row">
            <div className="props-panel__label-row">
              <code className="props-panel__name">{p.name}</code>
              <span className="props-panel__type">{p.type}</span>
            </div>
            {p.type === "boolean" && (
              <label className="props-toggle">
                <input type="checkbox" checked={!!values[p.name]} onChange={(e) => onChange(p.name, e.target.checked)} />
                <span className="props-toggle__track"><span className="props-toggle__thumb" /></span>
                <span className="props-toggle__val">{values[p.name] ? "true" : "false"}</span>
              </label>
            )}
            {p.type === "string" && !p.options && (
              <input className="props-panel__input" value={values[p.name] || ""} onChange={(e) => onChange(p.name, e.target.value)} placeholder={p.placeholder || ""} />
            )}
            {p.type === "number" && (
              <input className="props-panel__input props-panel__input--num" type="number" min={p.min} max={p.max} step={p.step || 1} value={values[p.name] ?? ""} onChange={(e) => onChange(p.name, Number(e.target.value))} />
            )}
            {p.type === "select" && (
              <select className="props-panel__select" value={values[p.name]} onChange={(e) => onChange(p.name, e.target.value)}>
                {p.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* wrapper: demo preview + props panel side by side */
function DemoBlock({ title, description, propDefs, defaults, children }) {
  const [props, setProps] = useState({ ...defaults });
  function handleChange(name, val) { setProps((prev) => ({ ...prev, [name]: val })); }

  return (
    <div className="demo-block">
      <div className="demo-block__head">
        <h4 className="demo-block__title">{title}</h4>
        <p className="demo-block__desc">{description}</p>
      </div>
      <div className="demo-block__body">
        <div className="demo-block__preview">
          {children(props)}
        </div>
        <PropsPanel propDefs={propDefs} values={props} onChange={handleChange} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LIVE DEMO COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

/* ── TextInput ───────────────────────────────────────────────────── */
function LiveTextInput({ label, type, placeholder, required, disabled }) {
  const [value, setValue] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState(false);

  const isEmail = type === "email";
  const isPw = type === "password";
  const emailValid = isEmail ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) : true;

  return (
    <div className="demo-field">
      <label className="demo-label">
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <div className="demo-input-wrap">
        <input
          className={`demo-input ${touched && isEmail && value && !emailValid ? "demo-input--error" : ""} ${disabled ? "demo-input--disabled" : ""}`}
          type={isPw && showPw ? "text" : type}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setTouched(true)}
        />
        {isPw && (
          <button className="demo-input-eye" onClick={() => setShowPw(!showPw)} type="button">
            {showPw ? "🙈" : "👁"}
          </button>
        )}
      </div>
      {touched && required && !value && <small className="demo-msg demo-msg--error">This field is required</small>}
      {touched && isEmail && value && !emailValid && <small className="demo-msg demo-msg--error">Please enter a valid email</small>}
      {touched && isEmail && value && emailValid && <small className="demo-msg demo-msg--success">Valid email</small>}
    </div>
  );
}

/* ── TextArea ────────────────────────────────────────────────────── */
function LiveTextArea({ label, wordLimit, rows, disabled }) {
  const [value, setValue] = useState("");
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const overLimit = wordCount > wordLimit;

  return (
    <div className="demo-field">
      <label className="demo-label">{label}</label>
      <textarea
        className={`demo-input demo-textarea ${overLimit ? "demo-input--error" : ""}`}
        rows={rows}
        disabled={disabled}
        placeholder="Start typing..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <small className={`demo-msg ${overLimit ? "demo-msg--error" : "demo-msg--muted"}`}>
        {wordCount}/{wordLimit} words
      </small>
    </div>
  );
}

/* ── SelectComponent ─────────────────────────────────────────────── */
function LiveSelect({ label, isMulti, searchable, disabled }) {
  const options = [
    { value: "react", label: "React" }, { value: "vue", label: "Vue.js" },
    { value: "angular", label: "Angular" }, { value: "svelte", label: "Svelte" },
    { value: "next", label: "Next.js" }, { value: "remix", label: "Remix" },
  ];
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(isMulti ? [] : "");
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  // Reset selection when mode changes — also guard against type mismatch
  useEffect(() => { setSelected(isMulti ? [] : ""); setSearch(""); }, [isMulti]);

  // Guard: if isMulti but selected is not an array (or vice versa), fix it
  const safeSelected = isMulti ? (Array.isArray(selected) ? selected : []) : (typeof selected === "string" ? selected : "");

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = options.filter((o) => !searchable || o.label.toLowerCase().includes(search.toLowerCase()));

  function toggle(opt) {
    if (isMulti) {
      setSelected((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        return arr.includes(opt.value) ? arr.filter((v) => v !== opt.value) : [...arr, opt.value];
      });
    } else { setSelected(opt.value); setOpen(false); setSearch(""); }
  }

  const displayLabel = isMulti ? null : options.find((o) => o.value === safeSelected)?.label;

  return (
    <div className="demo-field" ref={ref}>
      <label className="demo-label">{label}</label>
      {isMulti && safeSelected.length > 0 && (
        <div className="demo-tags">
          {safeSelected.map((v) => (
            <span key={v} className="demo-tag">
              {options.find((o) => o.value === v)?.label}
              <button className="demo-tag__x" onClick={() => toggle({ value: v })}>×</button>
            </span>
          ))}
        </div>
      )}
      <div className={`demo-select-trigger ${disabled ? "demo-input--disabled" : ""}`} onClick={() => !disabled && setOpen(!open)}>
        {searchable ? (
          <input className="demo-select-search" placeholder={displayLabel || "Select..."} value={search} disabled={disabled}
            onChange={(e) => { setSearch(e.target.value); setOpen(true); }} />
        ) : (
          <span className="demo-select-search" style={{ padding: "0.6rem 0.75rem", display: "block" }}>
            {displayLabel || "Select..."}
          </span>
        )}
        <span className={`demo-chevron ${open ? "demo-chevron--up" : ""}`}>▾</span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.ul className="demo-dropdown" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
            {filtered.length === 0 && <li className="demo-dropdown__empty">No results</li>}
            {filtered.map((opt) => {
              const active = isMulti ? safeSelected.includes(opt.value) : safeSelected === opt.value;
              return (
                <li key={opt.value} className={`demo-dropdown__item ${active ? "demo-dropdown__item--active" : ""}`} onClick={() => toggle(opt)}>
                  {isMulti && <span className={`demo-check ${active ? "demo-check--on" : ""}`}>{active ? "✓" : ""}</span>}
                  {opt.label}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── DateInput ───────────────────────────────────────────────────── */
function LiveDateInput({ label, includeTime, mode, disabled }) {
  const [date, setDate] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [time, setTime] = useState("");
  const isRange = mode === "range";
  const isPast = mode === "past";
  const isFuture = mode === "future";
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="demo-field">
      <label className="demo-label">{label}</label>
      <div className="demo-date-row">
        <div className="demo-input-wrap demo-input-wrap--icon">
          <span className="demo-input-icon">📅</span>
          <input className="demo-input" type="date" value={date} disabled={disabled}
            max={isPast ? today : undefined} min={isFuture ? today : undefined}
            onChange={(e) => setDate(e.target.value)} />
        </div>
        {isRange && (
          <div className="demo-input-wrap demo-input-wrap--icon">
            <span className="demo-input-icon">📅</span>
            <input className="demo-input" type="date" value={dateTo} disabled={disabled} min={date || undefined}
              onChange={(e) => setDateTo(e.target.value)} />
          </div>
        )}
        {includeTime && (
          <div className="demo-input-wrap demo-input-wrap--icon">
            <span className="demo-input-icon">🕐</span>
            <input className="demo-input" type="time" value={time} disabled={disabled} onChange={(e) => setTime(e.target.value)} />
          </div>
        )}
      </div>
      {isPast && <small className="demo-msg demo-msg--muted">Only past dates allowed</small>}
      {isFuture && <small className="demo-msg demo-msg--muted">Only future dates allowed</small>}
      {isRange && <small className="demo-msg demo-msg--muted">Select a date range</small>}
    </div>
  );
}

/* ── PhoneInput ──────────────────────────────────────────────────── */
function LivePhoneInput({ label, disabled }) {
  const [code, setCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const codes = [
    { code: "+91", flag: "🇮🇳" }, { code: "+1", flag: "🇺🇸" },
    { code: "+44", flag: "🇬🇧" }, { code: "+61", flag: "🇦🇺" }, { code: "+81", flag: "🇯🇵" },
  ];

  return (
    <div className="demo-field">
      <label className="demo-label">{label}</label>
      <div className="demo-phone-row">
        <select className="demo-phone-code" value={code} disabled={disabled} onChange={(e) => setCode(e.target.value)}>
          {codes.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
        </select>
        <input className="demo-input" placeholder="Phone number" disabled={disabled} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} />
      </div>
    </div>
  );
}

/* ── ColorPicker ─────────────────────────────────────────────────── */
function LiveColorPicker({ label, defaultColor }) {
  const [color, setColor] = useState(defaultColor || "#00b4d8");
  useEffect(() => { setColor(defaultColor || "#00b4d8"); }, [defaultColor]);

  return (
    <div className="demo-field">
      <label className="demo-label">{label}</label>
      <div className="demo-color-row">
        <input type="color" className="demo-color-input" value={color} onChange={(e) => setColor(e.target.value)} />
        <code className="demo-color-hex">{color}</code>
        <div className="demo-color-swatch" style={{ background: color }} />
      </div>
    </div>
  );
}

/* ── TagInput ────────────────────────────────────────────────────── */
function LiveTagInput({ label, maxTags, disabled }) {
  const [tags, setTags] = useState(["React", "Node.js"]);
  const [input, setInput] = useState("");

  function addTag(e) {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      if (maxTags && tags.length >= maxTags) return;
      if (!tags.includes(input.trim())) setTags([...tags, input.trim()]);
      setInput("");
    }
  }

  return (
    <div className="demo-field">
      <label className="demo-label">{label}</label>
      <div className="demo-tag-input-wrap">
        {tags.map((t) => (
          <span key={t} className="demo-tag">
            {t}
            <button className="demo-tag__x" onClick={() => setTags(tags.filter((x) => x !== t))}>×</button>
          </span>
        ))}
        <input className="demo-tag-text-input" placeholder={maxTags && tags.length >= maxTags ? `Max ${maxTags} tags` : "Type & press Enter..."}
          value={input} disabled={disabled || (maxTags && tags.length >= maxTags)} onChange={(e) => setInput(e.target.value)} onKeyDown={addTag} />
      </div>
      {maxTags > 0 && <small className="demo-msg demo-msg--muted">{tags.length}/{maxTags} tags</small>}
    </div>
  );
}

/* ── FileUpload ──────────────────────────────────────────────────── */
function LiveFileUpload({ label, multiple, maxFileSizeMB, showPreview, disabled }) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  function handleFiles(fileList) {
    setError("");
    const arr = Array.from(fileList);
    if (!multiple && arr.length > 1) { setError("Only 1 file allowed"); return; }
    for (const f of arr) {
      if (maxFileSizeMB && f.size > maxFileSizeMB * 1024 * 1024) {
        setError(`${f.name} exceeds ${maxFileSizeMB} MB limit`);
        return;
      }
    }
    const newFiles = arr.map((f) => ({
      name: f.name, size: (f.size / 1024).toFixed(1) + " KB",
      type: f.type.startsWith("image") ? "image" : "file",
    }));
    setFiles(multiple ? (prev) => [...prev, ...newFiles] : newFiles);
  }

  return (
    <div className="demo-field">
      <label className="demo-label">{label}</label>
      <div
        className={`demo-upload-zone ${dragOver ? "demo-upload-zone--active" : ""} ${disabled ? "demo-input--disabled" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (!disabled) handleFiles(e.dataTransfer.files); }}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" multiple={multiple} hidden onChange={(e) => handleFiles(e.target.files)} />
        <span className="demo-upload-icon">📁</span>
        <span className="demo-upload-text">Drag & drop or <u>browse</u></span>
        <small className="demo-upload-hint">
          {multiple ? "Multiple files" : "Single file"} | Max {maxFileSizeMB} MB
        </small>
      </div>
      {error && <small className="demo-msg demo-msg--error">{error}</small>}
      {showPreview && files.length > 0 && (
        <div className="demo-upload-files">
          {files.map((f, i) => (
            <div key={i} className="demo-upload-file">
              <span>{f.type === "image" ? "🖼" : "📄"} {f.name}</span>
              <span className="demo-upload-size">{f.size}</span>
              <button className="demo-upload-remove" onClick={() => setFiles(files.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Buttons ─────────────────────────────────────────────────────── */
function LiveButtons({ buttonType, buttonLabel, isLoading, disabled }) {
  const [localLoading, setLocalLoading] = useState(false);
  const showLoading = isLoading || localLoading;
  const iconMap = { add: "+", edit: "✏", delete: "🗑", export: "↗", save: "💾", import: "↙", check: "✓" };

  function handleClick() {
    if (!isLoading) { setLocalLoading(true); setTimeout(() => setLocalLoading(false), 2000); }
  }

  return (
    <div className="demo-field">
      <label className="demo-label">Button Preview</label>
      <div className="demo-btn-row">
        <button
          className={`demo-btn demo-btn--${buttonType} ${showLoading ? "demo-btn--loading" : ""}`}
          disabled={disabled || showLoading}
          onClick={handleClick}
        >
          {showLoading ? (
            <><span className="demo-spinner" /> Saving...</>
          ) : (
            <><span className="demo-btn-icon">{iconMap[buttonType] || "+"}</span> {buttonLabel}</>
          )}
        </button>
      </div>
      <small className="demo-msg demo-msg--muted">
        {isLoading ? "Loading forced via prop" : "Click button to see loading state (2s)"}
      </small>
    </div>
  );
}

/* ── Modal ───────────────────────────────────────────────────────── */
function LiveModal({ title, showCloseBtn, backdropClose }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="demo-field">
      <label className="demo-label">Modal Preview</label>
      <button className="demo-btn demo-btn--add" onClick={() => setOpen(true)}>Open Modal</button>
      <AnimatePresence>
        {open && (
          <motion.div className="demo-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => backdropClose && setOpen(false)}>
            <motion.div className="demo-modal"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="demo-modal__header">
                <h4>{title}</h4>
                {showCloseBtn && <button className="demo-modal__close" onClick={() => setOpen(false)}>×</button>}
              </div>
              <div className="demo-modal__body">
                <p>ESC key, {backdropClose ? "backdrop click enabled" : "backdrop click disabled"}, {showCloseBtn ? "close button visible" : "close button hidden"}.</p>
                <LiveTextInput label="Sample Field" type="text" placeholder="Try typing here..." required={false} disabled={false} />
              </div>
              <div className="demo-modal__footer">
                <button className="demo-btn demo-btn--delete" onClick={() => setOpen(false)}>Cancel</button>
                <button className="demo-btn demo-btn--save" onClick={() => setOpen(false)}>Confirm</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Searchbar ───────────────────────────────────────────────────── */
function LiveSearchbar({ placeholder, disabled }) {
  const [query, setQuery] = useState("");
  const items = ["Dashboard", "Users", "Settings", "Analytics", "Reports", "Billing", "Profile", "Notifications"];
  const filtered = items.filter((i) => i.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="demo-field">
      <label className="demo-label">Searchbar Preview</label>
      <div className="demo-input-wrap demo-input-wrap--icon">
        <span className="demo-input-icon">🔍</span>
        <input className="demo-input" placeholder={placeholder} value={query} disabled={disabled} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {query && (
        <div className="demo-search-results">
          {filtered.map((item) => <div key={item} className="demo-search-item">{item}</div>)}
          {filtered.length === 0 && <div className="demo-search-item demo-search-item--empty">No results for &ldquo;{query}&rdquo;</div>}
        </div>
      )}
    </div>
  );
}

/* ── DataTable (search + filter + sort + table/grid toggle + pagination) ── */
const DT_DATA = [
  { id: 1, name: "Shantanu Sadafale", role: "Full Stack Dev", status: "Active", rating: 5, country: "🇮🇳 India" },
  { id: 2, name: "John Doe", role: "Backend Dev", status: "Inactive", rating: 3, country: "🇺🇸 USA" },
  { id: 3, name: "Jane Smith", role: "UI Designer", status: "Active", rating: 4, country: "🇬🇧 UK" },
  { id: 4, name: "Bob Wilson", role: "DevOps Engineer", status: "Active", rating: 4, country: "🇦🇺 Australia" },
  { id: 5, name: "Alice Brown", role: "Frontend Dev", status: "Pending", rating: 5, country: "🇮🇳 India" },
  { id: 6, name: "Charlie Davis", role: "QA Engineer", status: "Active", rating: 3, country: "🇺🇸 USA" },
  { id: 7, name: "Diana Evans", role: "PM", status: "Pending", rating: 4, country: "🇬🇧 UK" },
  { id: 8, name: "Evan Harris", role: "Data Analyst", status: "Active", rating: 5, country: "🇯🇵 Japan" },
];

function LiveDataTable({ searchable, filterable, sortable, paginated, showCheckbox, defaultView, rowsPerPage }) {
  const [view, setView] = useState(defaultView || "table");
  const [query, setQuery] = useState("");
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [filterCol, setFilterCol] = useState("");
  const [filterVal, setFilterVal] = useState("");
  const [page, setPage] = useState(0);
  const [checkedRows, setCheckedRows] = useState([]);

  useEffect(() => { setView(defaultView || "table"); }, [defaultView]);

  const statusColors = { Active: "#4ade80", Inactive: "#94a3b8", Pending: "#fbbf24" };
  const columns = [
    { key: "name", label: "Name" }, { key: "role", label: "Role" },
    { key: "status", label: "Status" }, { key: "rating", label: "Rating" }, { key: "country", label: "Country" },
  ];

  // search
  let rows = [...DT_DATA];
  if (query) rows = rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(query.toLowerCase())));
  // filter
  if (filterCol && filterVal) rows = rows.filter((r) => String(r[filterCol]) === filterVal);
  // sort
  if (sortCol) {
    rows.sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol];
      const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }

  const perPage = rowsPerPage || 4;
  const display = paginated ? rows.slice(page * perPage, (page + 1) * perPage) : rows;
  const totalPages = Math.ceil(rows.length / perPage);
  const allChecked = display.length > 0 && display.every((r) => checkedRows.includes(r.id));

  function toggleSort(col) { if (sortCol === col) setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortCol(col); setSortDir("asc"); } }
  function toggleRow(id) { setCheckedRows((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]); }
  function toggleAll() {
    if (allChecked) setCheckedRows((prev) => prev.filter((id) => !display.find((r) => r.id === id)));
    else setCheckedRows((prev) => [...new Set([...prev, ...display.map((r) => r.id)])]);
  }

  // unique values for filter
  const filterValues = filterCol ? [...new Set(DT_DATA.map((r) => String(r[filterCol])))] : [];

  return (
    <div className="demo-field">
      <label className="demo-label">DataTable Preview</label>
      {/* Toolbar */}
      <div className="demo-dt-toolbar">
        {searchable && (
          <div className="demo-input-wrap demo-input-wrap--icon" style={{ flex: 1, maxWidth: 260 }}>
            <span className="demo-input-icon">🔍</span>
            <input className="demo-input" placeholder="Search..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} />
          </div>
        )}
        {filterable && (
          <div className="demo-dt-filter">
            <select className="demo-phone-code" style={{ width: "auto", minWidth: 90 }} value={filterCol} onChange={(e) => { setFilterCol(e.target.value); setFilterVal(""); setPage(0); }}>
              <option value="">Filter by...</option>
              {columns.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            {filterCol && (
              <select className="demo-phone-code" style={{ width: "auto", minWidth: 90 }} value={filterVal} onChange={(e) => { setFilterVal(e.target.value); setPage(0); }}>
                <option value="">All</option>
                {filterValues.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            )}
          </div>
        )}
        {sortable && (
          <select className="demo-phone-code" style={{ width: "auto", minWidth: 100 }} value={sortCol || ""} onChange={(e) => { setSortCol(e.target.value || null); setSortDir("asc"); }}>
            <option value="">Sort by...</option>
            {columns.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        )}
        <div className="demo-dt-view-toggle">
          <button className={`demo-page-btn ${view === "table" ? "demo-page-btn--active" : ""}`} onClick={() => setView("table")} title="Table view">☰</button>
          <button className={`demo-page-btn ${view === "grid" ? "demo-page-btn--active" : ""}`} onClick={() => setView("grid")} title="Grid view">▦</button>
        </div>
      </div>

      {/* Bulk actions */}
      {showCheckbox && checkedRows.length > 0 && (
        <div className="demo-table-bulk">
          {checkedRows.length} selected —
          <button className="demo-link" onClick={() => setCheckedRows([])}>Clear</button>
          <button className="demo-btn demo-btn--delete" style={{ marginLeft: 8, padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}>Delete Selected</button>
          <button className="demo-btn demo-btn--export" style={{ marginLeft: 4, padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}>Export Selected</button>
        </div>
      )}

      {/* Table view */}
      {view === "table" && (
        <div className="demo-table-wrap">
          <table className="demo-table">
            <thead>
              <tr>
                {showCheckbox && <th><input type="checkbox" checked={allChecked} onChange={toggleAll} /></th>}
                {columns.map((col) => (
                  <th key={col.key} className="demo-table-sortable" onClick={() => toggleSort(col.key)}>
                    {col.label}
                    {sortCol === col.key && <span className="demo-sort-arrow">{sortDir === "asc" ? " ▲" : " ▼"}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {display.map((row) => (
                <tr key={row.id} className={checkedRows.includes(row.id) ? "demo-table-row--selected" : ""}>
                  {showCheckbox && <td><input type="checkbox" checked={checkedRows.includes(row.id)} onChange={() => toggleRow(row.id)} /></td>}
                  <td>{row.name}</td>
                  <td>{row.role}</td>
                  <td><span className="demo-badge" style={{ background: `${statusColors[row.status]}22`, color: statusColors[row.status] }}>{row.status}</span></td>
                  <td>{"★".repeat(row.rating)}{"☆".repeat(5 - row.rating)}</td>
                  <td>{row.country}</td>
                </tr>
              ))}
              {display.length === 0 && <tr><td colSpan={columns.length + (showCheckbox ? 1 : 0)} style={{ textAlign: "center", color: "#64748b", padding: "1.5rem" }}>No results found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid view */}
      {view === "grid" && (
        <div className="demo-gridview">
          {display.map((row) => (
            <div key={row.id} className="demo-gridview__card">
              <div className="demo-gridview__row"><span className="demo-gridview__label">Name</span><span>{row.name}</span></div>
              <div className="demo-gridview__row"><span className="demo-gridview__label">Role</span><span>{row.role}</span></div>
              <div className="demo-gridview__row"><span className="demo-gridview__label">Status</span><span className="demo-badge" style={{ background: `${statusColors[row.status]}22`, color: statusColors[row.status] }}>{row.status}</span></div>
              <div className="demo-gridview__row"><span className="demo-gridview__label">Rating</span><span>{"★".repeat(row.rating)}{"☆".repeat(5 - row.rating)}</span></div>
              <div className="demo-gridview__row"><span className="demo-gridview__label">Country</span><span>{row.country}</span></div>
            </div>
          ))}
          {display.length === 0 && <p style={{ color: "#64748b", textAlign: "center", padding: "1.5rem" }}>No results found</p>}
        </div>
      )}

      {paginated && rows.length > 0 && (
        <div className="demo-table-footer">
          <small className="demo-msg--muted">Showing {page * perPage + 1}–{Math.min((page + 1) * perPage, rows.length)} of {rows.length}</small>
          <div className="demo-pagination">
            <button className="demo-page-btn" disabled={page === 0} onClick={() => setPage(page - 1)}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} className={`demo-page-btn ${i === page ? "demo-page-btn--active" : ""}`} onClick={() => setPage(i)}>{i + 1}</button>
            ))}
            <button className="demo-page-btn" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>›</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── MetricCard ──────────────────────────────────────────────────── */
function LiveMetricCard({ title, operation, showIcon }) {
  const data = [120, 85, 200, 150, 95, 310, 175, 60];
  let value = 0;
  if (operation === "total") value = data.reduce((s, v) => s + v, 0);
  else if (operation === "count") value = data.length;
  else if (operation === "average") value = Math.round(data.reduce((s, v) => s + v, 0) / data.length);
  else if (operation === "max") value = Math.max(...data);
  else if (operation === "min") value = Math.min(...data);

  return (
    <div className="demo-field">
      <label className="demo-label">MetricCard Preview</label>
      <div className="demo-metric-cards">
        <div className="demo-metric-card">
          {showIcon && <div className="demo-metric-icon">📊</div>}
          <span className="demo-metric-title">{title}</span>
          <span className="demo-metric-value">{value.toLocaleString()}</span>
          <span className="demo-metric-op">op: {operation}</span>
        </div>
        <div className="demo-metric-card">
          {showIcon && <div className="demo-metric-icon">👥</div>}
          <span className="demo-metric-title">Users</span>
          <span className="demo-metric-value">{data.length}</span>
          <span className="demo-metric-op">op: count</span>
        </div>
        <div className="demo-metric-card">
          {showIcon && <div className="demo-metric-icon">📈</div>}
          <span className="demo-metric-title">Growth</span>
          <span className="demo-metric-value">+24%</span>
          <span className="demo-metric-op">op: percentage</span>
        </div>
      </div>
    </div>
  );
}

/* ── ImageViewer ─────────────────────────────────────────────────── */
function LiveImageViewer({ zoomable, showNav }) {
  const images = [
    { url: "https://picsum.photos/seed/comp1/400/300", title: "Dashboard" },
    { url: "https://picsum.photos/seed/comp2/400/300", title: "Analytics" },
    { url: "https://picsum.photos/seed/comp3/400/300", title: "Profile" },
  ];
  const [current, setCurrent] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="demo-field">
      <label className="demo-label">ImageViewer Preview</label>
      <div className="demo-iv-thumbs">
        {images.map((img, i) => (
          <img key={i} src={img.url} alt={img.title} className={`demo-iv-thumb ${i === current ? "demo-iv-thumb--active" : ""}`}
            onClick={() => { setCurrent(i); setModalOpen(true); }} />
        ))}
      </div>
      <small className="demo-msg demo-msg--muted">Click a thumbnail to open viewer</small>
      <AnimatePresence>
        {modalOpen && (
          <motion.div className="demo-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setModalOpen(false); setZoomed(false); }}>
            <motion.div className="demo-iv-modal" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              {showNav && images.length > 1 && (
                <button className="demo-iv-nav demo-iv-nav--prev" onClick={() => setCurrent((current - 1 + images.length) % images.length)}>‹</button>
              )}
              <div className="demo-iv-main" onClick={() => zoomable && setZoomed(!zoomed)}>
                <img src={images[current].url} alt={images[current].title}
                  className={`demo-iv-img ${zoomed ? "demo-iv-img--zoomed" : ""}`} />
              </div>
              {showNav && images.length > 1 && (
                <button className="demo-iv-nav demo-iv-nav--next" onClick={() => setCurrent((current + 1) % images.length)}>›</button>
              )}
              <div className="demo-iv-footer">
                <span>{images[current].title}</span>
                <span>{current + 1}/{images.length}</span>
                <button className="demo-modal__close" onClick={() => { setModalOpen(false); setZoomed(false); }}>×</button>
              </div>
              {zoomable && <small className="demo-msg demo-msg--muted" style={{ textAlign: "center", display: "block", marginTop: 4 }}>Click image to {zoomed ? "zoom out" : "zoom in"}</small>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── SelectCard ──────────────────────────────────────────────────── */
function LiveSelectCard({ label, type, layout }) {
  const options = [
    { label: "Startup", value: "startup", info: "Fast-paced environment" },
    { label: "Enterprise", value: "enterprise", info: "Large-scale systems" },
    { label: "Agency", value: "agency", info: "Client-facing projects" },
    { label: "Freelance", value: "freelance", info: "Independent work" },
  ];
  const [selected, setSelected] = useState(type === "checkbox" ? [] : "");

  useEffect(() => { setSelected(type === "checkbox" ? [] : ""); }, [type]);

  function toggle(val) {
    if (type === "checkbox") {
      setSelected((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
      });
    } else { setSelected(val); }
  }

  const safeSelected = type === "checkbox" ? (Array.isArray(selected) ? selected : []) : selected;
  const isActive = (val) => type === "checkbox" ? safeSelected.includes(val) : safeSelected === val;

  return (
    <div className="demo-field">
      <label className="demo-label">{label}</label>
      <div className={`demo-selectcard-wrap ${layout === "column" ? "demo-selectcard-wrap--col" : ""}`}>
        {options.map((opt) => (
          <div key={opt.value} className={`demo-selectcard ${isActive(opt.value) ? "demo-selectcard--active" : ""}`} onClick={() => toggle(opt.value)}>
            <div className="demo-selectcard__check">{isActive(opt.value) ? "✓" : ""}</div>
            <div className="demo-selectcard__text">
              <strong>{opt.label}</strong>
              <small>{opt.info}</small>
            </div>
          </div>
        ))}
      </div>
      <small className="demo-msg demo-msg--muted">
        Selected: {type === "checkbox" ? (safeSelected.length ? safeSelected.join(", ") : "none") : (safeSelected || "none")}
      </small>
    </div>
  );
}

/* ── Filter ──────────────────────────────────────────────────────── */
function LiveFilter({ showSubcategory }) {
  const columns = [
    { key: "status", label: "Status", values: ["Active", "Inactive", "Pending"] },
    { key: "role", label: "Role", values: ["Full Stack Dev", "Backend Dev", "Frontend Dev", "Designer", "DevOps Engineer", "QA Engineer"] },
    { key: "country", label: "Country", values: ["India", "USA", "UK", "Australia", "Japan"] },
  ];
  const [activeCol, setActiveCol] = useState("");
  const [activeVal, setActiveVal] = useState("");

  const activeColumn = columns.find((c) => c.key === activeCol);

  return (
    <div className="demo-field">
      <label className="demo-label">Filter Preview</label>
      <div className="demo-filter-row">
        <select className="demo-phone-code" style={{ width: "auto", minWidth: 120 }} value={activeCol} onChange={(e) => { setActiveCol(e.target.value); setActiveVal(""); }}>
          <option value="">Select column...</option>
          {columns.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
        {showSubcategory && activeColumn && (
          <select className="demo-phone-code" style={{ width: "auto", minWidth: 120 }} value={activeVal} onChange={(e) => setActiveVal(e.target.value)}>
            <option value="">All {activeColumn.label}</option>
            {activeColumn.values.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        )}
        {(activeCol || activeVal) && (
          <button className="demo-btn demo-btn--delete" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
            onClick={() => { setActiveCol(""); setActiveVal(""); }}>Clear</button>
        )}
      </div>
      <div className="demo-filter-result">
        <small className="demo-msg demo-msg--muted">
          Filter: {activeCol ? `${activeColumn?.label}` : "none"}
          {activeVal ? ` = "${activeVal}"` : ""}
          {" "}({activeVal ? activeColumn?.values.filter((v) => v === activeVal).length : activeColumn ? activeColumn.values.length : DT_DATA.length} matches)
        </small>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT CATALOG — each entry defines its demo + customizable props
   ═══════════════════════════════════════════════════════════════════ */
const FORM_INPUTS = [
  {
    title: "TextInput",
    desc: "Text, email, password, OTP input with validation & button integration",
    propDefs: [
      { name: "label", type: "string", placeholder: "Field Label" },
      { name: "type", type: "select", options: ["text", "email", "password"] },
      { name: "placeholder", type: "string", placeholder: "Placeholder text" },
      { name: "required", type: "boolean" },
      { name: "disabled", type: "boolean" },
    ],
    defaults: { label: "Username", type: "text", placeholder: "Enter your name...", required: false, disabled: false },
    render: (p) => <LiveTextInput {...p} />,
  },
  {
    title: "TextArea",
    desc: "Textarea with optional word count limiting",
    propDefs: [
      { name: "label", type: "string", placeholder: "Field Label" },
      { name: "wordLimit", type: "number", min: 5, max: 500 },
      { name: "rows", type: "number", min: 2, max: 10 },
      { name: "disabled", type: "boolean" },
    ],
    defaults: { label: "Description", wordLimit: 50, rows: 3, disabled: false },
    render: (p) => <LiveTextArea {...p} />,
  },
  {
    title: "SelectComponent",
    desc: "Dropdown with single/multi-select, search, and tags",
    propDefs: [
      { name: "label", type: "string", placeholder: "Field Label" },
      { name: "isMulti", type: "boolean" },
      { name: "searchable", type: "boolean" },
      { name: "disabled", type: "boolean" },
    ],
    defaults: { label: "Framework", isMulti: false, searchable: true, disabled: false },
    render: (p) => <LiveSelect {...p} />,
  },
  {
    title: "DateInput",
    desc: "Date/time picker — single, range, past/future constraints",
    propDefs: [
      { name: "label", type: "string", placeholder: "Field Label" },
      { name: "mode", type: "select", options: ["all", "past", "future", "range"] },
      { name: "includeTime", type: "boolean" },
      { name: "disabled", type: "boolean" },
    ],
    defaults: { label: "Date", mode: "all", includeTime: false, disabled: false },
    render: (p) => <LiveDateInput {...p} />,
  },
  {
    title: "PhoneInput",
    desc: "Phone input with country code dropdown and flags",
    propDefs: [
      { name: "label", type: "string", placeholder: "Field Label" },
      { name: "disabled", type: "boolean" },
    ],
    defaults: { label: "Phone Number", disabled: false },
    render: (p) => <LivePhoneInput {...p} />,
  },
  {
    title: "ColorPicker",
    desc: "Visual color picker with hex code display",
    propDefs: [
      { name: "label", type: "string", placeholder: "Field Label" },
      { name: "defaultColor", type: "string", placeholder: "#00b4d8" },
    ],
    defaults: { label: "Brand Color", defaultColor: "#00b4d8" },
    render: (p) => <LiveColorPicker {...p} />,
  },
  {
    title: "TagInput",
    desc: "Tag input with suggestions, create new, max limit",
    propDefs: [
      { name: "label", type: "string", placeholder: "Field Label" },
      { name: "maxTags", type: "number", min: 0, max: 20 },
      { name: "disabled", type: "boolean" },
    ],
    defaults: { label: "Skills", maxTags: 5, disabled: false },
    render: (p) => <LiveTagInput {...p} />,
  },
  {
    title: "FileUpload",
    desc: "Drag-drop upload with type, size, video resolution checks",
    propDefs: [
      { name: "label", type: "string", placeholder: "Field Label" },
      { name: "multiple", type: "boolean" },
      { name: "maxFileSizeMB", type: "number", min: 1, max: 500 },
      { name: "showPreview", type: "boolean" },
      { name: "disabled", type: "boolean" },
    ],
    defaults: { label: "Upload Files", multiple: true, maxFileSizeMB: 100, showPreview: true, disabled: false },
    render: (p) => <LiveFileUpload {...p} />,
  },
];

const UI_COMPONENTS = [
  {
    title: "Button",
    desc: "Versatile button with icon types (add, edit, delete, export), loading states",
    propDefs: [
      { name: "buttonType", type: "select", options: ["add", "edit", "delete", "export", "save", "import", "check"] },
      { name: "buttonLabel", type: "string", placeholder: "Button text" },
      { name: "isLoading", type: "boolean" },
      { name: "disabled", type: "boolean" },
    ],
    defaults: { buttonType: "add", buttonLabel: "Add New", isLoading: false, disabled: false },
    render: (p) => <LiveButtons {...p} />,
  },
  {
    title: "Modal",
    desc: "Reusable modal with ESC key, overflow handling, backdrop click",
    propDefs: [
      { name: "title", type: "string", placeholder: "Modal title" },
      { name: "showCloseBtn", type: "boolean" },
      { name: "backdropClose", type: "boolean" },
    ],
    defaults: { title: "Sample Modal", showCloseBtn: true, backdropClose: true },
    render: (p) => <LiveModal {...p} />,
  },
  {
    title: "SelectCard",
    desc: "Card selection (radio/checkbox) with labels and info text",
    propDefs: [
      { name: "label", type: "string", placeholder: "Field Label" },
      { name: "type", type: "select", options: ["radio", "checkbox"] },
      { name: "layout", type: "select", options: ["row", "column"] },
    ],
    defaults: { label: "Work Style", type: "radio", layout: "row" },
    render: (p) => <LiveSelectCard {...p} />,
  },
  {
    title: "ImageViewer",
    desc: "Image viewer with zoom and multi-image navigation",
    propDefs: [
      { name: "zoomable", type: "boolean" },
      { name: "showNav", type: "boolean" },
    ],
    defaults: { zoomable: true, showNav: true },
    render: (p) => <LiveImageViewer {...p} />,
  },
  {
    title: "Searchbar",
    desc: "Search input with live filtering for tables/grids",
    propDefs: [
      { name: "placeholder", type: "string", placeholder: "Placeholder text" },
      { name: "disabled", type: "boolean" },
    ],
    defaults: { placeholder: "Search pages...", disabled: false },
    render: (p) => <LiveSearchbar {...p} />,
  },
];

const DATA_DISPLAY = [
  {
    title: "DataTable",
    desc: "Full dashboard table with search, filter, sort, table/grid toggle, pagination, bulk actions",
    propDefs: [
      { name: "searchable", type: "boolean" },
      { name: "filterable", type: "boolean" },
      { name: "sortable", type: "boolean" },
      { name: "paginated", type: "boolean" },
      { name: "showCheckbox", type: "boolean" },
      { name: "defaultView", type: "select", options: ["table", "grid"] },
      { name: "rowsPerPage", type: "number", min: 2, max: 8 },
    ],
    defaults: { searchable: true, filterable: true, sortable: true, paginated: true, showCheckbox: true, defaultView: "table", rowsPerPage: 4 },
    render: (p) => <LiveDataTable {...p} />,
  },
  {
    title: "MetricCard",
    desc: "Metric display cards with icon, value, and operation type",
    propDefs: [
      { name: "title", type: "string", placeholder: "Card title" },
      { name: "operation", type: "select", options: ["total", "count", "average", "max", "min"] },
      { name: "showIcon", type: "boolean" },
    ],
    defaults: { title: "Revenue", operation: "total", showIcon: true },
    render: (p) => <LiveMetricCard {...p} />,
  },
  {
    title: "Filter",
    desc: "Column-based filtering with subcategory support",
    propDefs: [
      { name: "showSubcategory", type: "boolean" },
    ],
    defaults: { showSubcategory: true },
    render: (p) => <LiveFilter {...p} />,
  },
];

const DEMO_CATEGORIES = [
  { category: "Form Inputs", icon: "✏️", count: 10, items: FORM_INPUTS },
  { category: "UI Components", icon: "🧩", count: 8, items: UI_COMPONENTS },
  { category: "Data Display", icon: "📊", count: 6, items: DATA_DISPLAY },
];

const totalComponents = 24;

/* ═══════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════════════ */
export default function ComponentShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  const items = DEMO_CATEGORIES[activeTab].items;

  return (
    <div className="cshowcase">
      {/* Stats */}
      <div className="comp-stats">
        <div className="comp-stats__item">
          <span className="comp-stats__num">{totalComponents}</span>
          <span className="comp-stats__label">Components</span>
        </div>
        <div className="comp-stats__item">
          <span className="comp-stats__num">{DEMO_CATEGORIES.length}</span>
          <span className="comp-stats__label">Categories</span>
        </div>
        <div className="comp-stats__item">
          <span className="comp-stats__num">React</span>
          <span className="comp-stats__label">Framework</span>
        </div>
        <div className="comp-stats__item">
          <span className="comp-stats__num">Production</span>
          <span className="comp-stats__label">Ready</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="comp-tabs">
        {DEMO_CATEGORIES.map((cat, i) => (
          <button key={cat.category} className={`comp-tabs__btn ${i === activeTab ? "comp-tabs__btn--active" : ""}`} onClick={() => setActiveTab(i)}>
            <span className="comp-tabs__icon">{cat.icon}</span>
            {cat.category}
            <span className="comp-tabs__count">{cat.count}</span>
          </button>
        ))}
      </div>

      {/* Components list */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
          <div className="cshowcase__list">
            {items.map((item) => (
              <DemoBlock key={item.title} title={item.title} description={item.desc} propDefs={item.propDefs} defaults={item.defaults}>
                {item.render}
              </DemoBlock>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
