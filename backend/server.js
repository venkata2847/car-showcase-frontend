const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Serve static files from uploads folder
app.use('/uploads', express.static(uploadDir));

// Sample car data with image paths
let cars = [
  { 
    id: 1, 
    name: "Toyota Corolla", 
    brand: "Toyota", 
    model: "Corolla", 
    year: 2023, 
    price: 20000, 
    description: "Compact car", 
    imageUrl: "/uploads/toyota-corolla.jpg", 
    status: "available", 
    features: ["Airbags", "ABS"] 
  },
  { 
    id: 2, 
    name: "Honda Civic", 
    brand: "Honda", 
    model: "Civic", 
    year: 2022, 
    price: 22000, 
    description: "Sedan car", 
    imageUrl: "/uploads/honda-civic.jpg", 
    status: "available", 
    features: ["Sunroof", "Leather Seats"] 
  },
  { 
    id: 3, 
    name: "BMW X5", 
    brand: "BMW", 
    model: "X5", 
    year: 2023, 
    price: 55000, 
    description: "Luxury SUV", 
    imageUrl: "/uploads/bmw-x5.jpg", 
    status: "available", 
    features: ["All-Wheel Drive", "Navigation"] 
  }
];

// Routes

// Get all cars
app.get('/api/cars', (req, res) => res.json(cars));

// Get car by ID
app.get('/api/cars/:id', (req, res) => {
  const car = cars.find(c => c.id === parseInt(req.params.id));
  if (!car) return res.status(404).json({ error: 'Car not found' });
  res.json(car);
});

// Add a new car (with optional image upload)
app.post('/api/cars', upload.single('image'), (req, res) => {
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
  const newCar = { id: cars.length + 1, ...req.body, imageUrl };
  cars.push(newCar);
  res.status(201).json(newCar);
});

// Update a car by ID
app.put('/api/cars/:id', upload.single('image'), (req, res) => {
  const index = cars.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Car not found' });

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : cars[index].imageUrl;
  cars[index] = { ...cars[index], ...req.body, imageUrl };
  res.json(cars[index]);
});

// Delete a car by ID
app.delete('/api/cars/:id', (req, res) => {
  const index = cars.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Car not found' });

  // Optionally delete image from uploads folder
  const deletedCar = cars.splice(index, 1)[0];
  if (deletedCar.imageUrl) {
    const filePath = path.join(__dirname, deletedCar.imageUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  res.json(deletedCar);
});

// Upload image only (optional separate endpoint)
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.listen(PORT, () => console.log(`Backend server running at http://localhost:${PORT}`));