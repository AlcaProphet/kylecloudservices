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

        function convertBits(bits) {
            if (bits < 1e3) {
                return `${bits} bits`; // Less than 1 kilobit
            } else if (bits < 1e6) {
                return `${(bits / 1e3).toFixed(2)} kb`; // Convert to kilobits
            } else if (bits < 1e9) {
                return `${(bits / 1e6).toFixed(2)} mb`; // Convert to megabits
            } else {
                return `${(bits / 1e9).toFixed(2)} gb`; // Convert to gigabits
            }
        }

        function sanitizeFileName(fileName) {
            // 移除文件名中的无效字符
            return fileName.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
        }

        function truncateFileName(fileName) {
            return fileName.substring(0, 20);
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
                
                // displayFiles(files);
                // displayFileCard(files);
                displayFileListSmall(files);
                displayFileListLarge(files);
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

        function displayFileListSmall(files) { 
            const cardBody = document.getElementById('fileCardContainerSmall');
            cardBody.innerHTML = ''; // Clear any existing rows
            files.forEach(file => {
                const card = document.createElement('div');
                card.className = 'card mb-1';
                card.style = 'Padding: 1rem';
                card.innerHTML = `
                    <div class="row justify-content-between align-items-center">
                        <div class="col-6">
                            <p class="card-text">${file.key}</p>
                        </div>
                        <div class="col-6">
                            <div class="row justify-content-center">
                                <button type="button" class="btn btn-sm btn-outline-primary mb-1 col-5" onclick="downloadFile('${file.key}')">下载</button>
                                <div class="w-100"></div>
                                <button type="button" class="btn btn-sm btn-outline-success mb-1 col-5" onclick="downloadFile('${file.key}')">分享</button>
                                <div class="w-100"></div>
                                <button type="button" class="btn btn-sm btn-outline-danger mb-1 col-5" onclick="deleteFile('${file.key}')">删除</button>                                </div>
                            </div>
                        </div>
                    </div>
                `;
                cardBody.appendChild(card);
            });
        }

        function displayFileListLarge(files) {
            const cardBody = document.getElementById('fileCardContainerLarge');
            cardBody.innerHTML = ''; // Clear any existing rows
            files.forEach(file => {
                const card = document.createElement('div');
                card.className = 'card mb-1';
                card.style = 'Padding: 1rem';
                card.innerHTML = `
                    <div class="row justify-content-start align-items-center">
                        <div class="col-8">
                            <p class="card-text mb-1">${file.key}，大小：${convertBits(file.size)}，上传时间：${new Date(file.lastModified).toLocaleString()}</p>
                        </div>
                        <div class="col-4">
                            <button class="btn btn-outline-primary col mb-1" onclick="downloadFile('${file.key}')">下载</button>
                            <button class="btn btn-outline-success col mb-1" onclick="downloadFile('${file.key}')">分享</button>
                            <button class="btn btn-outline-danger col mb-1" onclick="deleteFile('${file.key}')">删除</button>
                        </div>
                    </div>
                `;
                cardBody.appendChild(card);
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