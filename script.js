const modal = document.getElementById("taskModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");
const saveBtn = document.getElementById("saveBtn");

const taskName = document.getElementById("taskName");
const taskDesc = document.getElementById("taskDescription");
const taskDate = document.getElementById("taskDate");
const taskStatus = document.getElementById("taskStatus");
const modalTitle = document.getElementById("modalTitle");

const openCol = document.querySelector(".card.open");
const progressCol = document.querySelector(".card.progress");
const doneCol = document.querySelector(".card.done");

let editingId = null;

const today = new Date().toISOString().split("T")[0];
taskDate.min = today;

/* MODAL */
openModalBtn.onclick = () => openModal();
closeModalBtn.onclick = cancelBtn.onclick = closeModal;

function openModal(task = null) {
  modal.classList.remove("hidden");

  if (task) {
    modalTitle.textContent = `${task.name} taskını görüntülüyorsunuz`;
    editingId = task.id;
    taskName.value = task.name;
    taskDesc.value = task.description;
    taskDate.value = task.date;
    taskStatus.value = task.status;

    [...taskStatus.options].forEach(
      o => o.disabled = o.value === task.status
    );
  } else {
    modalTitle.textContent = "Yeni Task Ekle";
    editingId = null;
  }

  validateForm();
}

function closeModal() {
  modal.classList.add("hidden");
  clearForm();
}

/* VALIDATION */
function validateForm() {
  const valid =
    taskName.value.trim().length > 0 &&
    taskName.value.length <= 50 &&
    taskDate.value &&
    taskDate.value >= today;

  saveBtn.disabled = !valid;
}

taskName.oninput = taskDate.oninput = validateForm;

/* STORAGE */
const getTasks = () =>
  JSON.parse(localStorage.getItem("tasks")) || [];

const setTasks = tasks =>
  localStorage.setItem("tasks", JSON.stringify(tasks));

/* SAVE */
saveBtn.onclick = () => {
  const tasks = getTasks();

  if (editingId) {
    const t = tasks.find(x => x.id === editingId);
    Object.assign(t, {
      name: taskName.value.trim(),
      description: taskDesc.value.trim(),
      date: taskDate.value,
      status: taskStatus.value
    });
  } else {
    tasks.push({
      id: Date.now(),
      name: taskName.value.trim(),
      description: taskDesc.value.trim(),
      date: taskDate.value,
      status: "open"
    });
  }

  setTasks(tasks);
  renderTasks();
  closeModal();
};

/* INFO CARD GÜNCELLEME */
function updateInfoCard() {
  const tasks = getTasks();
  const openCount = tasks.filter(t => t.status === "open").length;

  const info = document.querySelector(".info-card");
  info.textContent = `Hoş geldin Mete, aktif ${openCount} adet görevin bulunuyor`;
}

/* RENDER */
function renderTasks() {
  [openCol, progressCol, doneCol].forEach(col =>
    col.querySelectorAll(".task").forEach(t => t.remove())
  );

  getTasks().forEach(task => {
    const div = document.createElement("div");
    div.className = "task";
    div.textContent = task.name;
    if (task.status === "done") div.classList.add("done-task");

    /* DRAG ÖZELLİĞİ */
    div.draggable = true;
    div.dataset.id = task.id;

    div.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("taskId", task.id);
    });

    div.onclick = () => openModal(task);

    (task.status === "open" ? openCol :
     task.status === "progress" ? progressCol : doneCol
    ).appendChild(div);
  });

  updateInfoCard(); // her render sonrası info güncelle
}

/* DRAG DROP ALANLARI */
[openCol, progressCol, doneCol].forEach(col => {
  col.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  col.addEventListener("drop", (e) => {
    const taskId = e.dataTransfer.getData("taskId");
    moveTask(taskId, col);
  });
});

/* TASK TAŞIMA */
function moveTask(taskId, column) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id == taskId);

  if (column.classList.contains("open")) {
    task.status = "open";
  } else if (column.classList.contains("progress")) {
    task.status = "progress";
  } else if (column.classList.contains("done")) {
    task.status = "done";
  }

  setTasks(tasks);
  renderTasks();
}

/* FORM RESET */
function clearForm() {
  taskName.value = "";
  taskDesc.value = "";
  taskDate.value = "";
  taskStatus.value = "open";
  saveBtn.disabled = true;
}

/* SAYFA AÇILINCA */
renderTasks();
