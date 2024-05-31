// DOMContentLoaded 이벤트가 발생하면 초기 설정 함수들을 호출
document.addEventListener('DOMContentLoaded', () => {
  loadCoreAndTaskOptions(); // 초기 로드 시 코어와 태스크 옵션을 로드
  loadFileList(); // 초기 로드 시 파일 목록을 로드 
});

// fileSelect 요소의 변경 이벤트 리스너를 추가
document.getElementById('fileSelect').addEventListener('change', () => {
  const selectedFile = document.getElementById('fileSelect').value;
  const selectedCore = document.getElementById('coreSelect').value;
  const selectedTask = document.getElementById('taskSelect').value;
  loadChartData(selectedFile, selectedCore, selectedTask);
});

// coreSelect 요소의 변경 이벤트 리스너를 추가
document.getElementById('coreSelect').addEventListener('change', () => {
  const selectedFile = document.getElementById('fileSelect').value;
  const selectedCore = document.getElementById('coreSelect').value;
  const selectedTask = document.getElementById('taskSelect').value;
  loadChartData(selectedFile, selectedCore, selectedTask);
});

// taskSelect 요소의 변경 이벤트 리스너를 추가
document.getElementById('taskSelect').addEventListener('change', () => {
  const selectedFile = document.getElementById('fileSelect').value;
  const selectedCore = document.getElementById('coreSelect').value;
  const selectedTask = document.getElementById('taskSelect').value;
  loadChartData(selectedFile, selectedCore, selectedTask);
});

let chart; // 전역 변수로 chart 선언

// 코어와 태스크 옵션을 로드하는 함수
function loadCoreAndTaskOptions() {
  fetch('/data') // '/data' 엔드포인트에서 데이터를 가져옴
    .then(response => response.json()) // 서버 응답을 JSON으로 변환
    .then(data => {
      const coreSelect = document.getElementById('coreSelect');
      const taskSelect = document.getElementById('taskSelect');

      // 기존 옵션을 지움
      coreSelect.innerHTML = '';
      taskSelect.innerHTML = '';

      // 유니크한 코어 값을 추출
      const cores = data.map(d => d.core);
      cores.forEach(core => {
        const option = document.createElement('option');
        option.value = core;
        option.textContent = core;
        coreSelect.appendChild(option);
      });

      // task1, task2, task3, task4, task5를 고정된 태스크로 가정
      const tasks = ['task1', 'task2', 'task3', 'task4', 'task5'];
      tasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task;
        option.textContent = task;
        taskSelect.appendChild(option);
      });

      // 초기 차트 데이터를 첫 번째 코어와 태스크로 로드
      loadChartData(coreSelect.value, taskSelect.value);
    })
    .catch(error => {
      console.error('Error:', error); // 오류가 발생하면 콘솔에 출력
    });
}

// 파일 목록을 로드하는 함수
function loadFileList() {
  fetch('/files') // '/files' 엔드포인트에서 파일 목록을 가져옴
    .then(response => response.json()) // 서버 응답을 JSON으로 변환
    .then(data => {
      const fileListDiv = document.getElementById('fileList');
      const fileSelect = document.getElementById('fileSelect');
      fileListDiv.innerHTML = ''; // 기존 파일 목록을 지움
      fileSelect.innerHTML = ''; // 파일 선택 드롭다운의 기존 옵션을 지움

      // 파일 데이터를 반복 처리
      data.forEach(file => {
        // 파일 이름을 표시하는 div 요소를 생성
        const fileDiv = document.createElement('div');
        fileDiv.textContent = file.originalname;
        
        // 삭제 버튼을 생성하고 클릭 이벤트 리스너를 추가
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '삭제';
        deleteButton.addEventListener('click', () => {
          // 파일 삭제 요청을 보냅니다.
          fetch(`/files/${file.id}`, {
            method: 'DELETE'
          })
          .then(response => response.text()) // 서버 응답을 텍스트로 변환
          .then(result => {
            alert(result); // 응답 결과를 알림으로 표시
            loadFileList(); // 파일 삭제 후 파일 목록을 다시 로드
          })
          .catch(error => {
            console.error('Error:', error); // 오류가 발생하면 콘솔에 출력
          });
        });

        fileDiv.appendChild(deleteButton); // 삭제 버튼을 파일 div에 추가
        fileListDiv.appendChild(fileDiv); // 파일 div를 파일 목록 div에 추가

        // 파일 선택 드롭다운에 옵션을 추가
        const option = document.createElement('option');
        option.value = file.id;
        option.textContent = file.originalname;
        fileSelect.appendChild(option);
      });

      // 초기 차트 데이터를 첫 번째 파일, 코어 및 태스크 값으로 로드
      loadChartData(fileSelect.value, coreSelect.value, taskSelect.value);
    })
    .catch(error => {
      console.error('Error:', error); // 오류가 발생하면 콘솔에 출력
    });
}

// 차트 데이터를 로드하는 함수
function loadChartData(fileId, core, task) {
  fetch('/data') // '/data' 엔드포인트에서 데이터를 가져옴
    .then(response => response.json()) // 서버 응답을 JSON으로 변환
    .then(data => {
      // 선택된 코어에 해당하는 데이터를 찾습니다.
      const selectedData = data.find(d => d.core === core);
      const taskMin = selectedData[`min_${task}`];
      const taskMax = selectedData[`max_${task}`];
      const taskAvg = selectedData[`avg_${task}`];

      const ctx = document.getElementById('myChart').getContext('2d');
      
      if (chart) {
        chart.destroy(); // 기존 차트가 있으면 지움
      }

      // 새로운 차트를 생성
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['최소값', '최대값', '평균값'],
          datasets: [
            {
              label: `${task} 값`,
              data: [taskMin, taskMax, taskAvg],
              borderColor: 'blue',
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: '종류'
              }
            },
            y: {
              title: {
                display: true,
                text: '값'
              }
            }
          }
        }
      });
    })
    .catch(error => {
      console.error('Error:', error); // 오류가 발생하면 콘솔에 출력
    });
}
