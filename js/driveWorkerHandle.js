// URLs for the Worker
        // const LIST_URL = 'https://drivequerylist.kylecloudservices.com'; // Replace with the Worker URL for listing files
        const getListURL = 'https://drivequerylist.kylecloudservices.com'; // Replace with the Worker URL for listing files
        // const DELETE_URL = 'https://driveworker.kylecloudservices.com'; // Replace with the Worker URL for deleting files
        const workerURL = 'https://driveworker.kylecloudservices.com'; // Replace with the Worker URL for deleting files
        // const AUTH_SECRET_KEY = ''; // Replace with your secret key
        const fileListElement = document.getElementById('fileList');
        const resultDiv = document.getElementById('result');
        const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

        function showMessage(message, type = 'success') {
            resultDiv.style.display = 'block';
            resultDiv.className = `alert alert-${type}`;
            resultDiv.textContent = message;
        }

        function showNotification(message, alertType) {
            resultDiv.style.display = 'block';
            resultDiv.className = `alert alert-${alertType}`;
            resultDiv.textContent = message;
        }

        function sanitizeFileName(fileName) {
            // 移除文件名中的无效字符
            return fileName.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
        }

        function truncateFileName(fileName) {
            return fileName.substring(0, 6);
        }

        async function fetchFileList() {
            try {
                const response = await fetch(getListURL, {
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                const files = await response.json();
                
                displayFiles(files);
            } catch (error) {
                showMessage(`获取文件列表失败（不是你的问题）: ${error.message}`, 'danger');
            }
        }

        async function fetchValidationList() {
            try {
                const response = await fetch(getListURL, {
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch validation JSON: ${response.statusText}`);
                }
                
                return await response.json();
            } catch (error) {
                showMessage(`获取文件列表失败（不是你的问题）: ${error.message}`, 'danger');
                throw error;
            }
        }

        // function displayFileList(files) {
        //     fileListElement.innerHTML = ''; // Clear the table
        //     files.forEach(file => {
        //         const row = document.createElement('tr');
        //         row.innerHTML = `
        //             <td>${file.key}</td>
        //             <td>
        //                 <button class="btn btn-danger btn-sm" onclick="deleteFile('${file.key}')">Delete</button>
        //             </td>
        //         `;
        //         fileListElement.appendChild(row);
        //     });
        // }


        function displayFiles(files) {
            const tableBody = document.getElementById('fileList');
            tableBody.innerHTML = ''; // Clear any existing rows

            files.forEach(file => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${file.key}</td>
                    <td>${file.size}</td>
                    <td>${new Date(file.lastModified).toLocaleString()}</td>
                    <td>
                        <button class="btn btn-primary" onclick="downloadFile('${file.key}')">下载</button>
                        <button class="btn btn-danger" onclick="deleteFile('${file.key}')">删除</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }



        async function deleteFile(fileName) {
            const confirmation = confirm(`确定要删除 ${fileName} 吗?`);
            if (!confirmation) return;

            try {
                const response = await fetch(`${workerURL}/${encodeURIComponent(fileName)}`, {
                    method: 'DELETE',
                    headers: { 'X-Custom-Auth-Key': '123'},
                });

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                showMessage(`"${fileName}" 删除成功！`);
                fetchFileList(); // Refresh the file list  
            } catch (error) {
                showMessage(`删除失败 (不是你的问题) ${error.message} `, 'danger');
            }

            // try {
            //     const response = await fetch(`${DELETE_URL}/${encodeURIComponent(fileName)}`, {
            //         method: 'DELETE',
            //     });

            //     if (!response.ok) {
            //         throw new Error(await response.text());
            //     }

            //     showMessage(`文件 "${fileName}" deleted successfully.`);
            //     fetchFileList(); // Refresh the file list
            // } catch (error) {
            //     showMessage(`Error deleting file: ${error.message}`, 'danger');
            // }
        }

        async function uploadFile(event) {
            event.preventDefault(); // Prevent form submission

            const fileInput = document.getElementById('uploadFile');
            const file = fileInput.files[0];

            if (!file) {
                showMessage('请先选择一个文件', 'danger');
                return;
            }

            // Restrict file size
            if (file.size > MAX_FILE_SIZE) {
                showMessage('文件大小请小于 100 MB', 'danger');
                return;
            }

            const originalFileName = file.name;
            const sanitizedFileName = sanitizeFileName(originalFileName); // Rename variable to avoid conflict
            const truncatedFileName = truncateFileName(sanitizedFileName);

            const fileKey = truncatedFileName;

            

            // const fileKey = sanitizedFileName;

            // Automatically use the file's name as the file key
            // const fileKey = file.name;

            try {
                // Proceed with file upload
                const response = await fetch(`${workerURL}/${encodeURIComponent(fileKey)}`, {
                    method: 'PUT',
                    headers: {
                        'X-Custom-Auth-Key': '123',
                        'Content-Type': file.type || 'application/octet-stream',
                    },
                    body: file,
                });

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                showMessage(` "${fileKey}" 上传成功，页面3秒后刷新。`);
                setTimeout(() => {
                    location.reload();
                }, 3000); // 1-second delay for user to read the success message
            } catch (error) {
                showMessage(`上传失败（不是你的问题） ${error.message}`, 'danger');
            }
        }

        async function downloadFile(fileKey) {
            try {
                const response = await fetch(`driveworker.kylecloudservices.com/${fileKey}`, {
                     method: 'GET' 
                    }); // Adjust your worker URL here
                const fileBlob = await response.blob();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(fileBlob);
                link.download = fileKey;
                link.click();
            } catch (error) {
                console.error('Error downloading file:', error);
                alert('UPLODE ERR.');
            }
        }
