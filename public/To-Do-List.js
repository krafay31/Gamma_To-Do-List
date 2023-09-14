let tasks = [];

async function fetchTasks() {
  try {
    // Fetch all tasks from the server
    const response = await fetch('/api/tasks');
    if (!response.ok) {
      throw new Error('Failed to fetch tasks from the server.');
    }
    const data = await response.json();
    tasks = data; // Update the tasks array with data from the server
    return tasks; // Resolve the Promise with the updated tasks array
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

function handleDragStart(event, index) {
  event.dataTransfer.setData('text/plain', index);
}

function handleDragOver(event, index) {
  event.preventDefault();
  const draggedOverTask = document.querySelector('.dragging-over');
  if (draggedOverTask) {
    draggedOverTask.classList.remove('dragging-over');
  }
  event.target.classList.add('dragging-over');
}

function handleDrop(event, dropIndex) {
  event.preventDefault();

  const dragIndex = event.dataTransfer.getData('text/plain');
  const dragTask = tasks[dragIndex];

  tasks.splice(dragIndex, 1);
  tasks.splice(dropIndex, 0, dragTask);

  displayTasks();
}

function handleDragEnd() {
  const draggingOverTask = document.querySelector('.dragging-over');
  if (draggingOverTask) {
    draggingOverTask.classList.remove('dragging-over');
  }
}


// Call fetchTasks on page load


function addTask() {
  const taskInput = document.getElementById('taskInput');
  const newTask = taskInput.value.trim();
  if (newTask !== '') {
    // Use fetch to send the new task to the server for saving
    fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: newTask }),
    })
      .then((response) => response.json())
      .then((task) => {
        tasks.push(task);
        taskInput.value = '';
        displayTasks();
      })
      .catch((error) => console.error('Error adding task:', error));
  }
}

// Event listener to add a new task when Enter key is pressed
document.getElementById('taskInput').addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevent the default behavior of the Enter key
    addTask(); // Add the new task
  }
});

async function removeTask(index) {
  const taskId = tasks[index]._id;
  try {
    // Use fetch to send the DELETE request to the server
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete task.');
    }

    tasks.splice(index, 1); // Remove the task from the tasks array
    displayTasks();
  } catch (error) {
    console.error('Error deleting task:', error);
  }
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  displayTasks();

  // Use fetch to send the updated task status to the server
  const taskId = tasks[index]._id;
  fetch(`/api/tasks/${taskId}/complete`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ completed: tasks[index].completed }), // Send only the 'completed' field
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error('Error completing task:', error));
}

async function editTask(index) {
  const newContent = prompt('Edit the task:', tasks[index].text);
  if (newContent !== null && newContent.trim() !== '') {
    const taskId = tasks[index]._id;

    try {
      // Use fetch to send the task ID and updated content to the server for updating
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newContent.trim() }), // Send only the 'text' field
      });

      if (!response.ok) {
        throw new Error('Task update failed.');
      }

      tasks[index].text = newContent.trim();
      displayTasks();
    } catch (error) {
      console.error('Error editing task:', error);
    }
  }
}
/*
// Function to handle adding an image to a task
async function addImageToTask(index) {
  const selectedFile = prompt('Select an image file:');
  
  if (!selectedFile) {
    return;
  }

  const formData = new FormData();
  formData.append('image', selectedFile);

  try {
    const response = await fetch(`/api/tasks/${tasks[index]._id}/add-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Image upload failed.');
    }

    const data = await response.json();
    tasks[index].image = data.imageReference;
    displayTasks();
  } catch (error) {
    console.error('Error adding image to task:', error);
  }
}
*/

function setBackgroundImage(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function () {
      document.body.style.backgroundImage = `url(${reader.result})`;
    };
    reader.readAsDataURL(file);
  }
}

function filterTasks() {
  const filter = document.getElementById('filter').value;
  displayTasks(filter);
}
async function init() {
  try {
    // Call fetchTasks on page load to fetch data from the server
    await fetchTasks();
    displayTasks(); // Display the tasks on the page after data is fetched and tasks array is updated
  } catch (error) {
    console.error('Error initializing tasks:', error);
  }
}

// Call init to fetch data and render the page
init();

function displayTasks(filter = 'all') {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';

  const filteredTasks =
    filter === 'all' ? tasks : tasks.filter((task) => (filter === 'completed' ? task.completed : !task.completed));

    filteredTasks.forEach((task, index) => {
      const taskElement = document.createElement('div');
      taskElement.classList.add('task');
      // Add the draggable attribute and the event listeners for drag and drop
      taskElement.setAttribute('draggable', true);
      taskElement.addEventListener('dragstart', (event) => handleDragStart(event, index));
      taskElement.addEventListener('dragover', (event) => handleDragOver(event, index));
      taskElement.addEventListener('drop', (event) => handleDrop(event, index));
      taskElement.addEventListener('dragend', handleDragEnd);
    taskElement.classList.add('task');
    if (task.completed) {
      taskElement.classList.add('completed-task');
    } else if (task.edited) {
      taskElement.classList.add('edited-task');
    } else {
      taskElement.classList.add('new-task');
    }
    taskElement.innerHTML = `
    <span>${task.text}</span>
    <div class="task-actions">
    <button class="complete" onclick="toggleComplete(${index})">&#10003;</button>
    <button class="edit" onclick="editTask(${index})">&#9998;</button>
    <button class="delete" onclick="removeTask(${index})">&#128465;</button>

    </div>
    `;
    taskList.insertBefore(taskElement, taskList.firstChild); // Insert the new task at the beginning of the list
  });
}


/*fetchTasks()
  .then(() => {
    displayTasks(); // Display the tasks on the page after data is fetched and tasks array is updated
  })
  .catch((error) => {
    console.error('Error fetching tasks:', error);


        <button class="image" onclick="addImageToTask(${index})">Add Image</button>
  });*/


  