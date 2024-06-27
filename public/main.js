document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const sendTasksButton = document.getElementById('send-tasks');
    const assignedToSelect = document.getElementById('assignedTo');
    const userForm = document.getElementById('user-form');
  
    // ユーザーの取得
    function fetchUsers() {
      fetch('/api/users')
        .then(response => response.json())
        .then(users => {
          assignedToSelect.innerHTML = '<option value="">ユーザー</option>';
          users.forEach(user => {
            const option = document.createElement('option');
            option.value = user._id;
            option.textContent = user.username;
            assignedToSelect.appendChild(option);
          });
        });
    }
  
    fetchUsers();
  
    // ユーザーの追加
    userForm.addEventListener('submit', (e) => {
      e.preventDefault();
  
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      })
        .then(response => response.json())
        .then(user => {
          alert(`User ${user.username} added successfully!`);
          userForm.reset();
          fetchUsers(); // ユーザー追加後にユーザーリストを更新
        })
        .catch(err => {
          alert('Error adding user');
          console.error(err);
        });
    });
  
    // タスクの取得
    function fetchTasks() {
      fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
          taskList.innerHTML = '';
          tasks.forEach(addTaskToList);
        });
    }
  
    // ページ読み込み時にタスクを取得
    fetchTasks();
  
    // タスクの追加
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault(); // prevent the default form submission behavior
  
      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;
      const deadline = document.getElementById('deadline').value || null;
      const assignedTo = document.getElementById('assignedTo').value || null;
  
      fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description, deadline, assignedTo })
      })
        .then(response => response.json())
        .then(task => {
          addTaskToList(task);
          taskForm.reset();
          fetchTasks(); // タスク追加後にリストを更新
        })
        .catch(err => {
          alert('Error adding task');
          console.error(err);
        });
    });
  
    // タスクのリストに追加
    function addTaskToList(task) {
      const li = document.createElement('li');
      li.classList.add('task-card');
      const deadline = task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline';
      li.innerHTML = `
        <span style="text-decoration: ${task.completed ? 'line-through' : 'none'};">
          ${task.title} - ${task.description} (Deadline: ${deadline}) - Assigned to: ${task.assignedTo ? task.assignedTo.username : 'None'}
        </span>
        <button class="complete-btn" onclick="toggleComplete('${task._id}')">${task.completed ? 'Undo' : 'Complete'}</button>
        <button class="delete-btn" onclick="deleteTask('${task._id}')">Delete</button>
        <button class="edit-btn" onclick="editTask('${task._id}')">Edit</button>
      `;
      taskList.appendChild(li);
    }
  
    // タスクの完了/未完了を切り替え
    window.toggleComplete = function (id) {
      fetch(`/api/tasks/${id}`, {
        method: 'PUT'
      })
        .then(response => response.json())
        .then(updatedTask => {
          fetchTasks(); // 完了状態を切り替えた後にリストを更新
        });
    }
  
    // タスクの削除
    window.deleteTask = function (id) {
      fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      })
        .then(response => response.json())
        .then(() => {
          fetchTasks(); // タスクを削除した後にリストを更新
        });
    }
  
    // タスクの編集
    window.editTask = function (id) {
      const newTitle = prompt("Enter new title:");
      const newDescription = prompt("Enter new description:");
      const newDeadline = prompt("Enter new deadline (YYYY-MM-DD):");
      const newAssignedTo = prompt("Enter new assignee ID:");
      if (newTitle !== null && newDescription !== null) {
        fetch(`/api/tasks/${id}/edit`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ title: newTitle, description: newDescription, deadline: newDeadline || null, assignedTo: newAssignedTo || null })
        })
          .then(response => response.json())
          .then(updatedTask => {
            fetchTasks(); // タスクを編集した後にリストを更新
          });
      }
    }
  
    // Discordにタスクを送信
    sendTasksButton.addEventListener('click', () => {
      fetch('/api/send-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(result => {
          alert(result.message);
        })
        .catch(err => {
          alert('Error sending tasks to Discord');
          console.error(err);
        });
    });
  });
  