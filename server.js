const express = require('express');  
const multer = require('multer');  
const mysql = require('mysql2');  
const path = require('path');  
const fs = require('fs');  
const app = express();  
const upload = multer({ dest: 'uploads/' });

// MySQL 데이터베이스 설정
const db = mysql.createConnection({
  host: 'localhost',
  user: 'my_user',
  password: '*******',
  database: 'my_database'
});

// 데이터베이스에 연결
db.connect(err => {
  if (err) {
    console.error('MySQL 연결 실패:', err);
    return;
  }
  console.log('MySQL 연결 성공');
});

// 테이블이 존재하지 않으면 생성
const createProfileTableQuery = `
  CREATE TABLE IF NOT EXISTS profile_data (
    core VARCHAR(255),
    task1 INT,
    task2 INT,
    task3 INT,
    task4 INT,
    task5 INT
  )
`;

const createFileTableQuery = `
  CREATE TABLE IF NOT EXISTS file_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255),
    originalname VARCHAR(255)
  )
`;

// profile_data 테이블을 생성 
db.query(createProfileTableQuery, err => {
  if (err) {
    console.error('profile_data 테이블 생성 오류:', err);
  }
});

// file_data 테이블을 생성 
db.query(createFileTableQuery, err => {
  if (err) {
    console.error('file_data 테이블 생성 오류:', err);
  }
});

app.use(express.static('public'));  // public 디렉토리를 정적 파일 제공을 위해 설정 

// 파일 업로드를 처리 
app.post('/upload', upload.single('profile'), (req, res) => {
  const filePath = path.join(__dirname, req.file.path);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('File read error');
    }

    const sections = data.split('\n\n').filter(section => section.trim());

    // 파일의 각 섹션을 처리 
    sections.forEach(section => {
      const lines = section.split('\n').filter(line => line.trim());
      lines.slice(1).forEach(line => {
        const [core, task1, task2, task3, task4, task5] = line.split(/\s+/).map(item => item.trim());
        if (core && task1 && task2 && task3 && task4 && task5) {
          const query = `INSERT INTO profile_data (core, task1, task2, task3, task4, task5) VALUES (?, ?, ?, ?, ?, ?)`;
          db.query(query, [core, task1, task2, task3, task4, task5], err => {
            if (err) {
              console.error('profile_data 삽입 오류:', err);
            }
          });
        }
      });
    });

    const query = `INSERT INTO file_data (filename, originalname) VALUES (?, ?)`;
    db.query(query, [req.file.filename, req.file.originalname], err => {
      if (err) {
        console.error('file_data 삽입 오류:', err);
      }
    });

    fs.unlinkSync(filePath);  // 파일을 삭제 

    res.send('파일이 정상적으로 업로드 되었습니다.');
  });
});

// 업로드된 파일 목록을 가져옴
app.get('/files', (req, res) => {
  const query = `SELECT id, originalname FROM file_data`;
  db.query(query, (err, rows) => {
    if (err) {
      return res.status(500).send('데이터 베이스를 읽는 도중 오류가 발생하였습니다.');
    }
    res.json(rows);
  });
});

// 파일을 삭제 
app.delete('/files/:id', (req, res) => {
  const id = req.params.id;
  const query = `DELETE FROM file_data WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).send('Database delete error');
    }
    res.send('파일이 정상적으로 삭제되었습니다.');
  });
});

// profile_data 테이블의 데이터를 요약하여 가져옴
app.get('/data', (req, res) => {
  const query = `
    SELECT core,
           MIN(task1) AS min_task1, MAX(task1) AS max_task1, AVG(task1) AS avg_task1,
           MIN(task2) AS min_task2, MAX(task2) AS max_task2, AVG(task2) AS avg_task2,
           MIN(task3) AS min_task3, MAX(task3) AS max_task3, AVG(task3) AS avg_task3,
           MIN(task4) AS min_task4, MAX(task4) AS max_task4, AVG(task4) AS avg_task4,
           MIN(task5) AS min_task5, MAX(task5) AS max_task5, AVG(task5) AS avg_task5
    FROM profile_data
    GROUP BY core
  `;
  db.query(query, (err, rows) => {
    if (err) {
      return res.status(500).send('데이터 베이스를 읽는 도중 오류가 발생하였습니다.');
    }
    res.json(rows);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
