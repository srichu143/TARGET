const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'wishes.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Helper to read wishes
const readWishes = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

// Helper to write wishes
const writeWishes = (wishes) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(wishes, null, 2));
};

// GET /api/wishes
app.get('/api/wishes', (req, res) => {
    const wishes = readWishes();
    res.json(wishes);
});

// POST /api/wishes
app.post('/api/wishes', (req, res) => {
    const { name, wish } = req.body;
    if (!name || !wish) {
        return res.status(400).json({ error: 'Name and wish are required' });
    }
    const wishes = readWishes();
    const newWish = { id: Date.now(), name, wish };
    wishes.push(newWish);
    writeWishes(wishes);
    res.status(201).json(newWish);
});

// PUT /api/wishes/:id
app.put('/api/wishes/:id', (req, res) => {
    const { id } = req.params;
    const { name, wish } = req.body;
    const wishes = readWishes();
    const index = wishes.findIndex(w => w.id == id);

    if (index !== -1) {
        wishes[index] = { ...wishes[index], name, wish };
        writeWishes(wishes);
        res.json(wishes[index]);
    } else {
        res.status(404).json({ error: 'Wish not found' });
    }
});

// DELETE /api/wishes/:id
app.delete('/api/wishes/:id', (req, res) => {
    const { id } = req.params;
    let wishes = readWishes();
    const initialLength = wishes.length;
    wishes = wishes.filter(w => w.id != id);

    if (wishes.length < initialLength) {
        writeWishes(wishes);
        res.status(204).send();
    } else {
        res.status(404).json({ error: 'Wish not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
