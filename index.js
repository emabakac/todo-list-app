const listsContainer = document.getElementById("lists");
const newListForm = document.getElementById("new-list-form");
const newListInput = document.getElementById("new-list-input");
const deleteListButton = document.getElementById("delete-list-button");
const todoListContainer = document.getElementById("todo-list");
const listTitleElement = document.getElementById("list-title");
const listCountElement = document.getElementById("list-count");
const tasksContainer = document.getElementById("tasks");
const taskTemplate = document.getElementById("task-template");
const newTaskForm = document.getElementById("new-task-form");
const newTaskInput = document.getElementById("new-task-input");
const deleteCompletedTasksButton = document.getElementById(
  "delete-completed-tasks-button"
);

const LOCAL_STORAGE_LIST_KEY = "task.lists";
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = "task.selectedListId";
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);

newListForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const listName = newListInput.value;
  if (listName == null || listName === "") return;
  const list = createList(listName);
  newListInput.value = null;
  lists.push(list);
  saveAndRender();
});

const createList = (name) => {
  return { id: Date.now().toString(), name, tasks: [] };
};

const renderLists = () => {
  lists.forEach((list) => {
    const listElement = document.createElement("li");
    listElement.dataset.listId = list.id;
    listElement.classList.add("list-name");
    listElement.innerText = list.name;
    if (list.id === selectedListId) {
      listElement.classList.add("active-list");
    }
    listsContainer.appendChild(listElement);
  });
};

listsContainer.addEventListener("click", (e) => {
  if (e.target.tagName.toLowerCase() === "li") {
    selectedListId = e.target.dataset.listId;
    saveAndRender();
  }
});

newTaskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const taskName = newTaskInput.value;
  if (taskName == null || taskName === "") return;
  const task = createTask(taskName);
  newTaskInput.value = null;
  const selectedList = lists.find((list) => list.id === selectedListId);
  selectedList.tasks.push(task);
  saveAndRender();
});

const createTask = (name) => {
  return { id: Date.now().toString(), name, complete: false };
};

tasksContainer.addEventListener("click", (e) => {
  if (e.target.tagName.toLowerCase() === "input") {
    const selectedList = lists.find((list) => list.id === selectedListId);
    const selectedTask = selectedList.tasks.find(
      (task) => task.id === e.target.id
    );
    selectedTask.complete = e.target.checked;
    save();
    renderTaskCount(selectedList);
  }
});

const clearElement = (element) => {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
};

const save = () => {
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists));
  localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
};

const render = () => {
  clearElement(listsContainer);
  renderLists();

  const selectedList = lists.find((list) => list.id === selectedListId);
  if ((selectedList == null) | (lists.length === 0)) {
    todoListContainer.style.display = "none";
  } else {
    todoListContainer.style.display = "";
    listTitleElement.innerText = selectedList.name;
    renderTaskCount(selectedList);
    clearElement(tasksContainer);
    renderTasks(selectedList);
  }
};

const saveAndRender = () => {
  save();
  render();
};

const renderTasks = (selectedList) => {
  selectedList.tasks.forEach((task) => {
    const taskElement = document.importNode(taskTemplate.content, true);
    const checkbox = taskElement.querySelector("input");
    checkbox.id = task.id;
    checkbox.checked = task.complete;
    const label = taskElement.querySelector("label");
    label.htmlFor = task.id;
    label.append(task.name);
    tasksContainer.appendChild(taskElement);
  });
};

const renderTaskCount = (selectedList) => {
  const incompleteTaskCount = selectedList.tasks.filter(
    (task) => !task.complete
  ).length;
  const taskString = incompleteTaskCount === 1 ? "task" : "tasks";
  listCountElement.innerText = `${incompleteTaskCount} ${taskString} remaining`;
};

deleteListButton.addEventListener("click", (e) => {
  lists = lists.filter((list) => list.id !== selectedListId);
  selectedListId = null;
  saveAndRender();
});

deleteCompletedTasksButton.addEventListener("click", (e) => {
  const selectedList = lists.find((list) => list.id === selectedListId);
  selectedList.tasks = selectedList.tasks.filter((task) => !task.complete);
  saveAndRender();
});

render();
