const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let worldSize = 1000;
let zoom = 1;
const maxZoom = 5;
const minZoom = 0.1;

// Mass scaling factor: 1 unit of food mass equals 100 units of player mass
const MASS_SCALING_FACTOR = 100;

const food = [];
const foodCount = 1000;
const aiPlayers = [];
const aiPlayerCount = 9; // 9 AI players + 1 human player = 10 total

let mouseX = 0;
let mouseY = 0;

// Constants
const LEARNING_RATE = 0.01;
const MIN_MASS_RATIO = 1.1;




//-------------------------------------------------------------//
//                  Player Settings
//-------------------------------------------------------------//

const player = {
    blobs: [{
        x: worldSize / 2,
        y: worldSize / 2,
        radius: Math.sqrt(100 / Math.PI),  // Initial radius based on the initial mass
        mass: 1000,
        color: 'blue',
        speed: 2,
        dx: 0,
        dy: 0
    }]
};

const camera = {
    x: player.blobs[0].x,
    y: player.blobs[0].y,
    width: 0,
    height: 0
};

// Function to update the radius based on the mass
function updateRadiusFromMass(blob) {
    blob.radius = Math.sqrt(blob.mass / Math.PI);  // Radius is proportional to the square root of the mass
}

function drawPlayer() {
    player.blobs.forEach(blob => {
        updateRadiusFromMass(blob);
        drawCircle(blob.x, blob.y, blob.radius, blob.color);  // Draw using the updated radius
    });
}

// Function to draw a circle on the canvas
function drawCircle(x, y, radius, color) {
    const screenX = (x - camera.x) * zoom + canvas.width / 2;
    const screenY = (y - camera.y) * zoom + canvas.height / 2;
    ctx.beginPath();
    ctx.arc(screenX, screenY, radius * zoom, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}
let lastMergeTime = Date.now(); // Track the last merge time



function movePlayer() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
        const speedFactor = Math.min(distance, 50) / 50;
        player.blobs.forEach(blob => {
            const moveX = (dx / distance) * blob.speed * speedFactor;
            const moveY = (dy / distance) * blob.speed * speedFactor;
            blob.x = Math.max(blob.radius, Math.min(worldSize - blob.radius, blob.x + moveX + blob.dx));
            blob.y = Math.max(blob.radius, Math.min(worldSize - blob.radius, blob.y + moveY + blob.dy));
            blob.dx *= 0.95;
            blob.dy *= 0.95;
        });

        const avgX = player.blobs.reduce((sum, blob) => sum + blob.x, 0) / player.blobs.length;
        const avgY = player.blobs.reduce((sum, blob) => sum + blob.y, 0) / player.blobs.length;
        camera.x = avgX;
        camera.y = avgY;
    }

    // Repulsion between blobs to avoid overlap
    const repulsionForce = 0.5; // Adjust as needed
    for (let i = 0; i < player.blobs.length; i++) {
        for (let j = i + 1; j < player.blobs.length; j++) {
            const dx = player.blobs[i].x - player.blobs[j].x;
            const dy = player.blobs[i].y - player.blobs[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = player.blobs[i].radius + player.blobs[j].radius;

            if (distance < minDistance) {
                const overlap = minDistance - distance;
                const force = repulsionForce * overlap;
                const angle = Math.atan2(dy, dx);
                player.blobs[i].x += Math.cos(angle) * force;
                player.blobs[i].y += Math.sin(angle) * force;
                player.blobs[j].x -= Math.cos(angle) * force;
                player.blobs[j].y -= Math.sin(angle) * force;
            }
        }
    }

    // Attraction between player's blobs
    const attractionForce = 0.05; // Base attraction force
    player.blobs.forEach((blob1, index1) => {
        player.blobs.forEach((blob2, index2) => {
            if (index1 >= index2) return; // Avoid duplicate calculations
            const dx = blob1.x - blob2.x;
            const dy = blob1.y - blob2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = blob1.radius + blob2.radius;

            if (distance > minDistance) {
                // Calculate attraction force based on mass
                const force = attractionForce * (blob2.mass / blob1.mass);
                const angle = Math.atan2(dy, dx);
                blob1.dx -= (dx / distance) * force;
                blob1.dy -= (dy / distance) * force;
                blob2.dx += (dx / distance) * force;
                blob2.dy += (dy / distance) * force;
            }
        });
    });

    // Merge blobs every 5 seconds
    const currentTime = Date.now();
    if (currentTime - lastMergeTime > 5000) {
        for (let i = 0; i < player.blobs.length; i++) {
            for (let j = i + 1; j < player.blobs.length; j++) {
                const dx = player.blobs[i].x - player.blobs[j].x;
                const dy = player.blobs[i].y - player.blobs[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = player.blobs[i].radius + player.blobs[j].radius;

                if (distance < minDistance) {
                    // Merge the two blobs
                    player.blobs[i].mass += player.blobs[j].mass;
                    player.blobs[i].radius = Math.sqrt(player.blobs[i].mass / Math.PI);
                    player.blobs.splice(j, 1); // Remove the merged blob
                    j--; // Adjust index after removing an element
                }
            }
        }
        lastMergeTime = currentTime; // Reset the merge timer
    }
}


//-------------------------------------------------------------//



//-------------------------------------------------------------//
//                          Food 
//-------------------------------------------------------------//

function generateFood() {
    for (let i = 0; i < foodCount; i++) {
        food.push({
            x: Math.random() * worldSize,
            y: Math.random() * worldSize,
            radius: 2,
            mass: Math.random() * 50 + 1,
            color: `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`
        });
    }
}

function drawFood() {
    food.forEach(f => {
        if (isOnScreen(f)) {
            drawCircle(f.x, f.y, f.radius, f.color);
        }
    });
}


function eatFood(blobs, foodArray) {
    blobs.forEach(blob => {
        foodArray.forEach((f, index) => {
            const dx = blob.x - f.x;
            const dy = blob.y - f.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < blob.radius) {
                foodArray.splice(index, 1); // Remove the eaten food
                blob.mass += f.mass;
                updateRadiusFromMass(blob); // Update the radius based on the new mass
                
                // Respawn food
                foodArray.push({
                    x: Math.random() * worldSize,
                    y: Math.random() * worldSize,
                    radius: Math.random() * 3 + 1,
                    mass: Math.random() * 50 + 1,
                    color: `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`
                });
            }
        });
    });
}


//-------------------------------------------------------------//
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    camera.width = canvas.width / zoom;
    camera.height = canvas.height / zoom;
}

function generateAIPlayers(count) {
    for (let i = 0; i < count; i++) {
        aiPlayers.push({
            blobs: [{
                x: Math.random() * worldSize,
                y: Math.random() * worldSize,
                radius: 100,
                mass: 100,
                color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
                speed: 1.5,
                dx: 0,
                dy: 0
            }],
            name: `Player ${i + 1}`
        });
    }
}



// Draw AI players
function drawAIPlayers() {
    aiPlayers.forEach(ai => {
        ai.blobs.forEach(blob => {
            if (isOnScreen(blob)) {
                drawCircle(blob.x, blob.y, blob.radius, blob.color);
                const screenX = (blob.x - camera.x) * zoom + canvas.width / 2;
                const screenY = (blob.y - camera.y) * zoom + canvas.height / 2;
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.fillText(ai.name, screenX, screenY - blob.radius * zoom - 5);
            }
        });
    });
}

function isOnScreen(obj) {
    return obj.x >= camera.x - camera.width / 2 - obj.radius &&
           obj.x <= camera.x + camera.width / 2 + obj.radius &&
           obj.y >= camera.y - camera.height / 2 - obj.radius &&
           obj.y <= camera.y + camera.height / 2 + obj.radius;
}

function moveAIPlayers() {
    aiPlayers.forEach(ai => {
        // Simple AI: move towards the nearest food
        const nearestFood = food.reduce((nearest, f) => {
            const dx = ai.blobs[0].x - f.x;
            const dy = ai.blobs[0].y - f.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < nearest.distance ? {food: f, distance: distance} : nearest;
        }, {food: null, distance: Infinity});

        if (nearestFood.food) {
            const dx = nearestFood.food.x - ai.blobs[0].x;
            const dy = nearestFood.food.y - ai.blobs[0].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            ai.blobs[0].x += (dx / distance) * ai.blobs[0].speed;
            ai.blobs[0].y += (dy / distance) * ai.blobs[0].speed;
        }

        // Contain AI within world bounds
        ai.blobs[0].x = Math.max(ai.blobs[0].radius, Math.min(worldSize - ai.blobs[0].radius, ai.blobs[0].x));
        ai.blobs[0].y = Math.max(ai.blobs[0].radius, Math.min(worldSize - ai.blobs[0].radius, ai.blobs[0].y));
    });
}

function drawBorder() {
    const startX = -camera.x * zoom + canvas.width / 2;
    const startY = -camera.y * zoom + canvas.height / 2;
    const endX = (worldSize - camera.x) * zoom + canvas.width / 2;
    const endY = (worldSize - camera.y) * zoom + canvas.height / 2;
    
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, endX - startX, endY - startY);
}

function updateDashboard() {
    const totalMass = player.blobs.reduce((sum, blob) => sum + blob.mass, 0);
    document.getElementById('mass').textContent = totalMass.toFixed(0);
    const avgX = player.blobs.reduce((sum, blob) => sum + blob.x, 0) / player.blobs.length;
    const avgY = player.blobs.reduce((sum, blob) => sum + blob.y, 0) / player.blobs.length;
    document.getElementById('location').textContent = `(${avgX.toFixed(0)}, ${avgY.toFixed(0)})`;
    document.getElementById('zoom').textContent = zoom.toFixed(2);
}

function updateLeaderboard() {
    const allPlayers = [
        ...aiPlayers.map(ai => ({ name: ai.name, mass: ai.blobs.reduce((sum, blob) => sum + blob.mass, 0) })),
        { name: 'You', mass: player.blobs.reduce((sum, blob) => sum + blob.mass, 0) }
    ];
    
    // Sort players by mass (descending order)
    allPlayers.sort((a, b) => b.mass - a.mass);
    
    // Get top 10 players
    const top10 = allPlayers.slice(0, 10);
    
    // Create leaderboard HTML and highlight the player "You"
    const leaderboardHTML = top10.map(p => {
        if (p.name === 'You') {
            return `<li style="font-weight: bold; color: rgb(255, 77, 0);">${p.name}: ${p.mass.toFixed(0)}</li>`;
        } else {
            return `<li>${p.name}: ${p.mass.toFixed(0)}</li>`;
        }
    }).join('');
    
    // Update leaderboard UI
    document.getElementById('top-players').innerHTML = leaderboardHTML;
}


function split() {
    const newBlobs = [];
    player.blobs.forEach(blob => {
        if (blob.mass >= 20) {
            const angle = Math.atan2(mouseY - canvas.height / 2, mouseX - canvas.width / 2);
            const newBlob = {
                x: blob.x + Math.cos(angle) * blob.radius,
                y: blob.y + Math.sin(angle) * blob.radius,
                radius: blob.radius / Math.sqrt(2),
                mass: blob.mass / 2,
                color: blob.color,
                speed: blob.speed,
                dx: Math.cos(angle) * 10,
                dy: Math.sin(angle) * 10,
                splitTime: Date.now()
            };
            blob.radius /= Math.sqrt(2);
            blob.mass /= 2;
            blob.splitTime = Date.now();
            newBlobs.push(newBlob);
        }
    });
    player.blobs = [...player.blobs, ...newBlobs];
}


function eatPlayers() {
    // Player eating AI
    player.blobs.forEach(playerBlob => {
        aiPlayers.forEach((ai, aiIndex) => {
            ai.blobs.forEach((aiBlob, blobIndex) => {
                const dx = playerBlob.x - aiBlob.x;
                const dy = playerBlob.y - aiBlob.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < playerBlob.radius && playerBlob.mass > aiBlob.mass * 1.1) {
                    playerBlob.mass += aiBlob.mass;
                    playerBlob.radius = Math.sqrt(playerBlob.mass / Math.PI);
                    ai.blobs.splice(blobIndex, 1);
                    if (ai.blobs.length === 0) {
                        aiPlayers.splice(aiIndex, 1);
                        console.log("You ate an AI player " + ai.name);
                        generateAIPlayers(1); // Respawn one AI player
                    }
                }
            });
        });
    });

    // AI eating player
    aiPlayers.forEach(ai => {
        ai.blobs.forEach(aiBlob => {
            player.blobs.forEach((playerBlob, index) => {
                const dx = aiBlob.x - playerBlob.x;
                const dy = aiBlob.y - playerBlob.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < aiBlob.radius && aiBlob.mass > playerBlob.mass * 1.1) {
                    aiBlob.mass += playerBlob.mass;
                    aiBlob.radius = Math.sqrt(aiBlob.mass / Math.PI);
                    player.blobs.splice(index, 1);
                }
            });
        });
    });

    // AI eating other AI
    for (let i = 0; i < aiPlayers.length; i++) {
        for (let j = i + 1; j < aiPlayers.length; j++) {
            aiPlayers[i].blobs.forEach(blob1 => {
                aiPlayers[j].blobs.forEach((blob2, index) => {
                    const dx = blob1.x - blob2.x;
                    const dy = blob1.y - blob2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < blob1.radius && blob1.mass > blob2.mass * 1.1) {
                        blob1.mass += blob2.mass;
                        blob1.radius = Math.sqrt(blob1.mass / Math.PI);
                        aiPlayers[j].blobs.splice(index, 1);
                        if (aiPlayers[j].blobs.length === 0) {
                            aiPlayers.splice(j, 1);
                            j--;
                            console.log("AI player ate another AI player", aiPlayers[i].name);
                            generateAIPlayers(1); // Respawn one AI player
                        }
                    }
                });
            });
        }
    }

    // Update AI behavior based on performance
    aiPlayers.forEach(ai => {
        const totalMass = ai.blobs.reduce((sum, blob) => sum + blob.mass, 0);
        ai.aggressiveness += LEARNING_RATE * (totalMass / ai.initialMass - 1);
        ai.caution += LEARNING_RATE * (1 - totalMass / ai.initialMass);
        
        // Clamp values to prevent extreme behavior
        ai.aggressiveness = Math.max(0, Math.min(0.5, ai.aggressiveness));
        ai.caution = Math.max(0, Math.min(0.5, ai.caution));
    });
}

function gameOver() {
    document.getElementById('game-over').classList.add('active');
    document.getElementById('gameCanvas').style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('leaderboard').style.display = 'none';
}






function restartGame() {
    player.blobs = [{
        x: worldSize / 2,
        y: worldSize / 2,
        radius: 20,
        mass: 400,
        color: 'blue',
        speed: 2,
        dx: 0,
        dy: 0
    }];
    aiPlayers.length = 0;
    generateAIPlayers(10);
    food.length = 0;
    generateFood();
}


function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    movePlayer();
    moveAIPlayers();
    drawBorder();
    drawFood();
    drawAIPlayers();
    drawPlayer();
    eatFood(player.blobs, food);

    
    aiPlayers.forEach(ai => eatFood(ai.blobs, food));
    eatPlayers();
    updateDashboard();
    updateLeaderboard();

    if (player.blobs.length === 0) {
        gameOver();
        canvas.addEventListener('click', restartGame, { once: true });
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFood();
    drawPlayer();
    drawAIPlayers();
    drawBorder();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

function handleMouseMove(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
}

function handleMouseWheel(event) {
    zoom += event.deltaY * -0.001;
    zoom = Math.min(Math.max(minZoom, zoom), maxZoom);
    camera.width = canvas.width / zoom;
    camera.height = canvas.height / zoom;
}

function handleSplit() {
    split();
}



//-------------------------------------------------------------//
//                        Event listeners
//-------------------------------------------------------------//
window.addEventListener('resize', resizeCanvas);
window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('wheel', handleMouseWheel);

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        split();
    }
});


//-------------------------------------------------------------//
//                        Initialization                       // 
//-------------------------------------------------------------//  
resizeCanvas();
generateFood();
generateAIPlayers(10);
loop();