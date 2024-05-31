// 파일 목록을 로드하는 함수   
function loadFileList() {
  // '/files' 엔드포인트에서 파일 목록을 가져옴  
  fetch('/files')
    .then(response => response.json())  // 서버 응답을 JSON으로 변환   
    .then(data => {
      const fileListDiv = document.getElementById('fileList');
      const fileSelect = document.getElementById('fileSelect');
      fileListDiv.innerHTML = '';  // 기존 파일 목록을 지움  
      fileSelect.innerHTML = '';  // 파일 선택 드롭다운의 기존 옵션을 지움  

      // 파일 데이터를 반복 처리   
      data.forEach(file => {
        // 파일 이름을 표시하는 div 요소를 생성   
        const fileDiv = document.createElement('div');
        fileDiv.textContent = file.originalname;
        
        // 삭제 버튼을 생성하고 클릭 이벤트 리스너를 추가   
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

        fileDiv.appendChild(deleteButton);  // 삭제 버튼을 파일 div에 추가   
        fileListDiv.appendChild(fileDiv);  // 파일 div를 파일 목록 div에 추가   

        // 파일 선택 드롭다운에 옵션을 추가   
        const option = document.createElement('option');
        option.value = file.id;
        option.textContent = file.originalname;
        fileSelect.appendChild(option);
      });

      // 초기 차트 데이터를 첫 번째 파일, 코어 및 태스크 값으로 로드   
      if (fileSelect.options.length > 0) {
        fileSelect.value = fileSelect.options[0].value;
        const selectedFile = fileSelect.value;
        const selectedCore = document.getElementById('coreSelect').value;
        const selectedTask = document.getElementById('taskSelect').value;
        loadChartData(selectedFile, selectedCore, selectedTask);  // 차트 데이터를 로드   
      }
    })
    .catch(error => {
      console.error('Error:', error);  // 오류가 발생하면 콘솔에 출력   
    });
}

// 페이지 초기 로드 시 파일 목록을 로드   
loadFileList();
