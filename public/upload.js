// 업로드 폼에 'submit' 이벤트 리스너를 추가   
document.getElementById('uploadForm').addEventListener('submit', function(event) {
  event.preventDefault();  // 폼의 기본 제출 동작을 막음

  const formData = new FormData(this);  // 폼 데이터를 FormData 객체로 만듬

  // 파일 업로드 요청을 보냄
  fetch('/upload', {
    method: 'POST',
    body: formData  // 폼 데이터를 요청 본문에 포함   
  })
  .then(response => response.text())  // 서버 응답을 텍스트로 변환   
  .then(result => {
    alert(result);  // 응답 결과를 알림으로 표시   
    loadCoreAndTaskOptions();  // 파일 업로드 후 코어와 태스크 옵션을 로드   
    loadFileList();  // 파일 업로드 후 파일 목록을 로드   
  })
  .catch(error => {
    console.error('Error:', error);  // 오류가 발생하면 콘솔에 출력   
  });
});

// 코어와 태스크 옵션을 로드하는 함수   
function loadCoreAndTaskOptions() {
  fetch('/data')
    .then(response => response.json())  // 서버 응답을 JSON으로 변환   
    .then(data => {
      const coreSelect = document.getElementById('coreSelect');
      const taskSelect = document.getElementById('taskSelect');

      // 기존 옵션을 지움.
      coreSelect.innerHTML = '';
      taskSelect.innerHTML = '';

      // 코어 값을 가져와서 옵션을 추가  
      const cores = data.map(d => d.core);
      cores.forEach(core => {
        const option = document.createElement('option');
        option.value = core;
        option.textContent = core;
        coreSelect.appendChild(option);
      });

      // 태스크 값을 옵션으로 추가   
      const tasks = ['task1', 'task2', 'task3', 'task4', 'task5'];
      tasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task;
        option.textContent = task;
        taskSelect.appendChild(option);
      });

      // 초기 차트 데이터를 첫 번째 코어와 태스크 값으로 로드   
      loadChartData(coreSelect.value, taskSelect.value);
    })
    .catch(error => {
      console.error('Error:', error);  // 오류가 발생하면 콘솔에 출력   
    });
}

// 파일 목록을 로드하는 함수   
function loadFileList() {
  fetch('/files')
    .then(response => response.json())  // 서버 응답을 JSON으로 변환   
    .then(data => {
      const fileListDiv = document.getElementById('fileList');
      fileListDiv.innerHTML = '';  // 기존 파일 목록을 지움

      // 파일 목록을 화면에 추가   
      data.forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.textContent = file.originalname;
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '삭제';
        deleteButton.addEventListener('click', () => {
          // 파일 삭제 요청을 보냄
          fetch(`/files/${file.id}`, {
            method: 'DELETE'
          })
          .then(response => response.text())  // 서버 응답을 텍스트로 변환   
          .then(result => {
            alert(result);  // 응답 결과를 알림으로 표시   
            loadFileList();  // 파일 삭제 후 파일 목록을 다시 로드   
          })
          .catch(error => {
            console.error('Error:', error);  // 오류가 발생하면 콘솔에 출력   
          });
        });

        fileDiv.appendChild(deleteButton);
        fileListDiv.appendChild(fileDiv);
      });
    })
    .catch(error => {
      console.error('Error:', error);  // 오류가 발생하면 콘솔에 출력   
    });
}

// 페이지 초기 로드시 파일 목록을 로드
loadFileList();
