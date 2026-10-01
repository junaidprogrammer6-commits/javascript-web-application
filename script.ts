// script.ts — compiled with: tsc script.ts --target es2019 --lib es2019,dom

type Priority = "Low" | "Medium" | "High";

interface Task {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  dueDate: string; // ISO date or ""
  done: boolean;
  createdAt: number;
}

interface FilterState {
  search: string;
  status: "all" | "pending" | "done";
  priority: "all" | Priority;
}

const STORAGE_KEY = "jwa_tasks_v1";
let tasks: Task[] = [];
let filter: FilterState = { search: "", status: "all", priority: "all" };

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function load(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

function save(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    /* storage unavailable, ignore */
  }
}

function addTask(title: string, category: string, priority: Priority, dueDate: string): void {
  tasks.unshift({ id: uid(), title, category, priority, dueDate, done: false, createdAt: Date.now() });
  save();
  render();
}

function toggleTask(id: string): void {
  const t = tasks.find((x) => x.id === id);
  if (t) t.done = !t.done;
  save();
  render();
}

function deleteTask(id: string): void {
  tasks = tasks.filter((x) => x.id !== id);
  save();
  render();
}

function isOverdue(t: Task): boolean {
  if (!t.dueDate || t.done) return false;
  return new Date(t.dueDate) < new Date(new Date().toDateString());
}

function applyFilter(list: Task[]): Task[] {
  return list.filter((t) => {
    if (filter.status === "pending" && t.done) return false;
    if (filter.status === "done" && !t.done) return false;
    if (filter.priority !== "all" && t.priority !== filter.priority) return false;
    if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as Record<string, string>)[c]);
}

function renderStats(): void {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const pending = total - done;
  const overdue = tasks.filter(isOverdue).length;
  const set = (id: string, v: number) => (document.getElementById(id)!.textContent = String(v));
  set("statTotal", total);
  set("statDone", done);
  set("statPending", pending);
  set("statOverdue", overdue);
  const bar = document.getElementById("progressBar") as HTMLDivElement;
  bar.style.width = (total ? (done / total) * 100 : 0) + "%";
}

function renderList(): void {
  const list = document.getElementById("taskList") as HTMLDivElement;
  const visible = applyFilter(tasks);

  if (visible.length === 0) {
    list.innerHTML = '<p class="empty">No tasks match this view.</p>';
    return;
  }

  list.innerHTML = visible
    .map((t) => {
      const due = t.dueDate ? `<span class="due ${isOverdue(t) ? "overdue" : ""}">${escapeHtml(t.dueDate)}</span>` : "";
      return `
      <div class="task ${t.done ? "done" : ""}" data-id="${t.id}">
        <input type="checkbox" class="chk" ${t.done ? "checked" : ""} aria-label="Mark complete">
        <div class="body">
          <div class="title">${escapeHtml(t.title)}</div>
          <div class="meta">
            <span class="badge cat">${escapeHtml(t.category || "General")}</span>
            <span class="badge pri pri-${t.priority}">${t.priority}</span>
            ${due}
          </div>
        </div>
        <button class="del" aria-label="Delete task">&times;</button>
      </div>`;
    })
    .join("");

  list.querySelectorAll<HTMLInputElement>(".chk").forEach((el) =>
    el.addEventListener("change", (e) => {
      const id = (e.target as HTMLElement).closest<HTMLElement>(".task")!.dataset.id!;
      toggleTask(id);
    })
  );
  list.querySelectorAll<HTMLButtonElement>(".del").forEach((el) =>
    el.addEventListener("click", (e) => {
      const id = (e.target as HTMLElement).closest<HTMLElement>(".task")!.dataset.id!;
      deleteTask(id);
    })
  );
}

function render(): void {
  renderStats();
  renderList();
}

function initForm(): void {
  const form = document.getElementById("taskForm") as HTMLFormElement;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const title = data.title.trim();
    if (!title) return;
    addTask(title, data.category.trim(), data.priority as Priority, data.dueDate);
    form.reset();
    (document.getElementById("priority") as HTMLSelectElement).value = "Medium";
  });
}

function initFilters(): void {
  const searchEl = document.getElementById("search") as HTMLInputElement;
  const statusEl = document.getElementById("statusFilter") as HTMLSelectElement;
  const priorityEl = document.getElementById("priorityFilter") as HTMLSelectElement;

  searchEl.addEventListener("input", () => {
    filter.search = searchEl.value;
    renderList();
  });
  statusEl.addEventListener("change", () => {
    filter.status = statusEl.value as FilterState["status"];
    renderList();
  });
  priorityEl.addEventListener("change", () => {
    filter.priority = priorityEl.value as FilterState["priority"];
    renderList();
  });
}

function initTheme(): void {
  const root = document.documentElement;
  try {
    const saved = localStorage.getItem("jwa_theme");
    if (saved) root.dataset.theme = saved;
  } catch {
    /* ignore */
  }
  document.getElementById("themeBtn")!.addEventListener("click", () => {
    const isLight = root.dataset.theme === "light";
    root.dataset.theme = isLight ? "dark" : "light";
    try {
      localStorage.setItem("jwa_theme", root.dataset.theme);
    } catch {
      /* ignore */
    }
  });
}

function seedIfEmpty(): void {
  if (tasks.length > 0) return;
  tasks = [
    { id: uid(), title: "Set up project structure", category: "Setup", priority: "Medium", dueDate: "", done: true, createdAt: Date.now() },
    { id: uid(), title: "Design the task card layout", category: "Design", priority: "Low", dueDate: "", done: true, createdAt: Date.now() },
    { id: uid(), title: "Add search and filters", category: "Feature", priority: "High", dueDate: "", done: false, createdAt: Date.now() },
    { id: uid(), title: "Write the README", category: "Docs", priority: "Low", dueDate: "", done: false, createdAt: Date.now() },
  ];
  save();
}

document.addEventListener("DOMContentLoaded", () => {
  tasks = load();
  seedIfEmpty();
  initTheme();
  initForm();
  initFilters();
  render();
});
