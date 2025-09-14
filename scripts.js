// scripts.js — Task Board using data.js (module)
import { initialTasks } from "./data.js";

/** @typedef {"todo"|"doing"|"done"} TaskStatus */
/** @typedef {{id:string|number,title:string,description?:string,status:TaskStatus}} Task */

// ---------------- State ----------------
/** @type {Task[]} */ let tasks = [];
/** @type {Task|null} */ let activeTask = null;

/*-----------DOM-----------*/
/*
getContainerByStatus(status)
Finds the right column’s container.
*/

function getContainerByStatus(status) {
  const col = document.querySelector(`.column-div[data-status="${status}"]`);
  return col ? col.querySelector(".tasks-container") : null;
}
/* clearAllColumns()
Empties every .tasks-container before you redraw. */
function clearAllColumns() {
  document.querySelectorAll(".tasks-container").forEach(el => el.innerHTML = "");
}
/* createTaskCard(task)
Builds one clickable card */

function createTaskCard(task) {
  const card = document.createElement("div");
  card.className = "task-div";
  card.dataset.id = String(task.id);
  card.textContent = task.title || "Untitled";
  card.addEventListener("click", () => openTaskModal(task.id));
  return card;
}
/* updateColumnCounts(counts)
Updates the column headers so they show TODO (n), DOING (n), DONE (n).
*/
function updateColumnCounts(counts) {
  ["todo","doing","done"].forEach(status => {
    const col = document.querySelector(`.column-div[data-status="${status}"]`);
    const header = col?.querySelector(".column-head-div .columnHeader");
    if (header) header.textContent = `${status.toUpperCase()} (${counts[status] ?? 0})`;
  });
}
/* renderTasks(data) - clears the columns, loops through data and puts each card into the container that matches its status
tallies counts and updates the headers */

function renderTasks(data) {
  clearAllColumns();
  const counts = { todo:0, doing:0, done:0 };
  data.forEach(task => {
    const container = getContainerByStatus(task.status);
    if (!container) return;
    container.appendChild(createTaskCard(task));
    counts[task.status] += 1;
  });
  updateColumnCounts(counts);
}

// ------------- Modal logic -------------
const modalEl      = /** @type {HTMLDialogElement|null} */ (document.getElementById("task-modal"));
const inputTitle   = /** @type {HTMLInputElement|null}    */ (document.getElementById("task-title"));
const inputDesc    = /** @type {HTMLTextAreaElement|null}*/ (document.getElementById("task-desc"));
const selectStatus = /** @type {HTMLSelectElement|null}   */ (document.getElementById("task-status"));
const btnClose     = /** @type {HTMLButtonElement|null}   */ (document.getElementById("close-task-modal"));
const btnSave      = /** @type {HTMLButtonElement|null}   */ (document.getElementById("save-task-modal"));

/*openTaskModal(taskId)
Finds the task with that id, fills the inputs, and calls modal.showModal(). */

function openTaskModal(taskId) {
  if (!modalEl || !inputTitle || !inputDesc || !selectStatus) return; // modal not in HTML yet
  activeTask = tasks.find(t => String(t.id) === String(taskId)) || null;
  if (!activeTask) return;

  inputTitle.value = activeTask.title ?? "";
  inputDesc.value = activeTask.description ?? "";
  selectStatus.value = activeTask.status;
  if (!modalEl.open) modalEl.showModal();
}

/*closeTaskModal()
Closes the dialog and clears activeTask.*/

function closeTaskModal() {
  if (!modalEl) return;
  modalEl.close();
  activeTask = null;
}
/* saveTaskFromModal()
Copies the edited title/description/status from the fields back into the task, then:
calls renderTasks(tasks) to redraw all cards in the right places
closes the modal */
function saveTaskFromModal() {
  if (!activeTask || !inputTitle || !inputDesc || !selectStatus) return;
  activeTask.title = inputTitle.value.trim() || "Untitled";
  activeTask.description = inputDesc.value.trim();
  activeTask.status = /** @type {TaskStatus} */ (selectStatus.value);
  renderTasks(tasks);
  closeTaskModal();
}

/* setupModalHandlers()
sets up:
Close button → closeTaskModal
Save button → saveTaskFromModal
ESC key → closes modal
backdrop click (click outside the dialog) → closes modal*/

function setupModalHandlers() {
  if (!modalEl) return; // safe if you haven’t added dialog yet
  btnClose?.addEventListener("click", closeTaskModal);
  btnSave?.addEventListener("click", saveTaskFromModal);

  // ESC
  modalEl.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeTaskModal();
  });

  // Click on backdrop
  modalEl.addEventListener("click", (e) => {
    const r = modalEl.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) closeTaskModal();
  });
}

// --------------- Initialization ------------------

/*initBoard() runs once the page is ready:
copies initialTasks into the live tasks array (so you don’t mutate the import)
calls renderTasks(tasks) to draw the board
calls setupModalHandlers() to activate the modal
Then there’s a tiny check to run initBoard() either immediately or on DOMContentLoaded, depending on load timing.*/

function initBoard() {
  tasks = initialTasks.map(t => ({...t})); // copy from data.js
  renderTasks(tasks);
  setupModalHandlers();
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBoard);
} else {
  initBoard();
}
