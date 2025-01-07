        // URLs for the Worker
        // const LIST_URL = 'https://drivequerylist.kylecloudservices.com'; // Replace with the Worker URL for listing files
        const getListURL = 'https://drivequerylist.kylecloudservices.com'; // Replace with the Worker URL for listing files
        // const DELETE_URL = 'https://driveworker.kylecloudservices.com'; // Replace with the Worker URL for deleting files
        const workerURL = 'https://driveworker.kylecloudservices.com'; // Replace with the Worker URL for deleting files
        // const AUTH_SECRET_KEY = ''; // Replace with your secret key
        const fileListElement = document.getElementById('fileList');
        const resultDiv = document.getElementById('result');

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