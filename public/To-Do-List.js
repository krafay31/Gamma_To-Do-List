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
  });*/