function simulate() {
    let head = parseInt(document.getElementById('head').value);
    let requests = document.getElementById('requests').value.split(' ').map(Number);
    let algorithm = document.getElementById('algorithm').value;
    let outputDiv = document.getElementById('output');

    if (isNaN(head) || requests.some(isNaN)) {
        outputDiv.innerHTML = '<p style="color:red;">Please enter valid numbers.</p>';
        return;
    }

    let result = {};
    
    if (algorithm === 'fcfs') result = fcfs(head, requests);
    else if (algorithm === 'sstf') result = sstf(head, requests);
    else if (algorithm === 'scan') result = scan(head, requests);
    else if (algorithm === 'cscan') result = cscan(head, requests);

    outputDiv.innerHTML = `<p><strong>Seek Sequence:</strong> ${result.sequence.join(' → ')}</p>
                           <p><strong>Total Seek Time:</strong> ${result.seekTime}</p>`;

    drawChart(result.sequence);
}

// Disk Scheduling Algorithms
function fcfs(head, requests) {
    let seekTime = 0, sequence = [head];
    for (let request of requests) {
        seekTime += Math.abs(request - head);
        head = request;
        sequence.push(request);
    }
    return { sequence, seekTime };
}

function sstf(head, requests) {
    let seekTime = 0, sequence = [head], remaining = [...requests];
    while (remaining.length > 0) {
        remaining.sort((a, b) => Math.abs(a - head) - Math.abs(b - head));
        let next = remaining.shift();
        seekTime += Math.abs(next - head);
        head = next;
        sequence.push(next);
    }
    return { sequence, seekTime };
}
function scan(head, requests) {
    let seekTime = 0, sequence = [head];
    let sortedRequests = [...requests, 0].sort((a, b) => a - b);
    
    let index = sortedRequests.findIndex(req => req >= head);
    let left = sortedRequests.slice(0, index).reverse();
    let right = sortedRequests.slice(index);
    
    let fullSequence = right.concat(left);
    for (let request of fullSequence) {
        seekTime += Math.abs(request - head);
        head = request;
        sequence.push(request);
    }
    return { sequence, seekTime };
}

function cscan(head, requests) {
    let seekTime = 0, sequence = [head];
    let sortedRequests = [...requests, 0, Math.max(...requests)].sort((a, b) => a - b);
    
    let index = sortedRequests.findIndex(req => req >= head);
    let right = sortedRequests.slice(index);
    let left = sortedRequests.slice(0, index);
    
    let fullSequence = right.concat(left);
    for (let request of fullSequence) {
        seekTime += Math.abs(request - head);
        head = request;
        sequence.push(request);
    }
    return { sequence, seekTime };
}


// Chart.js Visualization
function drawChart(sequence) {
    let ctx = document.getElementById('seekChart').getContext('2d');
    if (window.seekChartInstance) window.seekChartInstance.destroy();
    
    window.seekChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sequence.map((_, i) => `Step ${i}`),
            datasets: [{
                label: "Head Movement",
                data: sequence,
                borderColor: "#007bff",
                fill: false,
                tension: 0.3
            }]
        },
        options: {
            scales: {
                x: { title: { display: true, text: 'Steps' } },
                y: { title: { display: true, text: 'Cylinder Position' } }
            }
        }
    });
}
